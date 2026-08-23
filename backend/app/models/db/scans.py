"""
Database operations for the `scans` table.
"""

from __future__ import annotations

import json
import uuid

from .connection import get_conn, _now


def create_scan(resource_id: str, results: list[dict]) -> dict:
    scan_id = "scan_" + uuid.uuid4().hex[:12]
    created_at = _now()
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO scans (id, resource_id, created_at, results_json) VALUES (?, ?, ?, ?)",
            (scan_id, resource_id, created_at, json.dumps(results)),
        )
    return {"id": scan_id, "resource_id": resource_id, "created_at": created_at, "results": results}


def list_scans(resource_id: str) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM scans WHERE resource_id = ? ORDER BY created_at DESC", (resource_id,)
        ).fetchall()
        return [
            {
                "id": r["id"],
                "resource_id": r["resource_id"],
                "created_at": r["created_at"],
                "results": json.loads(r["results_json"]),
            }
            for r in rows
        ]
