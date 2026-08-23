"""
FastAPI entry point.

- Mounts the resources router under /api/v1/resources
- Exposes /health and /ready for liveness/readiness probes
- Serves the static frontend (frontend/ build or plain HTML) at /
- CORS is wide-open by default for the demo; see README "Auth" section --
  this deployment has no authentication, so CORS is intentionally permissive.
  In a production deployment this would be restricted to the UI's origin.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .models.db import init_db
from .routes.auth import router as auth_router
from .routes.findings import router as findings_router
from .routes.guardrail import router as guardrail_router
from .routes.hallucination import router as hallucination_router
from .routes.resources import router as resources_router
from .routes.tokens import router as tokens_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="ControlPlane AI Governance API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(tokens_router)
app.include_router(findings_router)
app.include_router(guardrail_router)
app.include_router(resources_router)
app.include_router(hallucination_router)




@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ready")
def ready():
    # Touches the DB to confirm it is reachable/initializable.
    from .models import db

    try:
        db.list_resources()
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not_ready"})
    return {"status": "ready"}


# ----------------------------------------------------------------------
# Serve the static frontend, if present, at /
# ----------------------------------------------------------------------
frontend_env = os.environ.get("FRONTEND_DIST")
_FRONTEND_DIR = None

if frontend_env:
    cand = Path(frontend_env).resolve()
    if cand.exists():
        _FRONTEND_DIR = cand

if not _FRONTEND_DIR or not _FRONTEND_DIR.exists():
    base_root = Path(__file__).resolve().parents[2]
    candidates = [
        base_root / "frontend",
        Path.cwd() / "frontend",
        Path("/app/frontend"),
        Path("./frontend").resolve()
    ]
    for cand in candidates:
        if cand.exists():
            _FRONTEND_DIR = cand
            break

if _FRONTEND_DIR and _FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(_FRONTEND_DIR), html=True), name="frontend")
