from typing import Callable, Optional
from fastapi import Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.middleware import rate_limiter
from backend.app.api.schemas.common import PaginationParams
from backend.app.auth.dependencies import (
    get_current_user_optional,
    get_db_session,
    require_admin,
    require_auditor_or_admin,
    require_authenticated_user,
)
from backend.app.config import get_settings
from backend.app.models.user import User

settings = get_settings()


def get_request_id(request: Request) -> str:
    """Retrieve the unified request ID associated with current request context."""
    return getattr(request.state, "request_id", "req-unknown")


def get_pagination(
    limit: int = Query(20, ge=1, le=100, description="Page size limit (1-100)"),
    offset: int = Query(0, ge=0, description="Page offset index"),
) -> PaginationParams:
    """Extract and validate limit/offset pagination parameters."""
    return PaginationParams(limit=limit, offset=offset)


def check_rate_limit(max_requests: int = 60, window_seconds: int = 60) -> Callable:
    """Dependency enforcing configurable sliding-window rate limit per client IP and path."""
    async def _dependency(request: Request):
        if not settings.RATE_LIMIT_ENABLED:
            return
        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}:{request.url.path}"
        if not rate_limiter.is_allowed(key, max_requests=max_requests, window_seconds=window_seconds):
            req_id = getattr(request.state, "request_id", "unknown")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded ({max_requests} req/min). Please slow down.",
                headers={"Retry-After": str(window_seconds), "X-Request-ID": req_id},
            )
    return _dependency
