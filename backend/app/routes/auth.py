"""
Authentication API routes for ControlPlane AI.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..models import db

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class GoogleLoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    name: Optional[str] = None


@router.post("/login")
def login(payload: LoginRequest):
    try:
        user = db.authenticate_user(payload.username, payload.password)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password.",
            )

        return {
            "access_token": user.get("token", "cp_jwt_token_demo"),
            "token_type": "bearer",
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "status": user["status"],
            "tenant_id": user["tenant_id"],
            "allowed_tenants": user["allowed_tenants"],
            "token": user.get("token", "cp_jwt_token_demo"),
        }
    except ValueError as ve:
        raise HTTPException(status_code=403, detail=str(ve))


@router.post("/google-login")
def google_login(payload: GoogleLoginRequest):
    res = db.google_login_or_register(payload.email, payload.name)
    if res["status"] == "pending_approval":
        raise HTTPException(status_code=403, detail=res["message"])
    return res["user"]


@router.get("/users")
def list_all_users():
    return db.list_users()


@router.post("/users/{user_id}/approve")
def approve_user_account(user_id: str):
    res = db.approve_user(user_id)
    if not res:
        raise HTTPException(status_code=404, detail="User not found")
    return res


@router.post("/users/{user_id}/reject")
def reject_user_account(user_id: str):
    res = db.reject_user(user_id)
    if not res:
        raise HTTPException(status_code=404, detail="User not found")
    return res


@router.get("/me")
def get_me():
    return {
        "username": "ankur",
        "email": "ankur@acme.com",
        "name": "Ankur Kumar Singh",
        "role": "ADMIN",
        "tenant_id": "ankur-tenant-1",
        "allowed_tenants": ["ankur-tenant-1"],
    }
