"""
Master Multi-Tier Guardrail Orchestrator for ControlPlane AI.

Coordinates the 9 evaluator modules across the full request lifecycle:
1. Deterministic Fast-Path (PII, Injections, Zero-LLM Guardian, Cost) <15ms
2. Evidence RAG Grounding & Factuality (Atomic Claim Extraction & Live Search)
3. Multi-Turn Session Trajectory Accumulator (Exponential Risk Decay)
4. Compound Agent Action Risk (State Machine & Exfiltration Chains)
5. Secondary Semantic AI-as-a-Judge (Borderline Scores 0.40 - 0.75)
6. Dual-Phase Support (Input Pre-flight Guarding + Output Real-time Grounding & Badging)
"""

from __future__ import annotations

import logging
import re
import time
from typing import Any, Dict, List, Optional

logger = logging.getLogger("controlplane.guardrail")

from .evaluators.action_risk import evaluate_agent_action_risk
from .evaluators.ai_judge import evaluate_with_ai_judge, is_ambiguous_case
from .evaluators.bias_safety import scan_bias_and_toxicity
from .evaluators.cost import analyze_cost
from .evaluators.grounding import evaluate_grounding
from .evaluators.guardian import evaluate_guardian_security
from .evaluators.injection import scan_prompt_injection
from .evaluators.multi_turn_risk import update_multi_turn_risk
from .evaluators.pii import scan_and_redact_pii
from .evaluators.universal_vector_engine import evaluate_universal_vector_threat


