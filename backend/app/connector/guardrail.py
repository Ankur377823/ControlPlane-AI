"""
ControlPlaneGuardrail: Orchestrates real-time P, $, R evaluations.

Supports 4 Policy Enforcement Modes:
  1. MONITOR: Logs prompt, response, and risk findings to DB without modifying text or blocking.
  2. MASK: Redacts sensitive secrets (PII/tokens) before sending, and logs to DB.
  3. BLOCK: Immediately halts execution when any secret, PII, or injection is detected.
  4. CONFIRM_REQUIRED: Halts action and routes to Human-in-the-Loop Review Queue.

Includes Round 2 Responsible AI capabilities:
  - Use-case / resource risk profile awareness
  - Evidence-backed RAG context grounding & claim verification
  - Compound tool sequence risk detection
  - Multi-turn cumulative session risk tracking
  - AI-as-a-Judge fallback for ambiguous/high-risk edge cases
"""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

from .evaluators.action_risk import evaluate_action_risk
from .evaluators.ai_judge import evaluate_with_ai_judge, is_ambiguous_case
from .evaluators.bias_safety import scan_bias_and_toxicity
from .evaluators.cost import analyze_cost
from .evaluators.grounding import evaluate_grounding
from .evaluators.injection import scan_prompt_injection
from .evaluators.multi_turn_risk import update_multi_turn_risk
from .evaluators.pii import scan_and_redact_pii


