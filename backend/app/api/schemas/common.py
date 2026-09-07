"""Standard response envelope and pagination schemas."""

from datetime import datetime, timezone
from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class ResponseMeta(BaseModel):
    """Metadata payload returned with every API response."""
    request_id: str = Field(..., description="Unique request identifier")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="UTC response generation timestamp",
    )
    processing_ms: Optional[float] = Field(None, description="Request execution duration in milliseconds")


class ErrorDetail(BaseModel):
    """Detailed error object attached to unsuccessful responses."""
    code: str = Field(..., description="Standardized machine-readable error code")
    message: str = Field(..., description="Human-readable explanation of error")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Optional structured validation details")


class ResponseEnvelope(BaseModel, Generic[T]):
    """Unified API response container wrapping all endpoints."""
    success: bool = Field(True, description="True for successful status, False for errors")
    data: Optional[T] = Field(None, description="Response payload data")
    error: Optional[ErrorDetail] = Field(None, description="Error detail if success is False")
    meta: ResponseMeta = Field(..., description="Request metadata and timing")


class PaginationParams(BaseModel):
    """Standard limit and offset pagination parameters."""
    limit: int = Field(20, ge=1, le=100, description="Maximum items to return (1-100)")
    offset: int = Field(0, ge=0, description="Zero-based index of first item")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard container for paginated collections."""
    items: List[T] = Field(default_factory=list, description="Page of items")
    total: int = Field(..., description="Total available items matching query")
    limit: int = Field(..., description="Limit requested")
    offset: int = Field(..., description="Offset requested")
    has_more: bool = Field(..., description="True if subsequent pages exist")
