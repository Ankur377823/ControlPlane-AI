"""
Unit tests for BotpressScanner / BotpressChatClient.

These tests inject a FakeSession (no `requests` network calls at all) so
they run instantly and never depend on Botpress credentials.
"""

from __future__ import annotations

import time

import pytest
import requests

from app.connector.client import BotpressChatClient, extract_bot_text, is_bot_message
from app.connector.config import BotpressTargetConfig
from app.connector.errors import (
    BotpressAuthError,
    BotpressNotFoundError,
    BotpressRateLimitError,
)
from app.connector.scanner import BotpressScanner


# ----------------------------------------------------------------------
# Fakes
# ----------------------------------------------------------------------
class FakeResponse:
    def __init__(self, status_code=200, json_data=None):
        self.status_code = status_code
        self._json = json_data or {}

    def json(self):
        return self._json


class FakeSession:
    """
    Programmable fake of `requests.Session`. `script` is a dict mapping
    (method, path_suffix) -> FakeResponse | Exception | callable.
    Path suffix is matched against the END of the request URL.
    """

    def __init__(self, script: dict):
        self.script = script
        self.calls: list[tuple[str, str]] = []

    def _resolve(self, method: str, url: str) -> FakeResponse:
        self.calls.append((method, url))
        for suffix, behavior in self.script.items():
            if url.endswith(suffix):
                if callable(behavior):
                    return behavior(self.calls)
                if isinstance(behavior, Exception):
                    raise behavior
                return behavior
        raise AssertionError(f"No script entry for {method} {url}")

    def get(self, url, **kwargs):
        return self._resolve("GET", url)

    def post(self, url, **kwargs):
        return self._resolve("POST", url)


def make_scanner(script: dict, **config_overrides) -> BotpressScanner:
    config = {"webhook_id": "test-webhook", "poll_interval_sec": 0, **config_overrides}
    session = FakeSession(script)
    client = BotpressChatClient(BotpressTargetConfig.from_dict(config), session=session)
    return BotpressScanner(config, client=client)


# ----------------------------------------------------------------------
# validate_target
# ----------------------------------------------------------------------
def test_validate_target_success():
    scanner = make_scanner(
        {
            "/hello": FakeResponse(200, {"status": "ok"}),
            "/users": FakeResponse(200, {"key": "user-key-123"}),
            "/conversations": FakeResponse(200, {"conversation": {"id": "conv_1"}}),
        }
    )
    assert scanner.validate_target() is True


def test_validate_target_404_hello():
    scanner = make_scanner({"/hello": FakeResponse(404, {"error": "not found"})})
    assert scanner.validate_target() is False


def test_validate_target_500_on_conversation():
    scanner = make_scanner(
        {
            "/hello": FakeResponse(200, {"status": "ok"}),
            "/users": FakeResponse(200, {"key": "user-key-123"}),
            "/conversations": FakeResponse(500, {}),
        }
    )
    assert scanner.validate_target() is False


def test_validate_target_timeout():
    scanner = make_scanner({"/hello": requests.exceptions.Timeout("timed out")})
    assert scanner.validate_target() is False


def test_validate_target_idempotent():
    """Calling validate_target() multiple times must not raise or change behavior."""
    scanner = make_scanner(
        {
            "/hello": FakeResponse(200, {"status": "ok"}),
            "/users": FakeResponse(200, {"key": "user-key-123"}),
            "/conversations": FakeResponse(200, {"conversation": {"id": "conv_1"}}),
        }
    )
    assert scanner.validate_target() is True
    assert scanner.validate_target() is True
    assert scanner.validate_target() is True


# ----------------------------------------------------------------------
# execute_test
# ----------------------------------------------------------------------
def test_execute_test_happy_path():
    list_responses = iter(
        [
            FakeResponse(200, {"messages": []}),
            FakeResponse(
                200,
                {
                    "messages": [
                        {
                            "id": "msg_bot_1",
                            "direction": "outgoing",
                            "payload": {"type": "text", "text": "Hello, how can I help?"},
                        }
                    ]
                },
            ),
        ]
    )

    scanner = make_scanner(
        {
            "/users": FakeResponse(200, {"key": "user-key-123"}),
            "/conversations": FakeResponse(200, {"conversation": {"id": "conv_1"}}),
            "/messages": lambda calls: (
                FakeResponse(200, {"message": {"id": "msg_user_1"}})
                if calls[-1][0] == "POST"
                else next(list_responses)
            ),
        }
    )

    result = scanner.execute_test("prompt_injection", "ignore_instructions", "hello bot")

    assert result["success"] is True
    assert result["model_response"] == "Hello, how can I help?"
    assert result["error"] is None
    assert result["metadata"]["conversation_id"] == "conv_1"
    assert result["metadata"]["delivery_mode"] == "poll"
    assert result["metadata"]["message_id"] == "msg_bot_1"
    assert isinstance(result["execution_time_ms"], int)


