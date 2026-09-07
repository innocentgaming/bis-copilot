"""Health monitoring, liveness, and readiness endpoints."""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from backend.app.api.dependencies import get_request_id
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.config import get_settings
from backend.app.database.connection import check_async_connection

settings = get_settings()
router = APIRouter(tags=["Health"])


@router.get("/health", summary="Basic health check")
async def health(req_id: str = Depends(get_request_id)):
    """Standard health endpoint reporting subsystem status."""
    db_ok = await check_async_connection()
    overall = "healthy" if db_ok else "degraded"
    return ResponseEnvelope(
        success=True,
        data={
            "status": overall,
            "database": "healthy" if db_ok else "unavailable",
            "environment": settings.ENVIRONMENT,
            "version": "0.1.0",
        },
        meta=ResponseMeta(request_id=req_id),
    )


@router.get("/health/live", summary="Liveness probe for orchestrators")
async def health_live():
    """Kubernetes/Docker liveness probe returning HTTP 200 if process is running."""
    return {"status": "alive"}


@router.get("/health/ready", summary="Readiness probe for load balancers")
async def health_ready():
    """Readiness probe returning HTTP 200 if DB is connected, HTTP 503 if unavailable."""
    db_ok = await check_async_connection()
    if db_ok:
        return {"status": "ready", "database": "connected"}
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"status": "not_ready", "database": "unavailable"},
    )


@router.get("/health/dependencies", summary="Detailed dependency status diagnostics")
async def health_dependencies(req_id: str = Depends(get_request_id)):
    """Deep dependency diagnostics for PostgreSQL, retrieval, and LLM providers."""
    db_ok = await check_async_connection()

    llm_status = "healthy"
    if settings.LLM_PROVIDER == "deterministic":
        llm_status = "healthy (deterministic mode)"
    elif settings.LLM_PROVIDER in ("openai", "openai_compatible"):
        llm_status = "healthy (configured)" if settings.LLM_API_KEY else "degraded (missing LLM_API_KEY)"

    data = {
        "status": "healthy" if db_ok else "degraded",
        "dependencies": {
            "database": "healthy" if db_ok else "unavailable",
            "retrieval": "healthy" if db_ok else "degraded (database offline)",
            "llm_provider": llm_status,
        },
        "version": "0.1.0",
    }
    return ResponseEnvelope(
        success=True,
        data=data,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get("/health/details", summary="Comprehensive subsystem health check (Legacy compatibility)")
async def detailed_health():
    """Returns granular health metrics across DB, retrieval, and generation systems."""
    db_ok = await check_async_connection()
    overall = "healthy" if db_ok else "degraded"
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": overall,
            "subsystems": {
                "database": "healthy" if db_ok else "unavailable",
                "retrieval": "healthy" if db_ok else "degraded (database offline)",
                "llm_provider": "healthy (deterministic mode)" if settings.LLM_PROVIDER == "deterministic" else "configured",
            },
            "environment": settings.ENVIRONMENT,
            "version": "0.1.0",
        },
    )
