"""
Agent Action, Tool Call & Destructive Command Risk Evaluator for ControlPlane AI

Evaluates AI Agent Tool/API calls and User Prompts, assigning Action Risk Tiers:
- LOW: Read/Search operations -> ALLOW
- MEDIUM: Write/Send operations -> MONITOR (Audit Log)
- HIGH: Delete/Execute operations -> CONFIRM_REQUIRED (User Modal Approval)
- CRITICAL: Financial/System destruction -> BLOCK (Hard Block & Admin Approval)

Also evaluates:
- Destructive prompt requests (DROP TABLE, TRUNCATE, rm -rf, wipe disk, DELETE FROM)
- Compound Tool-Chain sequences (Data Read -> External Send / Export)
"""

from __future__ import annotations

import re
from typing import Optional, Dict, Any, List

CRITICAL_TOOLS = {
    "transfer_money", "transfer_funds", "access_credentials", "drop_database", 
    "delete_database", "sudo_execute", "wipe_disk", "revoke_all_access", "pay_invoice",
    "drop_table", "truncate_table", "delete_all_records"
}

HIGH_TOOLS = {
    "delete_file", "delete_email", "execute_code", "run_script", "modify_permissions", 
    "uninstall_package", "restart_service", "clear_logs", "delete_record", "delete_user",
    "delete_user_record", "purge_logs"
}

MEDIUM_TOOLS = {
    "send_email", "post_message", "create_file", "update_record", "write_db", 
    "download_file", "send_slack_msg", "post_tweet", "patch_config"
}

LOW_TOOLS = {
    "search_web", "read_email", "get_weather", "read_file", "query_db", 
    "list_directory", "fetch_url", "get_status"
}

DATA_READ_TOOLS = {"query_db", "read_file", "read_email", "access_credentials", "export_csv", "fetch_url"}
DATA_EXFIL_TOOLS = {"send_email", "post_message", "send_slack_msg", "post_tweet", "download_file"}

# Destructive Prompt / Command Patterns in natural language queries
DESTRUCTIVE_PATTERNS = [
    (
        "destructive_sql",
        re.compile(r"\b(?:DROP\s+(?:TABLE|DATABASE|SCHEMA|VIEW|INDEX)|TRUNCATE\s+TABLE|DELETE\s+FROM\s+[a-zA-Z_0-9]+)\b", re.IGNORECASE),
        "CRITICAL",
        "BLOCK",
        "Destructive Database Command Detected (DROP TABLE / TRUNCATE / Bulk DELETE)",
    ),
    (
        "destructive_os",
        re.compile(r"\b(?:rm\s+-(?:rf|fr|r)\b|mkfs\b|format\s+[a-zA-Z]:|wipe\s+disk|dd\s+if=\/dev\/|fdisk\b|del\s+\/[fsyq]\b)", re.IGNORECASE),
        "CRITICAL",
        "BLOCK",
        "Destructive Operating System / Disk Formatting Command Detected",
    ),
    (
        "destructive_purge",
        re.compile(r"\b(?:delete\s+(?:the\s+)?(?:production\s+database|customer\s+logs|backup\s+directory|all\s+user\s+records|source\s+files|audit\s+logs|firewall\s+access\s+logs))\b", re.IGNORECASE),
        "HIGH",
        "CONFIRM_REQUIRED",
        "High-Risk File / Resource Deletion Request Detected",
    ),
    (
        "wipe_reset_auth",
        re.compile(r"\b(?:revoke\s+all\s+administrator\s+access|wipe\s+the\s+session\s+database|reset\s+security\s+configuration\s+to\s+default)\b", re.IGNORECASE),
        "CRITICAL",
        "BLOCK",
        "Critical Security Configuration / Privilege Destruction Request Detected",
    ),
]


