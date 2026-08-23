"""
Guardrail real-time evaluation routes for ControlPlane AI.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel, Field

from ..connector.guardrail import ControlPlaneGuardrail
from ..models import db

router = APIRouter(prefix="/api/v1/resources", tags=["guardrail"])


class CheckRequest(BaseModel):
    user_prompt: str = Field(..., min_length=1)
    raw_response: Optional[str] = None
    session_id: Optional[str] = None


@router.post("/{resource_id}/check")
def check_guardrail(
    resource_id: str,
    payload: CheckRequest,
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    tenant_id: Optional[str] = Query(None),
):
    active_tenant = tenant_id or x_tenant_id or "acme-tenant-1"

    resource = db.get_resource(resource_id)
    if not resource and resource_id == "res_demo":
        all_resources = db.list_resources()
        if all_resources:
            resource = all_resources[0]
        else:
            resource = db.create_resource({
                "account_name": "Demo Account",
                "resource_name": "Global AI Guardrail",
                "webhook_id": "demo-webhook-id",
                "use_case_type": "customer_support",
            })
    elif not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    policy = db.get_policy_for_resource(resource_id)
    guardrail = ControlPlaneGuardrail(policy)
    eval_result = guardrail.evaluate(payload.user_prompt, payload.raw_response)

    # Log interception to DB under Endpoint source
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
        source="Endpoint",
        session_id=payload.session_id,
        tenant_id=active_tenant,
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
        "policy_applied": eval_result["policy_applied"],
    }
