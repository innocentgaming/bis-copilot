"""FastAPI application entry point for BIS Copilot."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.middleware import (
    RequestContextMiddleware,
    register_exception_handlers,
)
from backend.app.api.routes import api_router
from backend.app.cache.memory import cache
from backend.app.config import get_settings, validate_environment
from backend.app.database.connection import (
    check_async_connection,
    check_pgvector_available,
    check_schema_initialized,
)
from backend.app.observability.logging import api_logger

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown events."""
    validate_environment(settings)
    api_logger.info(
        "Starting BIS Copilot API server",
        extra={"route": "startup", "latency_ms": 0.0},
    )
    yield
    # Clean up caches and background connections on shutdown
    await cache.clear()
    api_logger.info("BIS Copilot API server shutdown complete.")


app = FastAPI(
    title="BIS Copilot API",
    description=(
        "Production-grade, anti-hallucinatory AI Assistant platform for Indian Standards (IS), "
        "Bureau of Indian Standards (BIS) regulations, laboratory testing, and conformity assessment."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# 1. CORS Configuration
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Processing-Time-Ms"],
)

# 2. Request Tracking and Security Headers
app.add_middleware(RequestContextMiddleware)

# 3. Global Exception Handlers formatting common ResponseEnvelope
register_exception_handlers(app)

# 4. Mount API Routes (v1 and alias /api)
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")


@app.get(
    "/health",
    summary="Root process health and liveness probe",
    description="Indicates that the API application process is running and reports lightweight DB connectivity.",
    tags=["System"],
)
async def health_check():
    """Root health check endpoint."""
    db_ok = await check_async_connection()
    status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "alive" if db_ok else "degraded",
            "database": "ok" if db_ok else "unavailable",
            "service": "bis-copilot-backend",
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0",
        },
    )


@app.get(
    "/ready",
    summary="Root dependency readiness probe",
    description="Verifies operational readiness of critical dependencies including PostgreSQL, pgvector, and schema initialization.",
    tags=["System"],
)
async def readiness_check():
    """Root readiness probe inspecting critical dependencies."""
    db_ok = await check_async_connection()
    vector_ok = await check_pgvector_available() if db_ok else False
    schema_ok = await check_schema_initialized() if db_ok else False

    is_ready = db_ok and vector_ok and schema_ok
    status_code = status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE

    content = {
        "status": "ready" if is_ready else "not_ready",
        "dependencies": {
            "database": "connected" if db_ok else "unavailable",
            "pgvector": "available" if vector_ok else ("unavailable" if db_ok else "unreachable"),
            "schema": "initialized" if schema_ok else ("uninitialized" if db_ok else "unreachable"),
            "rag_engine": "ready",
        },
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
    }
    return JSONResponse(status_code=status_code, content=content)


@app.get("/", summary="Root endpoint", tags=["System"])
async def root():
    return {
        "project": "BIS Copilot",
        "description": "AI-powered Intelligent Assistant for Indian Standards and BIS Services (SIH 26107)",
        "version": "1.0.0",
        "api_v1": "/api/v1",
        "docs": "/docs",
        "health": "/health",
        "ready": "/ready",
    }