def evaluate_compound_sequence(current_tool: str, tool_history: Optional[List[Dict[str, Any]]]) -> Optional[Dict[str, Any]]:
    """
    Check if sequence of actions forms a high-risk compound trajectory.
    E.g. Read DB -> Export -> Send Email = Potential Data Exfiltration
    """
    if not tool_history or not isinstance(tool_history, list):
        return None

    past_names = [str(t.get("name", "")).lower().strip() for t in tool_history if isinstance(t, dict)]
    
    # Check 1: Exfiltration chain
    has_prior_read = any(pt in DATA_READ_TOOLS for pt in past_names)
    is_current_exfil = current_tool in DATA_EXFIL_TOOLS
    
    if has_prior_read and is_current_exfil:
        return {
            "compound_risk_detected": True,
            "severity": "HIGH",
            "rule": "Compound Data Exfiltration Chain",
            "description": f"Tool call '{current_tool}' follows prior data read operations in trajectory. Requires human approval to prevent unauthorized data exfiltration.",
            "prior_tools": past_names[-3:],
            "escalated_action": "CONFIRM_REQUIRED"
        }
    
    # Check 2: Repeated rapid writes/modifications
    recent_writes = sum(1 for pt in past_names[-4:] if pt in MEDIUM_TOOLS or pt in HIGH_TOOLS)
    if recent_writes >= 3 and current_tool in MEDIUM_TOOLS:
        return {
            "compound_risk_detected": True,
            "severity": "HIGH",
            "rule": "High-Velocity State Modification Sequence",
            "description": f"Multiple consecutive write/modify actions detected ({recent_writes} actions). Escalated to prevent runaway agent loops.",
            "prior_tools": past_names[-4:],
            "escalated_action": "CONFIRM_REQUIRED"
        }

    return None


def evaluate_action_risk(
    tool_call: Optional[Dict[str, Any]], 
    user_prompt: str = "",
    tool_history: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    risk_tier = "NONE"
    action = "ALLOW"
    score = 0.0
    risk_findings: List[Dict[str, Any]] = []

    # 1. Prompt-Level Destructive Query & Command Analysis
    if user_prompt:
        for cat_id, pattern, pat_tier, pat_action, pat_desc in DESTRUCTIVE_PATTERNS:
            match = pattern.search(user_prompt)
            if match:
                risk_tier = pat_tier
                action = pat_action
                score = 95.0 if pat_tier == "CRITICAL" else 75.0
                risk_findings.append({
                    "category": "action_risk",
                    "severity": pat_tier,
                    "rule": f"Destructive Command Intercepted ({cat_id.replace('_', ' ').title()})",
                    "description": f"{pat_desc}: '{match.group(0)}'",
                    "tool_name": match.group(0),
                    "snippet": match.group(0),
                })
                break

    # If no structured tool_call is present, return prompt analysis outcome
    if not tool_call or not isinstance(tool_call, dict):
        return {
            "tool_call": None,
            "action_risk_tier": risk_tier,
            "action_risk_score": score,
            "action": action,
            "risk_findings": risk_findings
        }

    tool_name = str(tool_call.get("name", "")).lower().strip()
    parameters = tool_call.get("parameters", {})
    params_str = str(parameters).lower()
    prompt_str = user_prompt.lower()

    if risk_tier == "NONE":
        risk_tier = "LOW"
        action = "ALLOW"
        score = 10.0

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
        if risk_tier != "CRITICAL":
            risk_tier = "HIGH"
            action = "CONFIRM_REQUIRED"
            score = max(score, 75.0)
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
        if risk_tier not in ("CRITICAL", "HIGH"):
            risk_tier = "MEDIUM"
            action = "MONITOR"
            score = max(score, 45.0)
            risk_findings.append({
                "category": "action_risk",
                "severity": "MEDIUM",
                "rule": "Medium Risk Agent Action Audited",
                "description": f"Tool call '{tool_name}' produces external side-effects and is monitored in audit log.",
                "tool_name": tool_name,
                "parameters": parameters
            })

    # 4. Low Tier Check
    elif risk_tier == "LOW":
        risk_tier = "LOW"
        action = "ALLOW"
        score = 10.0

    # 5. Check Compound Trajectory if history provided
    compound_res = evaluate_compound_sequence(tool_name, tool_history)
    if compound_res:
        if risk_tier in ("LOW", "MEDIUM"):
            risk_tier = compound_res["severity"]
            action = compound_res["escalated_action"]
            score = max(score, 78.0)
            risk_findings.append({
                "category": "compound_action_risk",
                "severity": compound_res["severity"],
                "rule": compound_res["rule"],
                "description": compound_res["description"],
                "tool_name": tool_name,
                "parameters": parameters
            })

    return {
        "tool_call": {
            "name": tool_name,
            "parameters": parameters
        },
        "action_risk_tier": risk_tier,
        "risk_tier": risk_tier,
        "action_risk_score": score,
        "action": action,
        "risk_findings": risk_findings
    }


evaluate_agent_action_risk = evaluate_action_risk

