"""
Database operations for the `policies` table.
"""

from __future__ import annotations

from typing import Optional

from .connection import get_conn, _now
from .resources import get_resource


def get_policy(policy_id: str) -> Optional[dict]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM policies WHERE id = ?", (policy_id,)).fetchone()
        return dict(row) if row else None


def get_policy_for_resource(resource_id: str) -> dict:
    res = get_resource(resource_id)
    if res and res.get("policy_id"):
        pol = get_policy(res["policy_id"])
        if pol:
            return pol
    pol = get_policy("pol_customer_support")
    if pol:
        return pol
    return {
        "id": "pol_default",
        "name": "Default Safety Policy",
        "use_case_type": "customer_support",
        "pii_redaction_enabled": 1,
        "pii_sensitivity": "high",
        "prompt_injection_action": "block",
        "hallucination_threshold": 0.65,
        "max_tokens_limit": 2048,
        "require_human_review_below": 0.75,
        "created_at": _now(),
    }


def update_policy(policy_id: str, data: dict) -> dict:
    with get_conn() as conn:
        conn.execute(
            """
            UPDATE policies SET
                enforcement_mode = ?,
                pii_redaction_enabled = ?,
                pii_sensitivity = ?,
                prompt_injection_action = ?,
                hallucination_threshold = ?,
                max_tokens_limit = ?,
                require_human_review_below = ?
            WHERE id = ?
            """,
            (
                data.get("enforcement_mode", "block"),
                int(data.get("pii_redaction_enabled", 1)),
                data.get("pii_sensitivity", "high"),
                data.get("prompt_injection_action", "block"),
                float(data.get("hallucination_threshold", 0.65)),
                int(data.get("max_tokens_limit", 2048)),
                float(data.get("require_human_review_below", 0.75)),
                policy_id,
            ),
        )
    return get_policy(policy_id)
