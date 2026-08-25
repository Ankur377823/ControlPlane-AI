"""
REST API routes (Section 6 of the spec + Guardrail & Governance endpoints).

Routes:
  POST   /api/v1/resources                  - onboard a resource
  GET    /api/v1/resources                  - list resources (secrets redacted)
  GET    /api/v1/resources/{id}             - get one resource
  POST   /api/v1/resources/{id}/validate    - run validate_target()
  POST   /api/v1/resources/{id}/scan        - run execute_test() for each prompt
  GET    /api/v1/resources/{id}/scans       - list past scan results
  POST   /api/v1/resources/{id}/check       - real-time guardrail check (P, $, R)
  GET    /api/v1/resources/{id}/policy      - get guardrail policy
  PUT    /api/v1/resources/{id}/policy      - update guardrail policy
  GET    /api/v1/resources/{id}/interceptions - list live interception logs
  GET    /api/v1/analytics/summary          - aggregate platform metrics
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..connector import BotpressScanner
from ..connector.guardrail import ControlPlaneGuardrail
from ..models import db

router = APIRouter(prefix="/api/v1", tags=["resources"])


# ----------------------------------------------------------------------
# Request/response models
# ----------------------------------------------------------------------
class CreateResourceRequest(BaseModel):
    account_name: str = Field(..., min_length=1)
    resource_name: str = Field(..., min_length=1)
    webhook_id: str = Field(..., min_length=1)
    encryption_key: Optional[str] = None
    user_id: Optional[str] = None
    description: Optional[str] = None
    use_case_type: Optional[str] = "customer_support"
    ai_provider: Optional[str] = "custom"
    policy_id: Optional[str] = None
    reply_timeout_sec: int = Field(60, ge=1, le=300)
    poll_interval_sec: int = Field(2, ge=1, le=60)


class PromptItem(BaseModel):
    vulnerability_id: str = Field(..., min_length=1)
    attack_id: str = Field(..., min_length=1)
    test_input: str = Field(..., min_length=1)


class ScanRequest(BaseModel):
    prompts: list[PromptItem]
    reset_conversation: bool = True


class AdhocScanRequest(BaseModel):
    webhook_id: str = Field(..., min_length=1)
    resource_name: Optional[str] = "Custom Webhook Target"
    prompts: list[PromptItem]
    reset_conversation: bool = True


class CheckRequest(BaseModel):
    user_prompt: str = Field(..., min_length=1)
    raw_response: Optional[str] = None
    tool_call: Optional[dict] = None
    context_docs: Optional[list[str]] = None
    session_id: Optional[str] = None
    tool_history: Optional[list[dict]] = None
    source: Optional[str] = "Endpoint"
    tenant_id: Optional[str] = "ankur-tenant-1"



class UpdatePolicyRequest(BaseModel):
    enforcement_mode: Optional[str] = "block"
    pii_redaction_enabled: bool = True
    pii_sensitivity: str = "high"
    prompt_injection_action: str = "block"
    hallucination_threshold: float = Field(0.65, ge=0.0, le=1.0)
    max_tokens_limit: int = Field(2048, ge=256, le=32768)
    require_human_review_below: float = Field(0.75, ge=0.0, le=1.0)



class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class CreateTokenRequest(BaseModel):
    name: str = Field(..., min_length=1)
    resource_id: Optional[str] = "res_demo"
    days_valid: int = Field(48, ge=1, le=365)


class UpdateFindingStatusRequest(BaseModel):
    status: str = Field(..., min_length=1)


# ----------------------------------------------------------------------
# Authentication Routes
# ----------------------------------------------------------------------
@router.post("/auth/login")
def login(payload: LoginRequest):
    user = db.authenticate_user(payload.username, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password. Default is admin / password123")
    return user


@router.get("/auth/me")
def get_me():
    return {
        "username": "admin",
        "name": "Ankur Kumar Singh",
        "role": "ADMIN",
        "tenant_id": "ankur-tenant-1",
    }


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------
def _resource_or_404(resource_id: str) -> dict:
    resource = db.get_resource(resource_id)
    if not resource:
        if resource_id == "res_demo":
            all_resources = db.list_resources()
            if all_resources:
                return all_resources[0]
            return db.create_resource({
                "account_name": "Demo Account",
                "resource_name": "Global AI Guardrail",
                "webhook_id": "demo-webhook-id",
                "use_case_type": "customer_support",
            })
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource




def _scanner_for(resource: dict) -> BotpressScanner:
    return BotpressScanner(
        {
            "webhook_id": resource["webhook_id"],
            "resource_name": resource["resource_name"],
            "encryption_key": resource["encryption_key"],
            "user_id": resource["user_id"],
            "reply_timeout_sec": resource["reply_timeout_sec"],
            "poll_interval_sec": resource["poll_interval_sec"],
        }
    )


# ----------------------------------------------------------------------
# Resource Onboarding & Red-Team Scanning Routes
# ----------------------------------------------------------------------
@router.post("/resources")
def create_resource(payload: CreateResourceRequest):
    resource = db.create_resource(payload.model_dump())
    return db.to_public_dict(resource)


@router.get("/resources")
def list_resources():
    return [db.to_public_dict(r) for r in db.list_resources()]


@router.get("/resources/{resource_id}")
def get_resource(resource_id: str):
    return db.to_public_dict(_resource_or_404(resource_id))


@router.post("/resources/{resource_id}/validate")
def validate_resource(resource_id: str):
    resource = _resource_or_404(resource_id)
    scanner = _scanner_for(resource)

    is_valid = scanner.validate_target()
    db.update_validation_status(resource_id, "validated" if is_valid else "failed")

    updated = db.get_resource(resource_id)
    return {
        "resource_id": resource_id,
        "validation_status": updated["validation_status"],
        "valid": is_valid,
        "platform_metadata": scanner.get_platform_metadata(),
    }


@router.post("/resources/{resource_id}/scan")
def run_scan(resource_id: str, payload: ScanRequest):
    resource = _resource_or_404(resource_id)

    if not payload.prompts:
        raise HTTPException(status_code=400, detail="At least one prompt is required")

    scanner = _scanner_for(resource)
    results = []

    for prompt in payload.prompts:
        if payload.reset_conversation:
            scanner.reset_conversation()

        result = scanner.execute_test(
            vulnerability_id=prompt.vulnerability_id,
            attack_id=prompt.attack_id,
            test_input=prompt.test_input,
        )
        results.append(
            {
                "vulnerability_id": prompt.vulnerability_id,
                "attack_id": prompt.attack_id,
                "test_input": prompt.test_input,
                **result,
            }
        )

    scan = db.create_scan(resource_id, results)
    return {"resource_id": resource_id, "scan_id": scan["id"], "results": results}


@router.post("/scan/adhoc")
def run_adhoc_scan(payload: AdhocScanRequest):
    if not payload.prompts:
        raise HTTPException(status_code=400, detail="At least one prompt is required")

    scanner = BotpressScanner({
        "webhook_id": payload.webhook_id,
        "resource_name": payload.resource_name or "Custom Webhook Target",
        "reply_timeout_sec": 30,
        "poll_interval_sec": 2,
    })
    results = []

    for prompt in payload.prompts:
        if payload.reset_conversation:
            scanner.reset_conversation()

        result = scanner.execute_test(
            vulnerability_id=prompt.vulnerability_id,
            attack_id=prompt.attack_id,
            test_input=prompt.test_input,
        )
        results.append(
            {
                "vulnerability_id": prompt.vulnerability_id,
                "attack_id": prompt.attack_id,
                "test_input": prompt.test_input,
                **result,
            }
        )

    scan = db.create_scan("res_demo", results)
    return {
        "webhook_id": payload.webhook_id,
        "resource_name": payload.resource_name or "Custom Webhook Target",
        "scan_id": scan["id"],
        "results": results,
    }


@router.get("/resources/{resource_id}/scans")
def list_scans(resource_id: str):
    _resource_or_404(resource_id)
    return db.list_scans(resource_id)


# ----------------------------------------------------------------------
# Real-Time Guardrail & Governance Routes
# ----------------------------------------------------------------------
@router.post("/resources/{resource_id}/check")
def check_guardrail(resource_id: str, payload: CheckRequest):
    resource = _resource_or_404(resource_id)
    policy = db.get_policy_for_resource(resource_id)

    guardrail = ControlPlaneGuardrail(policy)
    eval_result = guardrail.evaluate(
        user_prompt=payload.user_prompt,
        raw_response=payload.raw_response,
        tool_call=payload.tool_call,
        context_docs=payload.context_docs,
        session_id=payload.session_id,
        tool_history=payload.tool_history,
    )

    # Persist interception event & risk findings to database
    intercept = db.log_interception(
        resource_id=resource_id,
        user_prompt=payload.user_prompt,
        raw_response=payload.raw_response,
        sanitized_prompt=eval_result["sanitized_prompt"],
        sanitized_response=eval_result["sanitized_response"],
        action=eval_result["action"],
        enforcement_mode=eval_result["enforcement_mode"],
        latency_ms=eval_result["latency_ms"],
        performance_score=eval_result["performance_score"],
        cost_score=eval_result["cost_score"],
        responsibility_score=eval_result["responsibility_score"],
        triggered_rules=eval_result["triggered_rules"],
        risk_findings=eval_result["risk_findings"],
        source=payload.source or "Endpoint",
        session_id=payload.session_id,
        tenant_id=payload.tenant_id or "ankur-tenant-1",
    )


    return {
        "interception_id": intercept["id"],
        "resource_id": resource_id,
        "action": eval_result["action"],
        "enforcement_mode": eval_result["enforcement_mode"],
        "user_prompt": eval_result["user_prompt"],
        "raw_response": eval_result["raw_response"],
        "sanitized_prompt": eval_result["sanitized_prompt"],
        "sanitized_response": eval_result["sanitized_response"],
        "latency_ms": eval_result["latency_ms"],
        "scores": {
            "performance_p": eval_result["performance_score"],
            "cost_dollars": eval_result["cost_score"],
            "responsibility_r": eval_result["responsibility_score"],
        },
        "triggered_rules": eval_result["triggered_rules"],
        "risk_findings": eval_result["risk_findings"],
        "grounding_details": eval_result.get("grounding_details"),
        "session_telemetry": eval_result.get("session_telemetry"),
        "ai_judge_verdict": eval_result.get("ai_judge_verdict"),
        "policy_applied": eval_result["policy_applied"],
    }



@router.get("/resources/{resource_id}/policy")
def get_resource_policy(resource_id: str):
    _resource_or_404(resource_id)
    return db.get_policy_for_resource(resource_id)


@router.put("/resources/{resource_id}/policy")
def update_resource_policy(resource_id: str, payload: UpdatePolicyRequest):
    resource = _resource_or_404(resource_id)
    policy_id = resource.get("policy_id") or "pol_customer_support"
    updated_policy = db.update_policy(policy_id, payload.model_dump())
    return updated_policy


@router.get("/resources/{resource_id}/interceptions")
def list_resource_interceptions(
    resource_id: str,
    limit: int = 50,
    source: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
):
    _resource_or_404(resource_id)
    return db.list_interceptions(
        resource_id=resource_id,
        limit=limit,
        source=source,
        severity=severity,
        status=status,
        search=search,
    )


@router.get("/findings")
def list_global_findings(
    source: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
):
    return db.list_interceptions(
        limit=limit,
        source=source,
        severity=severity,
        status=status,
        search=search,
    )


@router.patch("/findings/{finding_id}/status")
def update_finding_status(finding_id: str, payload: UpdateFindingStatusRequest):
    updated = db.update_interception_status(finding_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Finding not found")
    return updated


@router.get("/analytics/summary")
def get_analytics_summary(tenant_id: Optional[str] = None):
    return db.get_analytics_summary(tenant_id=tenant_id)


# ----------------------------------------------------------------------
# Token Routes for Extension Activation & Enrollment
# ----------------------------------------------------------------------
@router.get("/tokens")
def list_tokens():
    return db.list_tokens()


@router.post("/tokens")
def create_enrollment_token(payload: CreateTokenRequest):
    return db.generate_token(
        resource_id=payload.resource_id or "res_demo",
        name=payload.name,
        days_valid=payload.days_valid,
    )


@router.delete("/tokens/{token_id}")
def revoke_enrollment_token(token_id: str):
    success = db.revoke_token(token_id)
    if not success:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"status": "revoked", "token_id": token_id}


@router.get("/tokens/active")
def get_active_extension_token(resource_id: str = "res_demo"):
    return db.get_active_token(resource_id)


@router.post("/tokens/generate")
def generate_extension_token(resource_id: str = "res_demo"):
    return db.generate_token(resource_id=resource_id, name="Chrome Extension Token", days_valid=48)


