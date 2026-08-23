"""
ControlPlaneGuardrail: Orchestrates real-time P, $, R evaluations.

Supports 3 Policy Enforcement Modes:
  1. MONITOR: Logs prompt, response, and risk findings to DB without modifying text or blocking.
  2. MASK: Redacts sensitive secrets (PII/tokens) before sending, and logs to DB.
  3. BLOCK: Immediately halts execution when any secret, PII, or injection is detected.

Generates detailed `risk_findings` (exact offending snippet, risk type, severity, location).
"""

from __future__ import annotations

import time
from typing import Any, Dict, Optional

from .evaluators.cost import analyze_cost
from .evaluators.hallucination import evaluate_grounding
from .evaluators.injection import scan_prompt_injection
from .evaluators.pii import scan_and_redact_pii


class ControlPlaneGuardrail:
    def __init__(self, policy: Dict[str, Any]):
        self.policy = policy

    def evaluate(self, user_prompt: str, raw_response: Optional[str] = None) -> Dict[str, Any]:
        start = time.monotonic()
        triggered_rules: list[str] = []
        risk_findings: list[dict] = []

        enf_mode = self.policy.get("enforcement_mode", "block").lower()

        # 1. PII Scan (Responsibility)
        prompt_pii = scan_and_redact_pii(user_prompt)
        response_pii = scan_and_redact_pii(raw_response) if raw_response else None

        has_pii = prompt_pii.has_pii or (response_pii.has_pii if response_pii else False)
        sanitized_prompt = prompt_pii.sanitized_text
        sanitized_response = response_pii.sanitized_text if response_pii else raw_response

        if prompt_pii.has_pii:
            for ptype in prompt_pii.detected_types:
                triggered_rules.append(f"PII Leak Detected ({ptype})")
                risk_findings.append({
                    "type": f"PII_{ptype}",
                    "severity": "HIGH",
                    "location": "user_prompt",
                    "snippet": f"Detected {ptype} in input prompt",
                    "description": f"User prompt contains sensitive {ptype} data."
                })

        if response_pii and response_pii.has_pii:
            for ptype in response_pii.detected_types:
                triggered_rules.append(f"Model PII Disclosure ({ptype})")
                risk_findings.append({
                    "type": f"PII_{ptype}",
                    "severity": "CRITICAL",
                    "location": "model_response",
                    "snippet": f"Detected {ptype} in model response",
                    "description": f"Model output generated sensitive {ptype} data."
                })

        # 2. Prompt Injection Scan (Responsibility)
        injection_res = scan_prompt_injection(user_prompt)
        if injection_res.is_injection:
            reason = injection_res.reason or "Adversarial Prompt Injection Detected"
            triggered_rules.append(reason)
            risk_findings.append({
                "type": "PROMPT_INJECTION",
                "severity": "CRITICAL",
                "location": "user_prompt",
                "snippet": user_prompt[:80] + "..." if len(user_prompt) > 80 else user_prompt,
                "description": reason,
            })

        # 3. Grounding / Hallucination Score (Performance - P)
        hal_thresh = float(self.policy.get("hallucination_threshold", 0.65))
        grounding_res = evaluate_grounding(raw_response, threshold=hal_thresh)
        if grounding_res.is_low_confidence:
            for r in grounding_res.reasons:
                triggered_rules.append(r)
                risk_findings.append({
                    "type": "LOW_GROUNDING_HALLUCINATION",
                    "severity": "MEDIUM",
                    "location": "model_response",
                    "snippet": (raw_response[:80] + "...") if raw_response else "",
                    "description": r,
                })

        # 4. Token & Cost Efficiency (Cost - $)
        max_tok = int(self.policy.get("max_tokens_limit", 2048))
        cost_res = analyze_cost(user_prompt, raw_response, max_token_limit=max_tok)
        if cost_res.exceeds_budget:
            reason = cost_res.reason or "Token Budget Exceeded"
            triggered_rules.append(reason)
            risk_findings.append({
                "type": "COST_BUDGET_OVERFLOW",
                "severity": "LOW",
                "location": "user_prompt",
                "snippet": f"Token count ({cost_res.estimated_tokens}) exceeds max limit ({max_tok})",
                "description": reason,
            })

        # 5. Calculate Scores
        performance_score = round(grounding_res.grounding_score * 100, 1)
        cost_score = round(cost_res.cost_score * 100, 1)
        responsibility_score = 100.0
        if injection_res.is_injection:
            responsibility_score = 10.0
        elif has_pii:
            responsibility_score = 50.0

        # 6. Apply Enforcement Mode (MONITOR / WARN / DETECT, MASK / REDACT, BLOCK)
        action = "ALLOW"
        has_risk = bool(risk_findings)

        if has_risk:
            if enf_mode in ("monitor", "detect", "warn"):
                action = "MONITOR"
            elif enf_mode in ("mask", "redact"):
                action = "MASK"
            elif enf_mode == "block":
                action = "BLOCK"
            else:
                action = "MONITOR"


        elapsed_ms = int((time.monotonic() - start) * 1000)

        return {
            "action": action,
            "enforcement_mode": enf_mode,
            "user_prompt": user_prompt,
            "raw_response": raw_response,
            "sanitized_prompt": sanitized_prompt if action in ("MASK", "REDACT") else user_prompt,
            "sanitized_response": sanitized_response if action in ("MASK", "REDACT") else raw_response,
            "latency_ms": elapsed_ms,
            "performance_score": performance_score,
            "cost_score": cost_score,
            "responsibility_score": responsibility_score,
            "triggered_rules": triggered_rules,
            "risk_findings": risk_findings,
            "policy_applied": {
                "policy_id": self.policy.get("id"),
                "use_case_type": self.policy.get("use_case_type"),
                "enforcement_mode": enf_mode,
            },
        }
