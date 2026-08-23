"""
Database operations for the `resources` table.
"""

from __future__ import annotations

import uuid
from typing import Optional

from .connection import get_conn, _now


def create_resource(data: dict) -> dict:
    resource_id = "res_" + uuid.uuid4().hex[:12]
    use_case_type = data.get("use_case_type", "customer_support")
    policy_id = data.get("policy_id") or f"pol_{use_case_type}"
    ai_provider = data.get("ai_provider", "custom")

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO resources (
                id, account_name, resource_name, webhook_id, encryption_key,
                user_id, description, use_case_type, policy_id, reply_timeout_sec, poll_interval_sec,
                validation_status, ai_provider, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'not_validated', ?, ?)
            """,
            (
                resource_id,
                data["account_name"],
                data["resource_name"],
                data["webhook_id"],
                data.get("encryption_key"),
                data.get("user_id"),
                data.get("description"),
                use_case_type,
                policy_id,
                int(data.get("reply_timeout_sec", 60)),
                int(data.get("poll_interval_sec", 2)),
                ai_provider,
                _now(),
            ),
        )
    return get_resource(resource_id)


def get_resource(resource_id: str) -> Optional[dict]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM resources WHERE id = ?", (resource_id,)).fetchone()
        return dict(row) if row else None


def list_resources() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM resources ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


def update_validation_status(resource_id: str, status: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "UPDATE resources SET validation_status = ?, last_validated_at = ? WHERE id = ?",
            (status, _now(), resource_id),
        )


def to_public_dict(resource: dict) -> dict:
    return {
        "id": resource["id"],
        "account_name": resource["account_name"],
        "resource_name": resource["resource_name"],
        "webhook_id_redacted": _redact(resource["webhook_id"]),
        "description": resource["description"],
        "use_case_type": resource.get("use_case_type", "customer_support"),
        "policy_id": resource.get("policy_id", "pol_customer_support"),
        "manual_auth_configured": bool(resource["encryption_key"] and resource["user_id"]),
        "reply_timeout_sec": resource["reply_timeout_sec"],
        "poll_interval_sec": resource["poll_interval_sec"],
        "validation_status": resource["validation_status"],
        "last_validated_at": resource.get("last_validated_at"),
        "created_at": resource["created_at"],
    }


def _redact(value: str) -> str:
    if not value:
        return "***"
    if len(value) <= 8:
        return value[0] + "***" + value[-1]
    return value[:4] + "..." + value[-4:]
