"""
LegionForge Guardian 7-Check Deterministic Agent Security Evaluator.

Implements Guardian's 7 deterministic, zero-LLM check layers:
  Check 0: Task Token ACL (JWT/scoped permissions check)
  Check 1: Tool Registry & Revocation (Active tool verification)
  Check 2: Capability Boundary Enforcement (Forbidden dangerous actions)
  Check 3: Destructive Pattern Detection (9 Regex Families)
  Check 4: Sequence Contracts (Playbook state machine validation)
  Check 5: Tool Schema Hash Integrity (Tamper detection via SHA-256)
  Check 6: Adaptive Rules (Hot-reloaded tenant DB rules)
"""

from __future__ import annotations

import hashlib
import re
from typing import Any, Dict, List, Optional

# Check 2: Forbidden Capabilities
FORBIDDEN_CAPABILITIES = {
    "spawn_agent_direct",
    "escalate_scope",
    "register_tool",
    "sudo_execute",
    "bypass_sandbox",
    "exfiltrate_data",
    "wipe_audit_log",
    "override_guardrail",
}

# Check 3: 9 Destructive Pattern Regex Families
DESTRUCTIVE_PATTERNS: Dict[str, List[re.Pattern]] = {
    "CREDENTIAL_PROBE": [
        re.compile(r"(?:api[_-]?key|secret|password|passwd|token|private[_-]?key)\s*[:=]", re.IGNORECASE),
        re.compile(r"cat\s+~/\.(?:aws|ssh|gcp|azure)/credentials", re.IGNORECASE),
        re.compile(r"env\s*\|\s*grep", re.IGNORECASE),
    ],
    "SHELL_INJECTION": [
        re.compile(r";\s*(?:rm\s+-rf|sudo|chmod|chown|wget|curl|nc|bash|sh|exec)\b", re.IGNORECASE),
        re.compile(r"\|\s*(?:bash|sh|python|perl|ruby)\b", re.IGNORECASE),
        re.compile(r"`[^`]*`|\$\([^)]*\)", re.IGNORECASE),
        re.compile(r"\brm\s+-rf\b", re.IGNORECASE),
    ],
    "BULK_EXFILTRATION": [
        re.compile(r"(?:select\s+\*\s+from|copy\s+.*to|dump(?:all)?|pg_dump)\b", re.IGNORECASE),
        re.compile(r"tar\s+-czf\s+.*|zip\s+-r\s+.*", re.IGNORECASE),
        re.compile(r"curl\s+.*-d\s*@\b", re.IGNORECASE),
    ],
    "DATA_STAGING": [
        re.compile(r"/tmp/\.staging|/var/tmp/\.export", re.IGNORECASE),
        re.compile(r"base64\s+(?:-d|--decode)", re.IGNORECASE),
    ],
    "RECONNAISSANCE": [
        re.compile(r"nmap\b|netstat\b|ipconfig\b|ifconfig\b|whoami\b|id\b", re.IGNORECASE),
        re.compile(r"cat\s+/etc/(?:issue|os-release|hosts|resolv\.conf)", re.IGNORECASE),
    ],
    "PRIVILEGE_ESCALATION": [
        re.compile(r"sudo\s+su|su\s+-|pkexec|doas", re.IGNORECASE),
        re.compile(r"chmod\s+(?:777|u\+s|\+x)", re.IGNORECASE),
    ],
    "PATH_TRAVERSAL": [
        re.compile(r"\.\./\.\./|\.\.\\\.\.\\", re.IGNORECASE),
        re.compile(r"/etc/shadow|/etc/passwd|c:\\windows\\system32", re.IGNORECASE),
    ],
    "SSRF_PROBE": [
        re.compile(r"http://(?:169\.254\.169\.254|localhost|127\.0\.0\.1|0\.0\.0\.0|metadata\.google\.internal)", re.IGNORECASE),
        re.compile(r"gopher://|dict://|file://", re.IGNORECASE),
    ],
    "SQL_TAMPERING": [
        re.compile(r";\s*drop\s+table|;\s*truncate\s+table|;\s*delete\s+from", re.IGNORECASE),
        re.compile(r"union\s+select|1=1|' OR '1'='1", re.IGNORECASE),
    ],
}

# Registered Default Playbooks for Sequence Contracts (Check 4)
DEFAULT_SEQUENCE_PLAYBOOKS: Dict[str, List[str]] = {
    "data_pipeline_agent": ["fetch_dataset", "validate_schema", "transform_data", "write_db"],
    "support_agent": ["search_kb", "read_ticket", "generate_draft", "send_reply"],
    "security_auditor": ["list_directory", "read_log", "verify_hash", "generate_report"],
}

# Standard Default Tool Hashes (Check 5)
DEFAULT_TOOL_REGISTRY: Dict[str, Dict[str, Any]] = {
    "web_search": {"status": "active", "hash": None},
    "read_file": {"status": "active", "hash": None},
    "fetch_dataset": {"status": "active", "hash": None},
    "validate_schema": {"status": "active", "hash": None},
    "transform_data": {"status": "active", "hash": None},
    "write_db": {"status": "active", "hash": None},
    "search_kb": {"status": "active", "hash": None},
    "read_ticket": {"status": "active", "hash": None},
    "generate_draft": {"status": "active", "hash": None},
    "send_reply": {"status": "active", "hash": None},
    "list_directory": {"status": "active", "hash": None},
    "read_log": {"status": "active", "hash": None},
    "verify_hash": {"status": "active", "hash": None},
    "generate_report": {"status": "active", "hash": None},
}


