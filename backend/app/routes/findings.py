"""
Risk Findings & Interceptions API routes for ControlPlane AI.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..models import db

from fastapi import APIRouter, HTTPException, Header, Query

router = APIRouter(prefix="/api/v1/findings", tags=["findings"])


class UpdateFindingStatusRequest(BaseModel):
    status: str = Field(..., min_length=1)


class FeedbackRequest(BaseModel):
    feedback_type: str = Field(..., min_length=1)  # false_positive, true_positive, overridden
    notes: Optional[str] = None


@router.get("")
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


@router.get("/{finding_id}")
def get_finding_detail(finding_id: str):
    finding = db.get_interception(finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail="Finding event not found")
    return finding


@router.patch("/{finding_id}/status")
def update_finding_status(finding_id: str, payload: UpdateFindingStatusRequest):
    updated = db.update_interception_status(finding_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Finding not found")
    return updated


@router.post("/{finding_id}/feedback")
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

