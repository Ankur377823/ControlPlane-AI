"""
Database operations for the `tokens` and `devices` tables.
"""

from __future__ import annotations

import time
import uuid
from typing import Optional, List, Dict, Any

from .connection import get_conn, _now


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
        "enrollments_count": 0,
        "max_enrollments": 100,
        "devices": [],
    }


def validate_token_key(token_key: str) -> Optional[dict]:
    if not token_key:
        return None
    clean = token_key.strip()
    now_str = _now()
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM tokens WHERE token_key = ?", (clean,)).fetchone()
        if not row:
            return None
        d = dict(row)
        if d.get("status") == "revoked":
            raise ValueError("Enrollment Token has been revoked.")
        if d.get("expires_at") and d.get("expires_at") < now_str:
            raise ValueError("Enrollment Token has expired.")
        return d


def record_device_heartbeat(
    device_id: str,
    token_key: Optional[str] = None,
    tenant_id: Optional[str] = None,
    source: Optional[str] = None,
    platform: Optional[str] = None,
    browser: Optional[str] = None
) -> dict:
    if not device_id:
        return {}

    now_str = _now()
    if tenant_id:
        clean_tenant = tenant_id.strip()
        from .users import is_valid_tenant
        if not is_valid_tenant(clean_tenant):
            raise ValueError(f"Invalid Tenant ID '{clean_tenant}': Workspace does not exist.")
    else:
        clean_tenant = "ankur-tenant-1"

    clean_token = (token_key or "").strip()

    # If token_key is provided, strictly validate that it exists and is active
    token_id = None
    if clean_token:
        matched_token = validate_token_key(clean_token)
        if not matched_token:
            raise ValueError("Invalid Enrollment Token: Token key does not exist.")
        token_id = matched_token["id"]

    with get_conn() as conn:
        # Check existing device
        dev_row = conn.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,)).fetchone()
        if dev_row:
            conn.execute(
                """
                UPDATE devices 
                SET last_seen_at = ?, 
                    token_key = COALESCE(NULLIF(?, ''), token_key),
                    token_id = COALESCE(?, token_id),
                    tenant_id = ?,
                    status = 'active'
                WHERE device_id = ?
                """,
                (now_str, clean_token, token_id, clean_tenant, device_id)
            )
            return {"device_id": device_id, "status": "updated", "last_seen_at": now_str, "token_id": token_id}
        else:
            dev_pk = "dev_" + uuid.uuid4().hex[:12]
            conn.execute(
                """
                INSERT INTO devices (id, device_id, token_key, token_id, tenant_id, device_name, platform, browser, status, last_seen_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
                """,
                (dev_pk, device_id, clean_token, token_id, clean_tenant, source or "Browser Extension", platform or "Desktop", browser or "Chrome", now_str, now_str)
            )
            return {"device_id": device_id, "status": "registered", "last_seen_at": now_str, "token_id": token_id}


def list_devices_for_token(token_id_or_key: str) -> List[Dict[str, Any]]:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, device_id, token_key, token_id, tenant_id, device_name, platform, browser, status, last_seen_at, created_at 
            FROM devices 
            WHERE token_id = ? OR token_key = ? 
            ORDER BY last_seen_at DESC
            """,
            (token_id_or_key, token_id_or_key)
        ).fetchall()
        return [dict(r) for r in rows]


def list_tokens() -> list[dict]:
    now_ts = time.time()
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now_ts))
    with get_conn() as conn:
        # Auto-seed a default token if table is empty
        t_count = conn.execute("SELECT COUNT(*) FROM tokens").fetchone()
        count_val = t_count[0] if t_count else 0
        if count_val == 0:
            generate_token(resource_id="res_demo", name="extension", days_valid=48)
            # Add a demo connected device
            record_device_heartbeat(
                device_id="device_2c4f4b69-b064-4a15-a299-a9bf124b2827",
                tenant_id="ankur-tenant-1",
                source="Chrome Extension"
            )

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

            # Get connected devices for this token
            t_id = d["id"]
            t_key = d["token_key"]
            dev_rows = conn.execute(
                "SELECT id, device_id, tenant_id, device_name, platform, browser, status, last_seen_at, created_at FROM devices WHERE token_id = ? OR token_key = ? ORDER BY last_seen_at DESC",
                (t_id, t_key)
            ).fetchall()
            devices = [dict(dev) for dev in dev_rows]

            # If no explicit device attached to this specific token key, check any orphaned active devices
            if not devices and status == "active":
                orphan_rows = conn.execute(
                    "SELECT id, device_id, tenant_id, device_name, platform, browser, status, last_seen_at, created_at FROM devices WHERE token_id IS NULL OR token_key = '' ORDER BY last_seen_at DESC LIMIT 5"
                ).fetchall()
                devices = [dict(dev) for dev in orphan_rows]

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
                "enrollments_count": len(devices),
                "max_enrollments": 100,
                "devices": devices,
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
