"""
Enrollment Tokens API routes for ControlPlane AI (Browser Extension & Endpoint Agents).
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..models import db

router = APIRouter(prefix="/api/v1/tokens", tags=["tokens"])


class CreateTokenRequest(BaseModel):
    name: str = Field(..., min_length=1)
    resource_id: Optional[str] = "res_demo"
    days_valid: int = Field(48, ge=1, le=365)


@router.get("")
def list_tokens():
    return db.list_tokens()


@router.post("")
def create_enrollment_token(payload: CreateTokenRequest):
    return db.generate_token(
        resource_id=payload.resource_id or "res_demo",
        name=payload.name,
        days_valid=payload.days_valid,
    )


@router.delete("/{token_id}")
def revoke_enrollment_token(token_id: str):
    success = db.revoke_token(token_id)
    if not success:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"status": "revoked", "token_id": token_id}


@router.get("/active")
def get_active_extension_token(resource_id: str = "res_demo"):
    return db.get_active_token(resource_id)


@router.post("/generate")
def generate_extension_token(resource_id: str = "res_demo"):
    return db.generate_token(resource_id=resource_id, name="Chrome Extension Token", days_valid=48)
