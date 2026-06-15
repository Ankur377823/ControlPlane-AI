"""
Error sanitization for the Botpress connector.

Design goal: NEVER let raw exception text, stack traces, response bodies,
headers, or credential material reach the API/UI layer. Every error that
crosses the connector boundary is converted to one of a small set of
known-safe strings via `sanitize_error`.
"""

from __future__ import annotations

import requests


class BotpressError(Exception):
    """Base class for all connector-raised errors. Message is always safe to display."""

    def __init__(self, message: str, status_code: int | None = None):
        self.status_code = status_code
        super().__init__(message)


class BotpressAuthError(BotpressError):
    """401/403 — invalid or missing credentials / encryption key."""


class BotpressNotFoundError(BotpressError):
    """404 — webhook_id does not exist or integration not enabled."""


class BotpressRateLimitError(BotpressError):
    """429 — free-tier quota or rate limit hit."""


class BotpressServerError(BotpressError):
    """5xx — Botpress-side outage."""


class BotpressTimeoutError(BotpressError):
    """Network timeout or bot did not reply within reply_timeout_sec."""


class BotpressConnectionError(BotpressError):
    """DNS / connection refused / TLS errors etc."""


# Map of HTTP status code -> (exception class, user-safe message)
_STATUS_MAP: dict[int, tuple[type[BotpressError], str]] = {
    400: (BotpressError, "The Botpress API rejected the request as malformed."),
    401: (BotpressAuthError, "Authentication failed. Check the encryption key / user ID."),
    403: (BotpressAuthError, "Access to this Botpress resource is forbidden."),
    404: (BotpressNotFoundError, "Webhook ID not found. Verify the Chat integration is enabled and published."),
    429: (BotpressRateLimitError, "Botpress rate limit or free-tier quota exceeded. Try again later."),
}


def sanitize_error(exc: Exception, status_code: int | None = None) -> BotpressError:
    """
    Convert any low-level exception into a safe BotpressError subclass.

    Never includes: the original exception message verbatim (it may embed
    URLs containing webhook IDs, header dumps, or response bodies), stack
    traces, or any value that originated from target_config.
    """
    if status_code is not None:
        mapped = _STATUS_MAP.get(status_code)
        if mapped:
            cls, msg = mapped
            return cls(msg, status_code=status_code)
        if 500 <= status_code < 600:
            return BotpressServerError(
                "Botpress returned a server error. The bot platform may be temporarily unavailable.",
                status_code=status_code,
            )
        return BotpressError(
            f"Botpress returned an unexpected HTTP {status_code}.", status_code=status_code
        )

    if isinstance(exc, requests.exceptions.Timeout):
        return BotpressTimeoutError("Timed out waiting for a response from Botpress.")

    if isinstance(exc, requests.exceptions.ConnectionError):
        return BotpressConnectionError("Could not connect to the Botpress Chat API.")

    if isinstance(exc, requests.exceptions.RequestException):
        return BotpressError("A network error occurred while contacting Botpress.")

    # Unknown exception type — do not leak its message.
    return BotpressError("An unexpected error occurred in the Botpress connector.")


def redact_webhook_id(webhook_id: str) -> str:
    """Return a partially-redacted webhook id, safe for logs/UI metadata."""
    if not webhook_id:
        return "***"
    if len(webhook_id) <= 8:
        return webhook_id[0] + "***" + webhook_id[-1]
    return webhook_id[:4] + "..." + webhook_id[-4:]
