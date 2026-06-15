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
from .routes.resources import router as resources_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Botpress Connector API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resources_router)


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
_FRONTEND_DIR = Path(os.environ.get("FRONTEND_DIST", Path(__file__).resolve().parents[2] / "frontend"))

if _FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(_FRONTEND_DIR), html=True), name="frontend")
