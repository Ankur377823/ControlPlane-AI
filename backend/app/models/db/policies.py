import json
from typing import Optional, List, Dict, Any

from .connection import get_conn, _now
from .resources import get_resource


def _format_policy_dict(pol: dict) -> dict:
    if not pol:
        return pol
    custom_rules_raw = pol.get("custom_rules_json", "[]")
    if isinstance(custom_rules_raw, str):
        try:
            pol["custom_regex_rules"] = json.loads(custom_rules_raw)
        except Exception:
            pol["custom_regex_rules"] = []
    elif isinstance(custom_rules_raw, list):
        pol["custom_regex_rules"] = custom_rules_raw
    else:
        pol["custom_regex_rules"] = []
    return pol


def get_policy(policy_id: str) -> Optional[dict]:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM policies WHERE id = ?", (policy_id,)).fetchone()
        return _format_policy_dict(dict(row)) if row else None


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
        "name": "Unified Enterprise Policy",
        "use_case_type": "customer_support",
        "enforcement_mode": "mask",
        "pii_redaction_enabled": 1,
        "pii_sensitivity": "critical",
        "prompt_injection_action": "block",
        "hallucination_threshold": 0.85,
        "max_tokens_limit": 4096,
        "require_human_review_below": 0.85,
        "custom_rules_json": "[]",
        "custom_regex_rules": [],
        "created_at": _now(),
    }


def update_policy(policy_id: str, data: dict) -> dict:
    existing = get_policy(policy_id) or get_policy("pol_customer_support") or {}
    
    enf_mode = data["enforcement_mode"] if "enforcement_mode" in data and data["enforcement_mode"] is not None else existing.get("enforcement_mode", "mask")
    pii_en = int(data["pii_redaction_enabled"]) if "pii_redaction_enabled" in data and data["pii_redaction_enabled"] is not None else int(existing.get("pii_redaction_enabled", 1))
    pii_sens = data["pii_sensitivity"] if "pii_sensitivity" in data and data["pii_sensitivity"] is not None else existing.get("pii_sensitivity", "critical")
    inj_act = data["prompt_injection_action"] if "prompt_injection_action" in data and data["prompt_injection_action"] is not None else existing.get("prompt_injection_action", "block")
    hal_thresh = float(data["hallucination_threshold"]) if "hallucination_threshold" in data and data["hallucination_threshold"] is not None else float(existing.get("hallucination_threshold", 0.85))
    max_tok = int(data["max_tokens_limit"]) if "max_tokens_limit" in data and data["max_tokens_limit"] is not None else int(existing.get("max_tokens_limit", 4096))
    rev_thresh = float(data["require_human_review_below"]) if "require_human_review_below" in data and data["require_human_review_below"] is not None else float(existing.get("require_human_review_below", 0.85))

    custom_rules = data.get("custom_regex_rules") or data.get("custom_rules")
    if custom_rules is not None:
        custom_rules_json_str = json.dumps(custom_rules) if not isinstance(custom_rules, str) else custom_rules
    elif data.get("custom_rules_json") is not None:
        custom_rules_json_str = data.get("custom_rules_json")
    else:
        custom_rules_json_str = existing.get("custom_rules_json") or (json.dumps(existing.get("custom_regex_rules", [])) if existing.get("custom_regex_rules") else "[]")

    if not custom_rules_json_str:
        custom_rules_json_str = "[]"

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
                require_human_review_below = ?,
                custom_rules_json = ?
            WHERE id = ? OR id = 'pol_customer_support' OR id = 'pol_default'
            """,
            (
                enf_mode,
                pii_en,
                pii_sens,
                inj_act,
                hal_thresh,
                max_tok,
                rev_thresh,
                custom_rules_json_str,
                policy_id,
            ),
        )
    return get_policy_for_resource(policy_id)
