"""
Agent Action & Tool Call Risk Evaluator for ControlPlane AI

Evaluates AI Agent Tool/API calls and assigns Action Risk Tiers:
- LOW: Read/Search operations -> ALLOW
- MEDIUM: Write/Send operations -> MONITOR (Audit Log)
- HIGH: Delete/Execute operations -> CONFIRM_REQUIRED (User Modal Approval)
- CRITICAL: Financial/System destruction -> BLOCK (Hard Block & Admin Approval)
"""

from __future__ import annotations

from typing import Optional, Dict, Any, List

CRITICAL_TOOLS = {
    "transfer_money", "transfer_funds", "access_credentials", "drop_database", 
    "delete_database", "sudo_execute", "wipe_disk", "revoke_all_access", "pay_invoice"
}

HIGH_TOOLS = {
    "delete_file", "delete_email", "execute_code", "run_script", "modify_permissions", 
    "uninstall_package", "restart_service", "clear_logs", "delete_record"
}

MEDIUM_TOOLS = {
    "send_email", "post_message", "create_file", "update_record", "write_db", 
    "download_file", "send_slack_msg", "post_tweet", "patch_config"
}

LOW_TOOLS = {
    "search_web", "read_email", "get_weather", "read_file", "query_db", 
    "list_directory", "fetch_url", "get_status"
}


def evaluate_action_risk(tool_call: Optional[Dict[str, Any]], user_prompt: str = "") -> Dict[str, Any]:
    if not tool_call or not isinstance(tool_call, dict):
        return {
            "tool_call": None,
            "action_risk_tier": "NONE",
            "action_risk_score": 0.0,
            "action": "ALLOW",
            "risk_findings": []
        }

    tool_name = str(tool_call.get("name", "")).lower().strip()
    parameters = tool_call.get("parameters", {})
    params_str = str(parameters).lower()
    prompt_str = user_prompt.lower()

    risk_tier = "LOW"
    action = "ALLOW"
    score = 10.0
    risk_findings = []

    # Run the 7 Guardian checks
    from .guardian import evaluate_guardian_checks
    guardian_res = evaluate_guardian_checks(
        tool_id=tool_name,
        action="invoke",
        args=parameters
    )
    if not guardian_res["allowed"]:
        risk_tier = "CRITICAL" if guardian_res["tier"] == "halt" else "HIGH"
        action = "BLOCK" if guardian_res["tier"] == "halt" else "CONFIRM_REQUIRED"
        score = 95.0 if guardian_res["tier"] == "halt" else 75.0
        risk_findings.append({
            "category": "action_risk",
            "severity": "CRITICAL" if guardian_res["tier"] == "halt" else "HIGH",
            "rule": guardian_res["threat_type"],
            "description": guardian_res["reason"],
            "tool_name": tool_name,
            "parameters": parameters
        })
        return {
            "tool_call": {
                "name": tool_name,
                "parameters": parameters
            },
            "action_risk_tier": risk_tier,
            "action_risk_score": score,
            "action": action,
            "risk_findings": risk_findings
        }


    # 1. Critical Tier Check
    if any(ct in tool_name or ct in params_str or ct in prompt_str for ct in CRITICAL_TOOLS):
        risk_tier = "CRITICAL"
        action = "BLOCK"
        score = 95.0
        risk_findings.append({
            "category": "action_risk",
            "severity": "CRITICAL",
            "rule": "Critical Agent Action Blocked",
            "description": f"Tool call '{tool_name}' involves critical financial or system destruction risk.",
            "tool_name": tool_name,
            "parameters": parameters
        })

    # 2. High Tier Check
    elif any(ht in tool_name or ht in params_str or ht in prompt_str for ht in HIGH_TOOLS):
        risk_tier = "HIGH"
        action = "CONFIRM_REQUIRED"
        score = 75.0
        risk_findings.append({
            "category": "action_risk",
            "severity": "HIGH",
            "rule": "High Risk Agent Action Intercepted",
            "description": f"Tool call '{tool_name}' requires explicit human confirmation before execution.",
            "tool_name": tool_name,
            "parameters": parameters
        })

    # 3. Medium Tier Check
    elif any(mt in tool_name or mt in params_str or mt in prompt_str for mt in MEDIUM_TOOLS):
        risk_tier = "MEDIUM"
        action = "MONITOR"
        score = 45.0
        risk_findings.append({
            "category": "action_risk",
            "severity": "MEDIUM",
            "rule": "Medium Risk Agent Action Audited",
            "description": f"Tool call '{tool_name}' produces external side-effects and is monitored in audit log.",
            "tool_name": tool_name,
            "parameters": parameters
        })

    # 4. Low Tier Check
    else:
        risk_tier = "LOW"
        action = "ALLOW"
        score = 10.0

    return {
        "tool_call": {
            "name": tool_name,
            "parameters": parameters
        },
        "action_risk_tier": risk_tier,
        "action_risk_score": score,
        "action": action,
        "risk_findings": risk_findings
    }
