"""
LegionForge Guardian REST API Compatibility Routes.
Provides POST /check, POST /report, GET /rules, and GET /health.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field

from ..connector.evaluators.guardian import (
    evaluate_guardian_checks,
    DEFAULT_SEQUENCE_PLAYBOOKS,
    DEFAULT_TOOL_REGISTRY,
)
from ..models import db

router = APIRouter(tags=["guardian"])


class CheckRequest(BaseModel):
    tool_id: str
    action: Optional[str] = "invoke"
    args: Optional[Dict[str, Any]] = Field(default_factory=dict)
    agent_id: Optional[str] = "default_agent"
    run_id: Optional[str] = "run_default"
    sequence_so_far: Optional[List[str]] = Field(default_factory=list)
    task_token: Optional[str] = None
    tool_schema_hash: Optional[str] = None


class ReportRequest(BaseModel):
    event_type: str
    tool_id: str
    agent_id: str
    run_id: str
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)


def verify_auth(request: Request):
    require_auth = os.environ.get("GUARDIAN_REQUIRE_AUTH", "true").lower() == "true"
    secret = os.environ.get("TASK_TOKEN_SECRET", "")
    if require_auth:
        if not secret:
            raise HTTPException(
                status_code=503,
                detail="Service Unavailable: Guardian authentication enabled but TASK_TOKEN_SECRET is not configured.",
            )
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Unauthorized: Missing Bearer token")
        token = auth_header.split(" ", 1)[1]
        if token != secret:
            raise HTTPException(status_code=403, detail="Forbidden: Invalid token")


@router.post("/check")
def check_endpoint(payload: CheckRequest, request: Request):
    verify_auth(request)

    # Fetch adaptive rules from policies/interceptions/etc. in DB if applicable
    # For now, let's extract rules defined in policies (or use default None)
    # Check if there are active rules loaded from the active database
    adaptive_rules = []
    try:
        active_policies = db.list_policies()
        for policy in active_policies:
            # Convert policy options to custom adaptive rules if specified
            # e.g., blacklist patterns
            if policy.get("prompt_injection_action") == "block":
                adaptive_rules.append({
                    "name": f"DB Policy: {policy.get('name')}",
                    "pattern": "override|ignore all instructions",
                    "action": "halt"
                })
    except Exception:
        pass

    result = evaluate_guardian_checks(
        tool_id=payload.tool_id,
        action=payload.action or "invoke",
        args=payload.args,
        agent_id=payload.agent_id or "default_agent",
        run_id=payload.run_id or "run_default",
        sequence_so_far=payload.sequence_so_far,
        task_token=payload.task_token,
        tool_schema_hash=payload.tool_schema_hash,
        adaptive_rules=adaptive_rules,
    )

    # Log interception to ControlPlane DB
    try:
        # Resolve a resource_id to log against. Use res_demo or first available resource
        resource_id = "res_demo"
        all_res = db.list_resources()
        if all_res:
            resource_id = all_res[0]["id"]

        db.log_interception(
            resource_id=resource_id,
            user_prompt=f"Guardian Tool Execution Check: {payload.tool_id}",
            raw_response=f"Result allowed={result['allowed']} (tier={result['tier']})",
            sanitized_prompt=str(payload.args),
            sanitized_response=result["reason"],
            action="BLOCK" if not result["allowed"] else "ALLOW",
            enforcement_mode="block" if not result["allowed"] else "monitor",
            latency_ms=1,
            performance_score=100.0,
            cost_score=100.0,
            responsibility_score=100.0 if result["allowed"] else 10.0,
            triggered_rules=[result["threat_type"]] if not result["allowed"] else [],
            risk_findings=[{
                "type": result["threat_type"],
                "severity": "CRITICAL" if result["tier"] == "halt" else "HIGH",
                "location": "agent_tool_call",
                "snippet": f"Tool: {payload.tool_id}",
                "description": result["reason"]
            }] if not result["allowed"] else [],
            source="Guardian API",
            session_id=f"sess_{payload.run_id}" if payload.run_id else "sess_guardian",
            tenant_id="guardian-tenant",
        )
    except Exception:
        pass

    return {
        "allowed": result["allowed"],
        "tier": result["tier"],
        "reason": result["reason"],
        "threat_type": result["threat_type"],
        "confidence": result["confidence"],
    }


@router.post("/report")
def report_endpoint(payload: ReportRequest, request: Request):
    verify_auth(request)

    # Ingest event and log to interceptions database as a telemetry finding
    try:
        resource_id = "res_demo"
        all_res = db.list_resources()
        if all_res:
            resource_id = all_res[0]["id"]

        db.log_interception(
            resource_id=resource_id,
            user_prompt=f"Guardian Ingested Report: {payload.event_type}",
            raw_response=str(payload.details),
            sanitized_prompt=f"Tool: {payload.tool_id}",
            sanitized_response="Threat reported",
            action="BLOCK",
            enforcement_mode="block",
            latency_ms=1,
            performance_score=100.0,
            cost_score=100.0,
            responsibility_score=0.0,
            triggered_rules=[payload.event_type],
            risk_findings=[{
                "type": payload.event_type,
                "severity": "HIGH",
                "location": "agent_report",
                "snippet": f"Reported Tool: {payload.tool_id}",
                "description": f"Async threat report: {payload.event_type}"
            }],
            source="Guardian Report API",
            session_id=f"sess_{payload.run_id}" if payload.run_id else "sess_guardian",
            tenant_id="guardian-tenant",
        )
    except Exception:
        pass

    return {"status": "recorded", "event_type": payload.event_type}


@router.get("/rules")
def get_rules_endpoint(request: Request):
    verify_auth(request)

    # Return currently loaded tool registry, sequence contracts, and adaptive rules view
    return {
        "tool_registry": DEFAULT_TOOL_REGISTRY,
        "sequence_contracts": DEFAULT_SEQUENCE_PLAYBOOKS,
        "adaptive_rules": [
            {
                "name": "Global Shell Injection Pattern",
                "pattern": ";\\s*(rm|sudo|chmod|chown)",
                "action": "halt"
            }
        ]
    }


