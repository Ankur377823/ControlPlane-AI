"""
Configuration model for a single Botpress target (one onboarded resource).
"""

from __future__ import annotations

from dataclasses import dataclass, field

DEFAULT_REPLY_TIMEOUT_SEC = 60
DEFAULT_POLL_INTERVAL_SEC = 2


@dataclass
class BotpressTargetConfig:
    webhook_id: str
    resource_name: str | None = None
    encryption_key: str | None = None
    user_id: str | None = None
    reply_timeout_sec: int = DEFAULT_REPLY_TIMEOUT_SEC
    poll_interval_sec: int = DEFAULT_POLL_INTERVAL_SEC
    # Override only used by tests / mock server. Never set this from
    # user-supplied data in production -- see DESIGN.md "SSRF" section.
    base_url_override: str | None = None

    @classmethod
    def from_dict(cls, data: dict) -> "BotpressTargetConfig":
        if not data.get("webhook_id"):
            raise ValueError("webhook_id is required")
        return cls(
            webhook_id=data["webhook_id"],
            resource_name=data.get("resource_name"),
            encryption_key=data.get("encryption_key"),
            user_id=data.get("user_id"),
            reply_timeout_sec=int(data.get("reply_timeout_sec", DEFAULT_REPLY_TIMEOUT_SEC)),
            poll_interval_sec=int(data.get("poll_interval_sec", DEFAULT_POLL_INTERVAL_SEC)),
            base_url_override=data.get("base_url_override"),
        )

    @property
    def base_url(self) -> str:
        if self.base_url_override:
            return self.base_url_override
        return f"https://chat.botpress.cloud/{self.webhook_id}"

    @property
    def uses_manual_auth(self) -> bool:
        return bool(self.encryption_key and self.user_id)
