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
