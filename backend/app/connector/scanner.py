"""
BotpressScanner: orchestration layer implementing the connector contract
required by Section 5 of the take-home spec.

Layering (see DESIGN.md section 2):

    BotpressScanner (this file)   -- orchestration: conversation lifecycle,
                                       polling/SSE wait loop, error mapping,
                                       result shaping
        |
        v
    BotpressChatClient (client.py) -- raw HTTP calls only

This separation is what makes the scanner unit-testable without a network:
tests inject a fake `session` into BotpressChatClient (or a fake client
directly) and assert on `execute_test` / `validate_target` behavior.
"""

from __future__ import annotations

import json
import time
from typing import Optional

import requests

from .client import BotpressChatClient, extract_bot_text, is_bot_message
from .config import BotpressTargetConfig
from .errors import BotpressError, redact_webhook_id, sanitize_error


class BotpressScanner:
    """
    Connector for a single onboarded Botpress resource.

    Conversation lifecycle (see DESIGN.md section 5 for full rationale):

    - On first use, the scanner connects (creates a user) and creates one
      conversation. That conversation is REUSED across subsequent
      `execute_test` calls by default, because:
        * it mirrors a real multi-turn attack session (some adversarial
          prompts depend on prior turns), and
        * it avoids burning free-tier quota / rate limits by re-creating
          users and conversations for every single prompt.
    - Callers that need test isolation between prompts (so the bot's
      memory of a prior adversarial prompt doesn't bias the next one)
      should pass `reset_conversation=True` on the API scan request, which
      calls `reset_conversation()` before each `execute_test`.
    """

    def __init__(self, target_config: dict, client: Optional[BotpressChatClient] = None):
        self.config = BotpressTargetConfig.from_dict(target_config)
        self.client = client or BotpressChatClient(self.config)

        self._user_key: Optional[str] = None
        self._user_id: Optional[str] = None
        self._conversation_id: Optional[str] = None
        self._used_manual_auth_fallback = False

    # ------------------------------------------------------------------
    # Connection setup
    # ------------------------------------------------------------------
    def _ensure_user_key(self) -> str:
        if self._user_key:
            return self._user_key

        if self.config.uses_manual_auth:
            try:
                self._user_key = self.client._derive_manual_user_key()
                self._user_id = self.config.user_id
                return self._user_key
            except Exception:
                # Fall back to anonymous user creation; flagged in metadata.
                self._used_manual_auth_fallback = True

        return self._create_anonymous_user_key()

    def _create_anonymous_user_key(self) -> str:
        try:
            resp = self.client.create_user()
        except requests.exceptions.RequestException as exc:
            raise sanitize_error(exc) from None

        if resp.status_code >= 400:
            raise sanitize_error(Exception(), status_code=resp.status_code)

        body = _safe_json(resp)
        user = body.get("user") or {}
        user_key = body.get("key") or body.get("userKey") or user.get("key")
        if not user_key:
            raise BotpressError("Botpress did not return a usable user key.")

        self._user_key = user_key
        self._user_id = user.get("id") or body.get("userId")
        return user_key

    def _ensure_conversation(self) -> str:
        if self._conversation_id:
            return self._conversation_id

        user_key = self._ensure_user_key()
        try:
            resp = self.client.create_conversation(user_key)
        except requests.exceptions.RequestException as exc:
            raise sanitize_error(exc) from None

        if (
            resp.status_code in (401, 403)
            and self.config.uses_manual_auth
            and not self._used_manual_auth_fallback
        ):
            # The manual-auth derivation is best-effort. If Botpress rejects
            # it, fall back to anonymous chat-user creation so the connector
            # can still scan bots that allow anonymous users.
            self._used_manual_auth_fallback = True
            self._user_key = None
            self._user_id = None
            user_key = self._create_anonymous_user_key()
            try:
                resp = self.client.create_conversation(user_key)
            except requests.exceptions.RequestException as exc:
                raise sanitize_error(exc) from None

        if resp.status_code >= 400:
            raise sanitize_error(Exception(), status_code=resp.status_code)

        body = _safe_json(resp)
        conv = body.get("conversation") or {}
        conversation_id = conv.get("id") or body.get("id")
        if not conversation_id:
            raise BotpressError("Botpress did not return a conversation id.")

        self._conversation_id = conversation_id
        return conversation_id

    # ------------------------------------------------------------------
    # Public contract
    # ------------------------------------------------------------------
    def validate_target(self) -> bool:
        """
        Idempotent reachability + capability check.

        Steps:
          1. GET /hello -- confirms webhook_id is valid and the Chat
             integration is published.
          2. connect (create user) + create a conversation -- confirms the
             bot can actually hold a conversation (catches the case where
             /hello succeeds but the integration is misconfigured).

        Returns True only if both steps succeed. Never raises -- failures
        are swallowed and reflected in the False return value, since
        `validate_target` is a status probe, not an action that surfaces
        detailed errors (those come from `execute_test`).
        """
        try:
            hello_resp = self.client.hello()
        except requests.exceptions.RequestException:
            return False

        if hello_resp.status_code >= 400:
            return False

        try:
            self._ensure_conversation()
        except BotpressError:
            return False
        except requests.exceptions.RequestException:
            return False

        return True

    def execute_test(self, vulnerability_id: str, attack_id: str, test_input: str) -> dict:
        """
        Send `test_input` to the bot and wait for a reply.

        Returns the structured result dict described in Section 5 of the
        spec. Never raises -- all failures are captured into
        `success=False` / `error=<safe message>`.
        """
        start = time.monotonic()
        metadata = {
            "platform": "botpress",
            "conversation_id": None,
            "webhook_id": redact_webhook_id(self.config.webhook_id),
            "message_id": None,
            "delivery_mode": "poll",
        }

        try:
            conversation_id = self._ensure_conversation()
            metadata["conversation_id"] = conversation_id
            user_key = self._ensure_user_key()
            ignored_message_ids = self._current_message_ids(conversation_id, user_key)

            send_resp = self.client.create_message(conversation_id, user_key, test_input)
            if send_resp.status_code >= 400:
                raise sanitize_error(Exception(), status_code=send_resp.status_code)

            sent_body = _safe_json(send_resp)
            sent_message_id = (sent_body.get("message") or {}).get("id") or sent_body.get("id")
            if sent_message_id:
                ignored_message_ids.add(sent_message_id)

            bot_text, bot_message_id = self._wait_for_bot_reply(
                conversation_id, user_key, ignored_message_ids=ignored_message_ids
            )

            elapsed_ms = int((time.monotonic() - start) * 1000)

            if bot_text is None:
                return {
                    "success": False,
                    "model_response": None,
                    "bot_response": None,
                    "execution_time_ms": elapsed_ms,
                    "error": "Bot did not reply within the configured timeout.",
                    "metadata": {**metadata, "message_id": None},
                }

            return {
                "success": True,
                "model_response": bot_text,
                "bot_response": bot_text,
                "execution_time_ms": elapsed_ms,
                "error": None,
                "metadata": {**metadata, "message_id": bot_message_id},
            }

        except BotpressError as exc:
            elapsed_ms = int((time.monotonic() - start) * 1000)
            return {
                "success": False,
                "model_response": None,
                "bot_response": None,
                "execution_time_ms": elapsed_ms,
                "error": str(exc),
                "metadata": metadata,
            }
        except requests.exceptions.RequestException as exc:
            elapsed_ms = int((time.monotonic() - start) * 1000)
            return {
                "success": False,
                "model_response": None,
                "bot_response": None,
                "execution_time_ms": elapsed_ms,
                "error": str(sanitize_error(exc)),
                "metadata": metadata,
            }

    def _current_message_ids(self, conversation_id: str, user_key: str) -> set[str]:
        try:
            resp = self.client.list_messages(conversation_id, user_key)
        except requests.exceptions.RequestException as exc:
            raise sanitize_error(exc) from None

        if resp.status_code >= 400:
            raise sanitize_error(Exception(), status_code=resp.status_code)

        body = _safe_json(resp)
        return {msg["id"] for msg in body.get("messages") or [] if msg.get("id")}

    def _wait_for_bot_reply(
        self, conversation_id: str, user_key: str, ignored_message_ids: Optional[set[str]] = None
    ) -> tuple[Optional[str], Optional[str]]:
        """
        Poll `listMessages` until a new bot (outgoing) message appears, or
        `reply_timeout_sec` elapses.

        SSE note: the spec allows SSE as an alternative delivery mechanism
        (`listenConversation` / `message_created` events). Polling was
        chosen as the primary implementation here because:
          - it requires no long-lived connection management in a stateless
            REST backend (simpler to deploy on free-tier PaaS, which often
            kill idle/streaming connections),
          - it is trivially mockable in tests with a simple HTTP stub, and
          - the spec's own timeout/poll-interval constants (60s / 2s) are
            framed around polling.
        SSE is documented as the recommended production upgrade in
        DESIGN.md, with `delivery_mode` already present in the result
        metadata so the API/UI do not need to change when it is added.
        """
        deadline = time.monotonic() + self.config.reply_timeout_sec
        seen_ids: set[str] = set(ignored_message_ids or set())

        while time.monotonic() < deadline:
            try:
                resp = self.client.list_messages(conversation_id, user_key)
            except requests.exceptions.RequestException as exc:
                raise sanitize_error(exc) from None

            if resp.status_code >= 400:
                raise sanitize_error(Exception(), status_code=resp.status_code)

            body = _safe_json(resp)
            messages = body.get("messages") or []

            for msg in messages:
                msg_id = msg.get("id")
                if msg_id is None or msg_id in seen_ids:
                    continue
                seen_ids.add(msg_id)

                if is_bot_message(msg, own_user_id=self._user_id):
                    text = extract_bot_text(msg)
                    if text is not None:
                        return text, msg_id

            time.sleep(self.config.poll_interval_sec)

        return None, None

    def reset_conversation(self) -> None:
        """
        Start a fresh conversation for the next `execute_test` call.

        The user (and its `_user_key`) is retained -- only the
        conversation is rotated -- since creating a new user per test
        would burn free-tier quota faster with no isolation benefit
        (Botpress conversations, not users, hold message history).
        """
        self._conversation_id = None

    def get_platform_metadata(self) -> dict:
        """Non-secret platform info for logging/UI."""
        return {
            "platform": "botpress",
            "webhook_id": redact_webhook_id(self.config.webhook_id),
            "resource_name": self.config.resource_name,
            "reply_timeout_sec": self.config.reply_timeout_sec,
            "poll_interval_sec": self.config.poll_interval_sec,
            "manual_auth_configured": self.config.uses_manual_auth,
            "manual_auth_fallback_used": self._used_manual_auth_fallback,
            "delivery_mode": "poll",
        }


def _safe_json(resp: requests.Response) -> dict:
    try:
        return resp.json()
    except (json.JSONDecodeError, ValueError):
        return {}
