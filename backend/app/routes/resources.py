"""
REST API routes (Section 6 of the spec).

Routes:
  POST   /api/v1/resources                  - onboard a resource
  GET    /api/v1/resources                  - list resources (secrets redacted)
  GET    /api/v1/resources/{id}             - get one resource
  POST   /api/v1/resources/{id}/validate    - run validate_target()
  POST   /api/v1/resources/{id}/scan        - run execute_test() for each prompt
  GET    /api/v1/resources/{id}/scans       - list past scan results
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..connector import BotpressScanner
from ..models import db

router = APIRouter(prefix="/api/v1/resources", tags=["resources"])


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
    reply_timeout_sec: int = Field(60, ge=1, le=300)
    poll_interval_sec: int = Field(2, ge=1, le=60)


class PromptItem(BaseModel):
    vulnerability_id: str = Field(..., min_length=1)
    attack_id: str = Field(..., min_length=1)
    test_input: str = Field(..., min_length=1)


class ScanRequest(BaseModel):
    prompts: list[PromptItem]
    reset_conversation: bool = True


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------
def _resource_or_404(resource_id: str) -> dict:
    resource = db.get_resource(resource_id)
    if not resource:
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
# Routes
# ----------------------------------------------------------------------
@router.post("")
def create_resource(payload: CreateResourceRequest):
    resource = db.create_resource(payload.model_dump())
    return db.to_public_dict(resource)


@router.get("")
def list_resources():
    return [db.to_public_dict(r) for r in db.list_resources()]


@router.get("/{resource_id}")
def get_resource(resource_id: str):
    return db.to_public_dict(_resource_or_404(resource_id))


@router.post("/{resource_id}/validate")
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


@router.post("/{resource_id}/scan")
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


@router.get("/{resource_id}/scans")
def list_scans(resource_id: str):
    _resource_or_404(resource_id)
    return db.list_scans(resource_id)