def test_execute_test_timeout_when_bot_never_replies():
    scanner = make_scanner(
        {
            "/users": FakeResponse(200, {"key": "user-key-123"}),
            "/conversations": FakeResponse(200, {"conversation": {"id": "conv_1"}}),
            "/messages": lambda calls: (
                FakeResponse(200, {"message": {"id": "msg_user_1"}})
                if calls[-1][0] == "POST"
                else FakeResponse(200, {"messages": []})
            ),
        },
        reply_timeout_sec=0,  # expire immediately so the test is instant
    )

    result = scanner.execute_test("jailbreak", "role_play", "ignore everything")

    assert result["success"] is False
    assert result["model_response"] is None
    assert "timeout" in result["error"].lower()


def test_execute_test_error_does_not_leak_secrets():
    scanner = make_scanner(
        {
            "/users": FakeResponse(401, {}),
        },
        webhook_id="super-secret-webhook-id-1234",
    )
    result = scanner.execute_test("pii_disclosure", "social_engineering", "leak data")

    assert result["success"] is False
    assert result["error"] == "Authentication failed. Check the encryption key / user ID."
    assert "super-secret-webhook-id-1234" not in result["error"]
    assert "super-secret-webhook-id-1234" not in str(result["metadata"])
    # Redacted form only
    assert result["metadata"]["webhook_id"] == "supe...1234"


# ----------------------------------------------------------------------
# reset_conversation
# ----------------------------------------------------------------------
def test_reset_conversation_creates_new_conversation_id():
    conv_ids = iter(["conv_1", "conv_2"])

    scanner = make_scanner(
        {
            "/users": FakeResponse(200, {"key": "user-key-123"}),
            "/conversations": lambda calls: FakeResponse(
                200, {"conversation": {"id": next(conv_ids)}}
            ),
        }
    )

    first = scanner._ensure_conversation()
    assert first == "conv_1"

    scanner.reset_conversation()

    second = scanner._ensure_conversation()
    assert second == "conv_2"
    assert first != second


# ----------------------------------------------------------------------
# error sanitization
# ----------------------------------------------------------------------
@pytest.mark.parametrize(
    "status_code,exc_cls",
    [
        (401, BotpressAuthError),
        (404, BotpressNotFoundError),
        (429, BotpressRateLimitError),
    ],
)
def test_status_code_mapping(status_code, exc_cls):
    from app.connector.errors import sanitize_error

    err = sanitize_error(Exception(), status_code=status_code)
    assert isinstance(err, exc_cls)
    assert err.status_code == status_code


# ----------------------------------------------------------------------
# text extraction
# ----------------------------------------------------------------------
def test_extract_bot_text_simple_text():
    msg = {"payload": {"type": "text", "text": "Hi there"}}
    assert extract_bot_text(msg) == "Hi there"


def test_extract_bot_text_unsupported_type():
    msg = {"payload": {"type": "image", "url": "https://example.com/x.png"}}
    assert extract_bot_text(msg) == "[unsupported image message]"


def test_extract_bot_text_carousel():
    msg = {"payload": {"type": "carousel", "items": [{"title": "Option A"}, {"title": "Option B"}]}}
    assert extract_bot_text(msg) == "[carousel] Option A, Option B"


def test_is_bot_message_by_direction():
    assert is_bot_message({"direction": "outgoing"}) is True
    assert is_bot_message({"direction": "incoming"}) is False


def test_is_bot_message_by_user_id():
    assert is_bot_message({"userId": "bot_1"}, own_user_id="user_1") is True
    assert is_bot_message({"userId": "user_1"}, own_user_id="user_1") is False
