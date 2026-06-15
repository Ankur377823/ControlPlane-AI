"""
SQLite persistence for onboarded resources and scan history.

- Secrets (`encryption_key`) are stored so the connector can use them on
  subsequent requests, but are NEVER returned by `to_public_dict()`, which
  is the only representation exposed via the API/UI.
- A single connection-per-call pattern is used (SQLite + WAL is fine for a
  demo's concurrency level); see DESIGN.md "Production hardening" for how
  this would change for a real multi-tenant deployment.
"""

from __future__ import annotations

import json
import os
import sqlite3
import time
import uuid
from contextlib import contextmanager
from typing import Iterator, Optional

DB_PATH = os.environ.get("BOTPRESS_CONNECTOR_DB", "botpress_connector.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    account_name TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    webhook_id TEXT NOT NULL,
    encryption_key TEXT,
    user_id TEXT,
    description TEXT,
    reply_timeout_sec INTEGER NOT NULL DEFAULT 60,
    poll_interval_sec INTEGER NOT NULL DEFAULT 2,
    validation_status TEXT NOT NULL DEFAULT 'not_validated',
    last_validated_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    resource_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    results_json TEXT NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES resources (id)
);
"""


@contextmanager
def get_conn() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(SCHEMA)


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


# ----------------------------------------------------------------------
# Resources
# ----------------------------------------------------------------------
def create_resource(data: dict) -> dict:
    resource_id = "res_" + uuid.uuid4().hex[:12]
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO resources (
                id, account_name, resource_name, webhook_id, encryption_key,
                user_id, description, reply_timeout_sec, poll_interval_sec,
                validation_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'not_validated', ?)
            """,
            (
                resource_id,
                data["account_name"],
                data["resource_name"],
                data["webhook_id"],
                data.get("encryption_key"),
                data.get("user_id"),
                data.get("description"),
                int(data.get("reply_timeout_sec", 60)),
                int(data.get("poll_interval_sec", 2)),
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
    """Strip secrets before returning a resource via the API."""
    return {
        "id": resource["id"],
        "account_name": resource["account_name"],
        "resource_name": resource["resource_name"],
        "webhook_id_redacted": _redact(resource["webhook_id"]),
        "description": resource["description"],
        "manual_auth_configured": bool(resource["encryption_key"] and resource["user_id"]),
        "reply_timeout_sec": resource["reply_timeout_sec"],
        "poll_interval_sec": resource["poll_interval_sec"],
        "validation_status": resource["validation_status"],
        "last_validated_at": resource["last_validated_at"],
        "created_at": resource["created_at"],
    }


def _redact(value: str) -> str:
    if not value:
        return "***"
    if len(value) <= 8:
        return value[0] + "***" + value[-1]
    return value[:4] + "..." + value[-4:]


# ----------------------------------------------------------------------
# Scans
# ----------------------------------------------------------------------
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
