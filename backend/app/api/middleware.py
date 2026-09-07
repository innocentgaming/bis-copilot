"""API Middlewares for request tracking, security headers, rate limiting, and observability."""

import time
import uuid
from typing import Callable, Dict, List
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from backend.app.api.errors import (
    BaseApiException,
    ErrorCodes,
    build_error_envelope,
)
from backend.app.config import get_settings

settings = get_settings()


from backend.app.observability.logging import api_logger


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Assigns unique X-Request-ID, measures latency, emits structured logs, and applies security headers."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Extract or generate Request ID
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000.0

        # Attach response headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Processing-Time-Ms"] = f"{duration_ms:.2f}"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Emit structured access log (sanitizing tokens/passwords automatically)
        user_id = getattr(request.state, "user_id", None)
        api_logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms:.1f}ms)",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "route": request.url.path,
                "latency_ms": round(duration_ms, 2),
                "status_code": response.status_code,
                "user_id": str(user_id) if user_id else None,
            },
        )

        return response


class InMemoryRateLimiter:
    """Sliding-window in-memory rate limiter with test-mode bypass."""

    def __init__(self):
        self._requests: Dict[str, List[float]] = {}

    def is_allowed(self, client_key: str, max_requests: int, window_seconds: int = 60) -> bool:
        if not settings.RATE_LIMIT_ENABLED:
            return True

        now = time.time()
        window_start = now - window_seconds
        timestamps = self._requests.get(client_key, [])

        # Filter out timestamps older than the sliding window
        timestamps = [ts for ts in timestamps if ts > window_start]
        if len(timestamps) >= max_requests:
            self._requests[client_key] = timestamps
            return False

        timestamps.append(now)
        self._requests[client_key] = timestamps
        return True

    def reset(self):
        """Reset rate limiter store (useful for test isolation)."""
        self._requests.clear()


rate_limiter = InMemoryRateLimiter()


def register_exception_handlers(app: FastAPI) -> None:
    """Register uniform global exception handlers formatting the common error envelope."""

    @app.exception_handler(BaseApiException)
    async def custom_api_exception_handler(request: Request, exc: BaseApiException):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        return build_error_envelope(
            code=exc.code,
            message=exc.message,
            request_id=req_id,
            details=exc.details,
            status_code=exc.status_code,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        formatted_errors = {}
        for err in exc.errors():
            loc = " -> ".join(str(p) for p in err.get("loc", []))
            formatted_errors[loc] = err.get("msg")
        return build_error_envelope(
            code=ErrorCodes.VALIDATION_ERROR,
            message="Invalid request body or query parameters.",
            request_id=req_id,
            details={"validation_errors": formatted_errors},
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            code = ErrorCodes.UNAUTHORIZED
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            code = ErrorCodes.FORBIDDEN
        elif exc.status_code == status.HTTP_404_NOT_FOUND:
            code = ErrorCodes.NOT_FOUND
        elif exc.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            code = ErrorCodes.RATE_LIMIT_ERROR
        else:
            code = ErrorCodes.INVALID_REQUEST

        headers = getattr(exc, "headers", None)
        envelope = build_error_envelope(
            code=code,
            message=str(exc.detail),
            request_id=req_id,
            status_code=exc.status_code,
        )
        if headers:
            for k, v in headers.items():
                envelope.headers[k] = v
        return envelope

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        # Never expose internal stack traces or database connection details
        return build_error_envelope(
            code=ErrorCodes.INTERNAL_ERROR,
            message="An unexpected server error occurred while processing the request.",
            request_id=req_id,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
