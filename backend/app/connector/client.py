"""
Thin HTTP client for the Botpress Chat API.

Design notes (see DESIGN.md section 4 for full detail):

- This class does ONE thing: translate connector calls into HTTP requests
  against `https://chat.botpress.cloud/{webhook_id}` and return parsed
  JSON + status codes. It contains NO retry/poll/orchestration logic and
  NO knowledge of "tests", "scans", or conversation lifecycle -- that
  belongs to `scanner.BotpressScanner`.
- `session` is injectable (any object exposing `.get`/`.post` with the
  same signature as `requests.Session`) so unit tests never touch the
  network.
- Every method returns a `requests.Response`-like object. Callers are
  responsible for status-code handling via `errors.sanitize_error`.

Assumptions about the Botpress Chat API (documented per the take-home's
"document your assumptions" guidance, since this was built without a
live credential to verify against):

  POST   /{webhook_id}/users                                -> {"user": {...}, "key": "<user_key>"}
  POST   /{webhook_id}/conversations            (x-user-key) -> {"conversation": {"id": "..."}}
  POST   /{webhook_id}/messages            (x-user-key, body {"conversationId":"...", "payload":{"type":"text","text":...}})
                                                              -> {"message": {"id": "...", ...}}
  GET    /{webhook_id}/conversations/{id}/messages (x-user-key)
                                                              -> {"messages": [ {..., "payload": {"type":"text","text":...}, "userId": "...", "createdAt": "..."} ]}
  GET    /{webhook_id}/hello                                 -> 200 OK if webhook is valid/published

For manual auth (encryption_key + user_id supplied), the Chat API expects
the caller to derive the `x-user-key` itself rather than calling
POST /users. The exact signing scheme is not publicly documented in a
stable way, so this client implements a documented placeholder
(`_derive_manual_user_key`) and clearly flags it -- see DESIGN.md
"Known limitations".
"""

from __future__ import annotations

import hashlib
import hmac
from typing import Any, Optional

import requests

from .config import BotpressTargetConfig


class BotpressChatClient:
    def __init__(
        self,
        config: BotpressTargetConfig,
        session: Optional[Any] = None,
        request_timeout: int = 30,
    ):
        self.config = config
        self.session = session or requests.Session()
        self.request_timeout = request_timeout
        self.base_url = config.base_url.rstrip("/")

    # ------------------------------------------------------------------
    # Health
    # ------------------------------------------------------------------
    def hello(self) -> requests.Response:
        return self.session.get(f"{self.base_url}/hello", timeout=self.request_timeout)

    # ------------------------------------------------------------------
    # User / session setup
    # ------------------------------------------------------------------
    def create_user(self) -> requests.Response:
        """Create (or fetch) an anonymous chat user. Returns a response whose
        JSON body is expected to contain a 'key' used as x-user-key."""
        return self.session.post(f"{self.base_url}/users", json={}, timeout=self.request_timeout)

    def _derive_manual_user_key(self) -> str:
        """
        Best-effort derivation of a user key when manual auth (encryption_key
        + user_id) is configured.

        NOTE: this is a documented placeholder. Botpress's manual-auth user
        key is normally generated client-side by the @botpress/chat SDK; the
        exact algorithm was not independently verified in this exercise. If
        it does not match the real Botpress scheme, the connector falls back
        to `create_user()` (anonymous auth) and logs a warning via
        `get_platform_metadata`. See DESIGN.md "Known limitations".
        """
        assert self.config.encryption_key and self.config.user_id
        digest = hmac.new(
            self.config.encryption_key.encode("utf-8"),
            self.config.user_id.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return digest

    # ------------------------------------------------------------------
    # Conversations
    # ------------------------------------------------------------------
    def create_conversation(self, user_key: str) -> requests.Response:
        return self.session.post(
            f"{self.base_url}/conversations",
            json={},
            headers={"x-user-key": user_key},
            timeout=self.request_timeout,
        )

    # ------------------------------------------------------------------
    # Messages
    # ------------------------------------------------------------------
    def create_message(self, conversation_id: str, user_key: str, text: str) -> requests.Response:
        return self.session.post(
            f"{self.base_url}/messages",
            json={"conversationId": conversation_id, "payload": {"type": "text", "text": text}},
            headers={"x-user-key": user_key},
            timeout=self.request_timeout,
        )

    def list_messages(self, conversation_id: str, user_key: str) -> requests.Response:
        return self.session.get(
            f"{self.base_url}/conversations/{conversation_id}/messages",
            headers={"x-user-key": user_key},
            timeout=self.request_timeout,
        )


def extract_bot_text(message: dict) -> Optional[str]:
    """
    Extract human-readable text from a single Botpress message object.

    Handles text payloads, plain strings, nested content dicts, carousels,
    and direct text attributes so scans never produce None for real bot replies.
    """
    payload = message.get("payload")
    if isinstance(payload, str):
        try:
            payload = json.loads(payload)
        except Exception:
            return payload

    if isinstance(payload, dict):
        payload_type = payload.get("type")
        if payload_type == "text" or "text" in payload:
            return payload.get("text")

        if payload_type in ("image", "audio", "video", "file"):
            return f"[unsupported {payload_type} message]"

        if payload_type == "carousel":
            cards = payload.get("items") or payload.get("cards") or []
            titles = [c.get("title", "") for c in cards if isinstance(c, dict)]
            return "[carousel] " + ", ".join(t for t in titles if t)

        if payload_type in ("dropdown", "choice"):
            return payload.get("text") or "[choice message]"

        for k in ("content", "message", "response", "value", "text"):
            if k in payload and isinstance(payload[k], str):
                return payload[k]

        if payload_type:
            return f"[unsupported message type: {payload_type}]"

    # Direct fallback if text is on the message root
    for k in ("text", "content", "message"):
        if k in message and isinstance(message[k], str):
            return message[k]

    return None


def is_bot_message(message: dict, own_user_id: Optional[str] = None) -> bool:
    """
    Identify whether a message in the conversation came from the bot
    (as opposed to the user/connector itself).
    """
    direction = message.get("direction")
    if direction is not None:
        if direction == "outgoing":
            return True
        if own_user_id and message.get("userId"):
            return message.get("userId") != own_user_id
        return False

    if own_user_id and message.get("userId") is not None:
        return message.get("userId") != own_user_id

    author_id = message.get("authorId") or message.get("senderId")
    if own_user_id and author_id is not None:
        return author_id != own_user_id

    # Legacy fallback: messages authored by a bot sometimes have no userId.
    return message.get("userId") is None
