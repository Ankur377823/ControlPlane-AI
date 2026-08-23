"""
Database operations for the `tokens` table.
"""

from __future__ import annotations

import time
import uuid
from typing import Optional

from .connection import get_conn


def generate_token(
    resource_id: str = "res_demo",
    name: str = "Chrome Extension Token",
    days_valid: int = 48
) -> dict:
    token_id = "tok_" + uuid.uuid4().hex[:12]
    token_key = "sk-kmp-" + uuid.uuid4().hex[:28]
    now_ts = time.time()
    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now_ts))
    expires_ts = now_ts + (days_valid * 86400)
    expires_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expires_ts))

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO tokens (id, token_key, resource_id, name, created_at, expires_at, days_valid, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
            """,
            (token_id, token_key, resource_id, name, created_at, expires_at, days_valid),
        )
    return {
        "id": token_id,
        "token_key": token_key,
        "resource_id": resource_id,
        "name": name,
        "created_at": created_at,
        "expires_at": expires_at,
        "days_valid": days_valid,
        "status": "active",
    }


def list_tokens() -> list[dict]:
    now_ts = time.time()
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now_ts))
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM tokens ORDER BY created_at DESC").fetchall()
        result = []
        for r in rows:
            d = dict(r)
            status = d.get("status", "active")
            expires_at = d.get("expires_at", "")
            if status == "active" and expires_at and expires_at < now_str:
                status = "expired"

            # Compute days remaining
            days_left = 0
            if expires_at:
                try:
                    exp_struct = time.strptime(expires_at, "%Y-%m-%dT%H:%M:%SZ")
                    exp_sec = time.mktime(exp_struct)
                    days_left = max(0, int((exp_sec - now_ts) / 86400))
                except Exception:
                    days_left = 0

            result.append({
                "id": d["id"],
                "token_key": d["token_key"],
                "resource_id": d["resource_id"],
                "name": d["name"],
                "created_at": d["created_at"],
                "expires_at": expires_at,
                "days_valid": d.get("days_valid", 48),
                "status": status,
                "days_remaining": days_left,
            })
        return result


def revoke_token(token_id: str) -> bool:
    with get_conn() as conn:
        conn.execute("UPDATE tokens SET status = 'revoked' WHERE id = ?", (token_id,))
        return True


def get_active_token(resource_id: str = "res_demo") -> dict:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM tokens WHERE resource_id = ? AND status = 'active' ORDER BY created_at DESC",
            (resource_id,)
        ).fetchone()
        if row:
            d = dict(row)
            return {
                "id": d["id"],
                "token_key": d["token_key"],
                "resource_id": d["resource_id"],
                "name": d["name"],
                "created_at": d["created_at"],
                "expires_at": d.get("expires_at", ""),
                "days_valid": d.get("days_valid", 48),
                "status": d.get("status", "active"),
            }
    # Auto-generate default token with 48 days validity if none exists
    return generate_token(resource_id=resource_id, name="Default Extension Token", days_valid=48)


def validate_token_key(token_key: str) -> Optional[dict]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM tokens WHERE token_key = ?", (token_key,)).fetchone()
        return dict(row) if row else None