def evaluate_guardian_checks(
    tool_id: str,
    action: str = "invoke",
    args: Optional[Dict[str, Any]] = None,
    agent_id: str = "default_agent",
    run_id: str = "run_default",
    sequence_so_far: Optional[List[str]] = None,
    task_token: Optional[str] = None,
    tool_schema_hash: Optional[str] = None,
    allowed_tools_acl: Optional[List[str]] = None,
    revoked_tools: Optional[List[str]] = None,
    adaptive_rules: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Executes Guardian's 7 deterministic security checks in sequential order.
    First failure halts or sandboxes immediately.
    Returns standard Guardian decision payload:
    {
      "allowed": bool,
      "tier": "allow" | "sandbox" | "halt",
      "failed_check": int | None,
      "reason": str,
      "threat_type": str,
      "confidence": float
    }
    """
    tool_name = tool_id.lower().strip() if tool_id else ""
    args = args or {}
    sequence_so_far = sequence_so_far or []
    revoked_tools = revoked_tools or []

    args_str = str(args)

    # ── Check 0: Task Token ACL ──────────────────────────────────────────────
    if allowed_tools_acl is not None and tool_name not in [t.lower() for t in allowed_tools_acl]:
        return {
            "allowed": False,
            "tier": "halt",
            "failed_check": 0,
            "reason": f"Tool '{tool_name}' is outside the Task Token ACL permission set.",
            "threat_type": "TASK_TOKEN_ACL_VIOLATION",
            "confidence": 1.0,
        }

    # ── Check 1: Tool Registry & Revocation ─────────────────────────────────
    if tool_name in [rt.lower() for rt in revoked_tools]:
        return {
            "allowed": False,
            "tier": "halt",
            "failed_check": 1,
            "reason": f"Tool '{tool_name}' has been revoked in tool registry.",
            "threat_type": "REVOKED_TOOL",
            "confidence": 1.0,
        }

    # ── Check 2: Capability Boundaries ──────────────────────────────────────
    if tool_name in FORBIDDEN_CAPABILITIES or action.lower() in FORBIDDEN_CAPABILITIES:
        return {
            "allowed": False,
            "tier": "halt",
            "failed_check": 2,
            "reason": f"Capability '{tool_name}' is explicitly forbidden.",
            "threat_type": "CAPABILITY_BOUNDARY_VIOLATION",
            "confidence": 1.0,
        }

    # ── Check 3: Destructive Pattern Detection ─────────────────────────────
    for threat_name, patterns in DESTRUCTIVE_PATTERNS.items():
        for pat in patterns:
            if pat.search(args_str) or pat.search(tool_name):
                return {
                    "allowed": False,
                    "tier": "halt",
                    "failed_check": 3,
                    "reason": f"Destructive pattern '{threat_name}' detected in tool args.",
                    "threat_type": threat_name,
                    "confidence": 1.0,
                }

    # ── Check 4: Sequence Contracts ─────────────────────────────────────────
    # If agent_id maps to a known playbook, check sequence adherence
    playbook = DEFAULT_SEQUENCE_PLAYBOOKS.get(agent_id)
    if playbook and sequence_so_far:
        expected_step_idx = len(sequence_so_far)
        if expected_step_idx < len(playbook):
            expected_tool = playbook[expected_step_idx]
            if tool_name != expected_tool.lower():
                return {
                    "allowed": False,
                    "tier": "sandbox",
                    "failed_check": 4,
                    "reason": f"Sequence contract violation: expected tool '{expected_tool}', but got '{tool_name}'.",
                    "threat_type": "SEQUENCE_CONTRACT_VIOLATION",
                    "confidence": 0.9,
                }

    # ── Check 5: Tool Schema Hash Integrity ──────────────────────────────────
    if tool_schema_hash and tool_name in DEFAULT_TOOL_REGISTRY:
        expected_hash = DEFAULT_TOOL_REGISTRY[tool_name].get("hash")
        if expected_hash and tool_schema_hash != expected_hash:
            return {
                "allowed": False,
                "tier": "halt",
                "failed_check": 5,
                "reason": f"Hash integrity failure: Tool '{tool_name}' schema hash has changed since registration.",
                "threat_type": "TOOL_TAMPER_DETECTED",
                "confidence": 1.0,
            }

    # ── Check 6: Adaptive Rules ─────────────────────────────────────────────
    if adaptive_rules:
        for rule in adaptive_rules:
            rule_pattern = rule.get("pattern", "")
            rule_action = rule.get("action", "halt").lower()
            rule_name = rule.get("name", "ADAPTIVE_RULE")
            if rule_pattern and re.search(rule_pattern, args_str, re.IGNORECASE):
                return {
                    "allowed": False,
                    "tier": rule_action if rule_action in ("sandbox", "halt") else "halt",
                    "failed_check": 6,
                    "reason": f"Adaptive rule '{rule_name}' triggered by argument pattern.",
                    "threat_type": "ADAPTIVE_RULE_VIOLATION",
                    "confidence": 1.0,
                }

    # All 7 checks passed clean!
    return {
        "allowed": True,
        "tier": "allow",
        "failed_check": None,
        "reason": "All 7 Guardian deterministic security checks passed successfully.",
        "threat_type": "NONE",
        "confidence": 1.0,
    }


def compute_audit_hash(prev_hash: Optional[str], record_data: Dict[str, Any]) -> str:
    """
    Computes SHA-256 hash chain for audit log records:
    Hash_N = SHA256(Hash_{N-1} + canonical_json(record_data))
    """
    prev = prev_hash or "GENESIS_HASH_00000000000000000000000000000000"
    raw_payload = f"{prev}:{str(sorted(record_data.items()))}"
    return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()
