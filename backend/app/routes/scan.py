"""
ControlPlane AI — Multi-Stage Realtime Scan Endpoints

Provides dedicated standard API routes:
- POST /api/v1/scan/input
- POST /api/v1/scan/output

Executes the 5-Phase automated inspection pipeline:
Phase 1: PII Scanning & Redaction (Presidio + Luhn Validation + Custom Regex)
Phase 2: Anti-Evasion Normalization (Zero-Width Stripping, Leetspeak Decoding)
Phase 3: 4-Tier Prompt Protection (YARA, Semantic Similarity, Chunking, LLM Judge)
Phase 4: Content Safety & Competitor Detection (Toxicity, Hate Speech, Competitor Mentions)
Phase 5: Multi-Turn Session Intelligence (Exponential Drift & Trust Escalation)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Header, Request
from pydantic import BaseModel, Field

from ..connector.evaluators.anti_evasion import normalize_adversarial_input
from ..connector.evaluators.bias_safety import scan_bias_and_toxicity
from ..connector.evaluators.injection import scan_prompt_injection
from ..connector.evaluators.multi_turn_risk import update_multi_turn_risk
from ..connector.evaluators.pii import scan_and_redact_pii
from ..connector.evaluators.universal_vector_engine import evaluate_universal_vector_threat

router = APIRouter(prefix="/api/v1/scan", tags=["Scanning & Guardrail API"])


class ScanRequest(BaseModel):
    text: str = Field(..., description="The raw input or output text to scan")
    scan_pii: bool = Field(True, description="Enable PII detection and redaction")
    pii_action: str = Field("mask", description="Action on PII: mask, redact, hash, or block")
    scan_prompt: bool = Field(True, description="Enable Prompt Injection & Jailbreak scanning")
    prompt_action: str = Field("block", description="Action on prompt threat: block or audit")
    scan_toxicity: bool = Field(True, description="Enable toxicity and safety scanning")
    competitors: Optional[List[str]] = Field(None, description="Optional list of competitor brands/products to flag")
    session_key: Optional[str] = Field(None, description="Optional persistent session identifier for multi-turn drift tracking")
    user_id: Optional[str] = Field(None, description="Optional user identifier")


class ScanResponse(BaseModel):
    detected: bool
    has_sensitive_data: bool
    findings: List[Dict[str, Any]]
    processed_text: str
    blocked: bool
    blocked_by: Optional[str]
    block_message: Optional[str]
    prompt_threat_detected: bool
    prompt_findings: List[Dict[str, Any]]
    prompt_risk_score: float
    detection_tier: str
    toxicity_findings: List[Dict[str, Any]] = []
    session_info: Optional[Dict[str, Any]] = None


def _execute_scan_pipeline(
    payload: ScanRequest,
    x_tenant_id: Optional[str] = None,
    x_session_id: Optional[str] = None
) -> ScanResponse:
    raw_text = payload.text or ""
    session_key = payload.session_key or x_session_id or "default_session"

    blocked = False
    blocked_by = None
    block_message = None

    # =========================================================================
    # Phase 1: PII Scanning & Redaction (Luhn Checksum + Structured Signatures)
    # =========================================================================
    pii_findings: List[Dict[str, Any]] = []
    processed_text = raw_text
    has_sensitive_data = False

    if payload.scan_pii:
        pii_res = scan_and_redact_pii(raw_text, action=payload.pii_action)
        has_sensitive_data = pii_res.has_pii
        processed_text = pii_res.sanitized_text
        pii_findings = pii_res.findings

        if has_sensitive_data and payload.pii_action == "block":
            blocked = True
            blocked_by = "pii"
            block_message = f"Request blocked due to sensitive data: {', '.join(pii_res.detected_types)}"

    # =========================================================================
    # Phase 2: Anti-Evasion Normalization
    # =========================================================================
    norm_res = normalize_adversarial_input(raw_text)
    eval_text = norm_res.normalized_text if norm_res.has_evasion_attempts else raw_text

    # =========================================================================
    # Phase 3: 4-Tier Prompt Protection (YARA, Semantic Similarity, Chunking, LLM Judge)
    # =========================================================================
    prompt_threat_detected = False
    prompt_findings: List[Dict[str, Any]] = []
    prompt_risk_score = 0.0
    detection_tier = "none"

    if payload.scan_prompt and not blocked:
        inj_res = scan_prompt_injection(eval_text)
        prompt_threat_detected = inj_res.is_injection
        prompt_risk_score = inj_res.confidence_score
        detection_tier = inj_res.detection_tier

        if prompt_threat_detected:
            prompt_findings.append({
                "type": "jailbreak" if "jailbreak" in (inj_res.reason or "").lower() else "prompt_injection",
                "confidence": inj_res.confidence_score,
                "detected_by": inj_res.detection_tier,
                "reason": inj_res.reason
            })
            if payload.prompt_action == "block":
                blocked = True
                blocked_by = "prompt"
                block_message = f"Request blocked due to detected prompt threat ({inj_res.reason})"

    # =========================================================================
    # Phase 4: Content Safety & Competitor Detection (Universal Vector Engine)
    # =========================================================================
    toxicity_findings: List[Dict[str, Any]] = []
    if payload.scan_toxicity and not blocked:
        # 1. Zero-Shot Universal Vector Threat Projection
        vec_res = evaluate_universal_vector_threat(eval_text)
        if vec_res.is_threat:
            toxicity_findings.append({
                "category": "vector_threat",
                "severity": "CRITICAL" if vec_res.threat_category in ("PEDIATRIC_AND_CHEMICAL_HARM", "BULK_PHI_PII_EXFILTRATION", "CREDENTIALS_AND_SECRETS") else "HIGH",
                "rule": f"Vector Space Threat ({vec_res.threat_category})",
                "description": vec_res.explanation,
                "snippet": f"Cosine Similarity: {vec_res.centroid_similarity:.2f}"
            })
            if vec_res.threat_category in ("PEDIATRIC_AND_CHEMICAL_HARM", "BULK_PHI_PII_EXFILTRATION", "CREDENTIALS_AND_SECRETS"):
                blocked = True
                blocked_by = "vector_threat"
                block_message = f"Request blocked due to {vec_res.threat_category} ({vec_res.explanation})"

        # 2. Bias, Toxicity & Competitor Detection
        if not blocked:
            safety_res = scan_bias_and_toxicity(eval_text, competitors=payload.competitors)
            for rf in safety_res.get("risk_findings", []):
                toxicity_findings.append(rf)
            if safety_res.get("has_bias") and any(f.get("severity") == "CRITICAL" for f in safety_res.get("risk_findings", [])):
                blocked = True
                blocked_by = "safety"
                block_message = "Request blocked due to critical safety / harm violation"

    # =========================================================================
    # Phase 5: Multi-Turn Session Intelligence
    # =========================================================================
    session_info: Optional[Dict[str, Any]] = None
    if session_key:
        turn_risk_val = prompt_risk_score * 100.0 if prompt_threat_detected else (30.0 if has_sensitive_data else 0.0)
        combined_findings = pii_findings + prompt_findings + toxicity_findings
        turn_risk = update_multi_turn_risk(
            session_id=session_key,
            turn_risk_score=turn_risk_val,
            findings=combined_findings
        )
        session_info = {
            "session_key": session_key,
            "turn_count": turn_risk.get("turns_count", 1),
            "cumulative_risk_score": turn_risk.get("cumulative_risk_score", 0.0),
            "escalated": turn_risk.get("status") == "escalated",
            "risk_tier": turn_risk.get("status", "normal"),
        }
        if turn_risk.get("status") == "escalated" and not blocked:
            blocked = True
            blocked_by = "multi_turn_drift"
            block_message = f"Request blocked due to multi-turn adversarial drift (Risk score: {turn_risk.get('cumulative_risk_score', 0):.2f})"

    overall_detected = has_sensitive_data or prompt_threat_detected or len(toxicity_findings) > 0 or (session_info and session_info.get("escalated", False))

    return ScanResponse(
        detected=overall_detected,
        has_sensitive_data=has_sensitive_data,
        findings=pii_findings,
        processed_text=processed_text,
        blocked=blocked,
        blocked_by=blocked_by,
        block_message=block_message,
        prompt_threat_detected=prompt_threat_detected,
        prompt_findings=prompt_findings,
        prompt_risk_score=prompt_risk_score,
        detection_tier=detection_tier,
        toxicity_findings=toxicity_findings,
        session_info=session_info,
    )


@router.post("/input", response_model=ScanResponse)
def scan_input_endpoint(
    payload: ScanRequest,
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    x_session_id: Optional[str] = Header(None, alias="X-Session-Id"),
):
    """
    Standard Input Scanning Endpoint.
    Evaluates inbound prompts across the 5-Phase pipeline.
    """
    return _execute_scan_pipeline(payload, x_tenant_id=x_tenant_id, x_session_id=x_session_id)


@router.post("/output", response_model=ScanResponse)
def scan_output_endpoint(
    payload: ScanRequest,
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    x_session_id: Optional[str] = Header(None, alias="X-Session-Id"),
):
    """
    Standard Output Scanning Endpoint.
    Evaluates LLM output text for data leaks, toxicity, and compliance before delivery.
    """
    return _execute_scan_pipeline(payload, x_tenant_id=x_tenant_id, x_session_id=x_session_id)
