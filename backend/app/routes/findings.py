"""
Risk Findings & Interceptions API routes for ControlPlane AI.
Includes Human-in-the-Loop Review Queue and Trustworthiness Analytics.
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel, Field

from ..models import db

router = APIRouter(prefix="/api/v1", tags=["findings"])


class UpdateFindingStatusRequest(BaseModel):
    status: str = Field(..., min_length=1)


class FeedbackRequest(BaseModel):
    feedback_type: str = Field(..., min_length=1)  # false_positive, true_positive, overridden
    notes: Optional[str] = None


class ReviewDecisionRequest(BaseModel):
    decision: str = Field(..., min_length=1)  # approve, reject, override
    reviewer_notes: Optional[str] = None
    reviewer_id: Optional[str] = "usr_reviewer_1"


@router.get("/findings")
def list_global_findings(
    source: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    tenant_id: Optional[str] = Query(None),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    limit: int = 100,
):
    active_tenant = tenant_id or x_tenant_id
    return db.list_interceptions(
        limit=limit,
        source=source,
        severity=severity,
        status=status,
        search=search,
        tenant_id=active_tenant,
    )


@router.get("/findings/review-queue")
def get_review_queue(
    status: Optional[str] = "pending",
    severity: Optional[str] = None,
    use_case_type: Optional[str] = None,
    limit: int = 50,
):
    """Retrieve items requiring Human-in-the-Loop review and approval."""
    return db.list_review_queue(
        status=status,
        severity=severity,
        use_case_type=use_case_type,
        limit=limit,
    )


@router.get("/findings/{finding_id}")
def get_finding_detail(finding_id: str):
    finding = db.get_interception(finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail="Finding event not found")
    return finding


@router.patch("/findings/{finding_id}/status")
def update_finding_status(finding_id: str, payload: UpdateFindingStatusRequest):
    updated = db.update_interception_status(finding_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Finding not found")
    return updated


@router.post("/findings/{finding_id}/review")
def submit_review_decision(finding_id: str, payload: ReviewDecisionRequest):
    """Process human reviewer decision: Approve, Reject, or Override with justification notes."""
    finding = db.get_interception(finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    result = db.process_review_decision(
        interception_id=finding_id,
        decision=payload.decision.lower(),
        reviewer_notes=payload.reviewer_notes,
        reviewer_id=payload.reviewer_id or "usr_reviewer_1",
    )
    if not result:
        raise HTTPException(status_code=400, detail="Failed to process review decision")
    return result


@router.post("/findings/{finding_id}/feedback")
def submit_finding_feedback(finding_id: str, payload: FeedbackRequest):
    finding = db.get_interception(finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    # Update status and record feedback telemetry
    new_status = "false_positive" if payload.feedback_type == "false_positive" else "resolved"
    db.update_interception_status(finding_id, new_status)
    res = db.record_feedback(finding_id, payload.feedback_type, payload.notes)
    return {
        "finding_id": finding_id,
        "status": new_status,
        "feedback_type": payload.feedback_type,
        "auto_tune_applied": res.get("auto_tune_applied", True),
        "message": f"Feedback '{payload.feedback_type}' logged. Auto-tuned policy thresholds."
    }


@router.get("/analytics/trustworthiness")
def get_trustworthiness_analytics(
    tenant_id: Optional[str] = Query("ankur-tenant-1"),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
):
    active_tenant = tenant_id or x_tenant_id or "ankur-tenant-1"
    return db.get_trustworthiness_metrics(tenant_id=active_tenant)