class ControlPlaneGuardrail:
    def __init__(self, policy: Dict[str, Any]):
        self.policy = policy

    def evaluate(
        self,
        user_prompt: str,
        raw_response: Optional[str] = None,
        tool_call: Optional[Dict[str, Any]] = None,
        context_docs: Optional[List[str]] = None,
        session_id: Optional[str] = None,
        tool_history: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        start = time.monotonic()
        triggered_rules: list[str] = []
        risk_findings: list[dict] = []

        enf_mode = self.policy.get("enforcement_mode", "block").lower()
        use_case = self.policy.get("use_case_type", "customer_support")

        # 0. Agent Tool Call & Compound Action Risk Evaluation
        action_eval = evaluate_action_risk(tool_call, user_prompt, tool_history=tool_history)
        action_risk_tier = action_eval["action_risk_tier"]
        if action_eval["risk_findings"]:
            for rf in action_eval["risk_findings"]:
                triggered_rules.append(rf["rule"])
                risk_findings.append({
                    "type": f"ACTION_RISK_{action_risk_tier}",
                    "severity": rf["severity"],
                    "location": "agent_tool_call",
                    "snippet": f"Tool: {rf.get('tool_name', 'action')}",
                    "description": rf["description"],
                })

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
                    "description": f"User prompt contains sensitive {ptype} data.",
                })

        if response_pii and response_pii.has_pii:
            for ptype in response_pii.detected_types:
                triggered_rules.append(f"Model PII Disclosure ({ptype})")
                risk_findings.append({
                    "type": f"PII_{ptype}",
                    "severity": "CRITICAL",
                    "location": "model_response",
                    "snippet": f"Detected {ptype} in model response",
                    "description": f"Model output generated sensitive {ptype} data.",
                })

        # 2. Prompt Injection & Bias Scan (Responsibility)
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

        bias_prompt = scan_bias_and_toxicity(user_prompt)
        bias_response = scan_bias_and_toxicity(raw_response) if raw_response else {"has_bias": False, "risk_findings": []}
        if bias_prompt["has_bias"] or bias_response["has_bias"]:
            for rf in bias_prompt["risk_findings"] + bias_response["risk_findings"]:
                triggered_rules.append(rf["rule"])
                risk_findings.append({
                    "type": "BIAS_SAFETY_VIOLATION",
                    "severity": rf["severity"],
                    "location": "content",
                    "snippet": rf["snippet"],
                    "description": rf["description"],
                })

        # 3. Grounding / Factuality / Hallucination Score (Performance - P)
        hal_thresh = float(self.policy.get("hallucination_threshold", 0.65))
        grounding_eval = evaluate_grounding(
            prompt=user_prompt,
            response=raw_response or "",
            context_docs=context_docs,
            hallucination_threshold=hal_thresh,
        )
        if not grounding_eval["is_grounded"] and raw_response:
            for uc in grounding_eval.get("ungrounded_claims", []):
                triggered_rules.append(f"Ungrounded Claim: {uc['claim'][:50]}...")
                risk_findings.append({
                    "type": "LOW_GROUNDING_HALLUCINATION",
                    "severity": "MEDIUM",
                    "location": "model_response",
                    "snippet": uc["claim"][:80],
                    "description": "Claim lacks grounding or context support in reference materials.",
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

        # 5. Multi-Turn Cumulative Risk Tracking (if session_id provided)
        turn_risk_score = 0.0
        if injection_res.is_injection or action_risk_tier == "CRITICAL":
            turn_risk_score = 90.0
        elif has_pii or action_risk_tier == "HIGH":
            turn_risk_score = 65.0
        elif risk_findings:
            turn_risk_score = 45.0

        multi_turn_eval = None
        if session_id and session_id not in ("sess_default", "default"):
            multi_turn_eval = update_multi_turn_risk(
                session_id=session_id,
                turn_risk_score=turn_risk_score,
                findings=risk_findings,
            )
            if multi_turn_eval.get("is_escalated"):
                triggered_rules.append("Cumulative Multi-Turn Session Risk Escalation")
                risk_findings.append({
                    "type": "CUMULATIVE_SESSION_RISK",
                    "severity": multi_turn_eval["risk_level"],
                    "location": "session_trajectory",
                    "snippet": f"Cumulative score {multi_turn_eval['cumulative_risk_score']}/100 across {multi_turn_eval['turn_index']} turns",
                    "description": "Multi-turn risk accumulation indicates probing, repeated boundary crossing, or escalating drift.",
                })

        # 6. AI-as-a-Judge for Ambiguous / Edge Cases
        ai_judge_verdict = None
        norm_risk = turn_risk_score / 100.0
        if is_ambiguous_case(norm_risk) and use_case == "decision_support":
            judge_res = evaluate_with_ai_judge(user_prompt, raw_response)
            ai_judge_verdict = judge_res
            if judge_res["violation_detected"]:
                triggered_rules.append(f"AI Judge Flag: {judge_res['rationale'][:50]}")
                risk_findings.append({
                    "type": "AI_JUDGE_POLICY_FLAG",
                    "severity": "HIGH",
                    "location": "semantic_evaluation",
                    "snippet": judge_res["rationale"],
                    "description": f"Secondary AI Judge detected borderline policy violation with {int(judge_res['confidence']*100)}% confidence.",
                })

        # 7. Calculate Scores
        performance_score = round(grounding_eval["grounding_score"] * 100, 1)
        cost_score = round(cost_res.cost_score * 100, 1)
        responsibility_score = 100.0
        if injection_res.is_injection or action_risk_tier == "CRITICAL":
            responsibility_score = 10.0
        elif has_pii or action_risk_tier == "HIGH":
            responsibility_score = 40.0
        elif risk_findings:
            responsibility_score = max(50.0, 100.0 - (len(risk_findings) * 15.0))

        # 8. Apply Enforcement Mode & Decision
        action = "ALLOW"
        inj_action = self.policy.get("prompt_injection_action", "block")
        if action_risk_tier == "CRITICAL":
            action = "BLOCK"
        elif injection_res.is_injection:
            if inj_action == "flag" and enf_mode in ("mask", "redact"):
                action = "MASK"
            elif inj_action == "flag":
                action = "MONITOR"
            else:
                action = "BLOCK"
        elif action_risk_tier == "HIGH" or (action_eval.get("action") == "CONFIRM_REQUIRED"):
            action = "CONFIRM_REQUIRED"
        elif multi_turn_eval and multi_turn_eval.get("escalation_action") in ("BLOCK", "CONFIRM_REQUIRED"):
            action = multi_turn_eval["escalation_action"]
        elif bool(risk_findings):
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
            "action_risk_tier": action_risk_tier,
            "tool_call": action_eval["tool_call"],
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
            "grounding_details": grounding_eval,
            "session_telemetry": multi_turn_eval,
            "ai_judge_verdict": ai_judge_verdict,
            "policy_applied": {
                "policy_id": self.policy.get("id"),
                "use_case_type": self.policy.get("use_case_type"),
                "enforcement_mode": enf_mode,
            },
        }