class ControlPlaneGuardrail:
    """
    Main evaluation pipeline orchestrating sub-15ms fast-path guards,
    RAG evidence grounding, multi-turn risk drift, and dual-phase input/output monitoring.
    """

    def __init__(self, policy: Optional[Dict[str, Any]] = None):
        self.policy = policy or {
            "id": "pol_unified_master",
            "name": "All-in-One Enterprise Master Shield",
            "use_case_type": "customer_support",
            "enforcement_mode": "mask",
            "pii_redaction_enabled": True,
            "pii_sensitivity": "critical",
            "prompt_injection_action": "block",
            "hallucination_threshold": 0.85,
            "max_tokens_limit": 4096,
            "require_human_review_below": 0.85,
        }

    def evaluate(
        self,
        user_prompt: str,
        raw_response: Optional[str] = None,
        tool_call: Optional[Dict[str, Any]] = None,
        context_docs: Optional[List[str]] = None,
        session_id: Optional[str] = None,
        tool_history: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end evaluation across input prompts, tool calls, and model outputs.
        """
        start = time.monotonic()
        triggered_rules: List[str] = []
        risk_findings: List[Dict[str, Any]] = []

        enf_mode = self.policy.get("enforcement_mode", "mask").lower()
        use_case = self.policy.get("use_case_type", "customer_support")

        # ------------------------------------------------------------------
        # 0. Zero-LLM Guardian & Agent Tool Evaluation
        # ------------------------------------------------------------------
        action_eval = {"action_risk_tier": "NONE", "risk_tier": "NONE", "tool_call": tool_call, "action": "ALLOW", "risk_findings": []}
        if tool_call:
            guardian_eval = evaluate_guardian_security(
                tool_call=tool_call,
                prompt=user_prompt,
                policy_id=self.policy.get("id"),
            )
            if not guardian_eval["is_allowed"]:
                triggered_rules.extend(guardian_eval["triggered_rules"])
                for rf in guardian_eval["risk_findings"]:
                    risk_findings.append({
                        "type": rf["rule"],
                        "severity": rf["severity"],
                        "location": "agent_tool_guardian",
                        "snippet": rf["snippet"],
                        "description": rf["description"],
                    })

            action_eval = evaluate_agent_action_risk(
                tool_call=tool_call,
                user_prompt=user_prompt,
                tool_history=tool_history,
            )
            action_risk_tier = action_eval.get("risk_tier", "LOW")
            if action_risk_tier in ("HIGH", "CRITICAL"):
                for rf in action_eval.get("risk_findings", []):
                    triggered_rules.append(rf["rule"])
                    risk_findings.append({
                        "type": f"ACTION_RISK_{action_risk_tier}",
                        "severity": rf["severity"],
                        "location": "agent_tool_call",
                        "snippet": f"Tool: {rf.get('tool_name', 'action')}",
                        "description": rf["description"],
                    })
        else:
            action_risk_tier = "NONE"

        # ------------------------------------------------------------------
        # 1. Smart Hybrid PII & Secrets Redaction (Luhn, Cloud Signatures, Entropy)
        # ------------------------------------------------------------------
        pii_sens = self.policy.get("pii_sensitivity", "critical")
        prompt_pii = scan_and_redact_pii(user_prompt, sensitivity=pii_sens)
        response_pii = scan_and_redact_pii(raw_response, sensitivity=pii_sens) if raw_response else None

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

        # ------------------------------------------------------------------
        # 2. Prompt Injection, Jailbreaks & Delimiter Hijacking (ChatML, Llama)
        # ------------------------------------------------------------------
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

        # ------------------------------------------------------------------
        # 2.5 Universal Zero-Shot Vector Space Threat Projection (Continuous Cosine Space)
        # ------------------------------------------------------------------
        vector_res = evaluate_universal_vector_threat(user_prompt)
        if vector_res.is_threat:
            triggered_rules.append(f"Vector Space Threat: {vector_res.threat_category}")
            risk_findings.append({
                "type": f"VECTOR_THREAT_{vector_res.threat_category}",
                "severity": "CRITICAL" if vector_res.threat_category in ("PEDIATRIC_AND_CHEMICAL_HARM", "BULK_PHI_PII_EXFILTRATION", "CREDENTIALS_AND_SECRETS") else "HIGH",
                "location": "user_prompt",
                "snippet": f"Cosine Similarity: {vector_res.centroid_similarity:.2f}",
                "description": vector_res.explanation,
            })

        # ------------------------------------------------------------------
        # 3. Bias, Toxicity & Content Safety Filtering
        # ------------------------------------------------------------------
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

        # ------------------------------------------------------------------
        # 3.5 Dynamic Custom Regex Patterns & Policy Group Overrides
        # ------------------------------------------------------------------
        custom_rules = self.policy.get("custom_regex_rules", []) or []
        has_custom_block = False
        has_custom_mask = False
        for cr in custom_rules:
            if not cr.get("enabled", True):
                continue
            c_name = cr.get("name", "Custom Rule")
            c_pattern = cr.get("pattern", "")
            c_action = cr.get("action", "MASK").upper()
            c_category = cr.get("category", "Custom Security")
            c_redaction = cr.get("redaction") or f"[REDACTED_{c_name.upper().replace(' ', '_')}]"

            if not c_pattern:
                continue
            try:
                rx = re.compile(c_pattern, re.IGNORECASE)
                # Check user prompt
                matches = list(rx.finditer(sanitized_prompt))
                if matches:
                    triggered_rules.append(f"Custom Rule Triggered: {c_name}")
                    for m in matches:
                        matched_snippet = m.group(0)
                        risk_findings.append({
                            "type": f"CUSTOM_RULE_{c_name.upper().replace(' ', '_')}",
                            "severity": "CRITICAL" if c_action == "BLOCK" else "MEDIUM",
                            "location": "user_prompt",
                            "snippet": matched_snippet,
                            "description": f"Matched custom regex rule '{c_name}' in group '{c_category}': /{c_pattern}/",
                        })
                    if c_action in ("MASK", "REDACT"):
                        sanitized_prompt = rx.sub(c_redaction, sanitized_prompt)
                        has_custom_mask = True
                    elif c_action == "BLOCK":
                        has_custom_block = True

                # Check model response if present
                if sanitized_response:
                    resp_matches = list(rx.finditer(sanitized_response))
                    if resp_matches:
                        triggered_rules.append(f"Custom Rule Output Triggered: {c_name}")
                        for m in resp_matches:
                            risk_findings.append({
                                "type": f"CUSTOM_RULE_{c_name.upper().replace(' ', '_')}",
                                "severity": "CRITICAL" if c_action == "BLOCK" else "HIGH",
                                "location": "model_response",
                                "snippet": m.group(0),
                                "description": f"Model output matched custom regex rule '{c_name}' ({c_category})",
                            })
                        if c_action in ("MASK", "REDACT"):
                            sanitized_response = rx.sub(c_redaction, sanitized_response)
                        elif c_action == "BLOCK":
                            has_custom_block = True
            except Exception as e:
                logger.warning("Failed to evaluate custom regex rule '%s': %s", c_name, e)

        # ------------------------------------------------------------------
        # 4. Evidence RAG Grounding & Live Hallucination Prediction
        # Strictly applies ONLY to LLM-generated responses (never on prompts or site text)
        # ------------------------------------------------------------------
        hal_thresh = float(self.policy.get("hallucination_threshold", 0.85))
        is_hallucination = False
        grounding_eval = {
            "is_grounded": True,
            "grounding_score": 1.0,
            "total_claims": 0,
            "verified_claims": [],
            "ungrounded_claims": [],
        }

        if raw_response and isinstance(raw_response, str) and raw_response.strip():
            grounding_eval = evaluate_grounding(
                prompt=user_prompt or "",
                response=raw_response.strip(),
                context_docs=context_docs,
                hallucination_threshold=hal_thresh,
            )

            if not grounding_eval.get("is_grounded", True):
                is_hallucination = True
                top_source_url = grounding_eval.get("source_link")
                top_correct_ans = grounding_eval.get("correct_answer")

                for uc in grounding_eval.get("ungrounded_claims", []):
                    ev_snippet = uc.get("evidence_snippet") or "Claim lacks grounding or context support in reference materials."
                    claim_source_url = uc.get("source_link") or top_source_url or f"https://www.google.com/search?q={urllib.parse.quote_plus(user_prompt or raw_response[:60])}"
                    claim_correct_ans = uc.get("correct_answer") or top_correct_ans or ev_snippet

                    triggered_rules.append(f"Ungrounded Model Claim: {uc['claim'][:50]}...")
                    risk_findings.append({
                        "type": "LOW_GROUNDING_HALLUCINATION",
                        "severity": "MEDIUM",
                        "location": "model_response",
                        "snippet": uc["claim"][:80],
                        "description": ev_snippet,
                        "evidence_snippet": ev_snippet,
                        "source_link": claim_source_url,
                        "correct_answer": claim_correct_ans,
                    })

        # ------------------------------------------------------------------
        # 5. Token & Cost Efficiency
        # ------------------------------------------------------------------
        max_tok = int(self.policy.get("max_tokens_limit", 4096))
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

        # ------------------------------------------------------------------
        # 6. Multi-Turn Cumulative Session Risk Drift Tracking
        # ------------------------------------------------------------------
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
                    "description": "Multi-turn risk accumulation indicates probing or escalating boundary crossing.",
                })

        # ------------------------------------------------------------------
        # 7. Secondary Semantic AI-as-a-Judge for Borderline Nuance
        # ------------------------------------------------------------------
        ai_judge_verdict = None
        norm_risk = turn_risk_score / 100.0
        if is_ambiguous_case(norm_risk) and use_case in ("decision_support", "high_risk"):
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

        # ------------------------------------------------------------------
        # 8. Compute Composite Governance Scores
        # ------------------------------------------------------------------
        performance_score = round(grounding_eval["grounding_score"] * 100, 1)
        cost_score = round(cost_res.cost_score * 100, 1)
        responsibility_score = 100.0
        if injection_res.is_injection or action_risk_tier == "CRITICAL":
            responsibility_score = 10.0
        elif has_pii or action_risk_tier == "HIGH":
            responsibility_score = 40.0
        elif risk_findings:
            responsibility_score = max(50.0, 100.0 - (len(risk_findings) * 15.0))

        # ------------------------------------------------------------------
        # 9. Smart Decision Routing (ALLOW / MASK / CONFIRM / BLOCK)
        # ------------------------------------------------------------------
        action = "ALLOW"
        inj_action = self.policy.get("prompt_injection_action", "block")

        if action_risk_tier == "CRITICAL" or has_custom_block or any(rf.get("severity") == "CRITICAL" for rf in risk_findings):
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
        elif has_custom_mask and not has_custom_block:
            # Custom rule explicitly requested MASK — honor MASK action directly
            action = "MASK"
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
            "grounding_details": {
                "is_grounded": grounding_eval.get("is_grounded", True),
                "grounding_score": grounding_eval.get("grounding_score", 1.0),
                "total_claims": grounding_eval.get("total_claims", 0),
                "supported_claims": grounding_eval.get("verified_claims", []),
                "verified_claims": grounding_eval.get("verified_claims", []),
                "ungrounded_claims": grounding_eval.get("ungrounded_claims", []),
                "is_hallucination": is_hallucination,
            },
            "session_telemetry": multi_turn_eval,
            "ai_judge_verdict": ai_judge_verdict,
            "policy_applied": {
                "policy_id": self.policy.get("id"),
                "use_case_type": self.policy.get("use_case_type"),
                "enforcement_mode": enf_mode,
            },
        }
