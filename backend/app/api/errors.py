"""Centralized error codes, custom API exceptions, and envelope builders."""

from typing import Any, Dict, Optional
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError

# Centralized Error Code Constants
class ErrorCodes:
    # 12 Canonical Production Error Categories (Phase 9 Specification)
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    RETRIEVAL_ERROR = "RETRIEVAL_ERROR"
    EMBEDDING_ERROR = "EMBEDDING_ERROR"
    RERANKER_ERROR = "RERANKER_ERROR"
    GENERATION_ERROR = "GENERATION_ERROR"
    CITATION_ERROR = "CITATION_ERROR"
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"
    UPLOAD_ERROR = "UPLOAD_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"

    # Specialized Domain & Legacy Error Codes
    INVALID_REQUEST = "INVALID_REQUEST"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    RATE_LIMITED = "RATE_LIMITED"
    FILE_INVALID = "FILE_INVALID"
    FILE_TOO_LARGE = "FILE_TOO_LARGE"
    DUPLICATE_DOCUMENT = "DUPLICATE_DOCUMENT"
    INGESTION_FAILED = "INGESTION_FAILED"
    RETRIEVAL_FAILED = "RETRIEVAL_FAILED"
    GENERATION_FAILED = "GENERATION_FAILED"
    PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    GROUNDING_FAILED = "GROUNDING_FAILED"


def map_to_standard_category(code: str) -> str:
    """Map any specific error code to one of the 12 canonical production error categories."""
    category_map = {
        ErrorCodes.AUTHENTICATION_ERROR: ErrorCodes.AUTHENTICATION_ERROR,
        ErrorCodes.UNAUTHORIZED: ErrorCodes.AUTHENTICATION_ERROR,
        ErrorCodes.AUTHORIZATION_ERROR: ErrorCodes.AUTHORIZATION_ERROR,
        ErrorCodes.FORBIDDEN: ErrorCodes.AUTHORIZATION_ERROR,
        ErrorCodes.VALIDATION_ERROR: ErrorCodes.VALIDATION_ERROR,
        ErrorCodes.INVALID_REQUEST: ErrorCodes.VALIDATION_ERROR,
        ErrorCodes.NOT_FOUND: ErrorCodes.VALIDATION_ERROR,
        ErrorCodes.CONFLICT: ErrorCodes.VALIDATION_ERROR,
        ErrorCodes.DATABASE_ERROR: ErrorCodes.DATABASE_ERROR,
        ErrorCodes.RETRIEVAL_ERROR: ErrorCodes.RETRIEVAL_ERROR,
        ErrorCodes.RETRIEVAL_FAILED: ErrorCodes.RETRIEVAL_ERROR,
        ErrorCodes.EMBEDDING_ERROR: ErrorCodes.EMBEDDING_ERROR,
        ErrorCodes.RERANKER_ERROR: ErrorCodes.RERANKER_ERROR,
        ErrorCodes.GENERATION_ERROR: ErrorCodes.GENERATION_ERROR,
        ErrorCodes.GENERATION_FAILED: ErrorCodes.GENERATION_ERROR,
        ErrorCodes.PROVIDER_UNAVAILABLE: ErrorCodes.GENERATION_ERROR,
        ErrorCodes.CITATION_ERROR: ErrorCodes.CITATION_ERROR,
        ErrorCodes.GROUNDING_FAILED: ErrorCodes.CITATION_ERROR,
        ErrorCodes.INSUFFICIENT_EVIDENCE: ErrorCodes.CITATION_ERROR,
        ErrorCodes.RATE_LIMIT_ERROR: ErrorCodes.RATE_LIMIT_ERROR,
        ErrorCodes.RATE_LIMITED: ErrorCodes.RATE_LIMIT_ERROR,
        ErrorCodes.UPLOAD_ERROR: ErrorCodes.UPLOAD_ERROR,
        ErrorCodes.FILE_INVALID: ErrorCodes.UPLOAD_ERROR,
        ErrorCodes.FILE_TOO_LARGE: ErrorCodes.UPLOAD_ERROR,
        ErrorCodes.DUPLICATE_DOCUMENT: ErrorCodes.UPLOAD_ERROR,
        ErrorCodes.INGESTION_FAILED: ErrorCodes.UPLOAD_ERROR,
        ErrorCodes.INTERNAL_ERROR: ErrorCodes.INTERNAL_ERROR,
    }
    return category_map.get(code, ErrorCodes.INTERNAL_ERROR)



class BaseApiException(Exception):
    """Base application exception mapped to standard API error responses."""
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class NotFoundException(BaseApiException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            code=ErrorCodes.NOT_FOUND,
            message=f"{resource} '{identifier}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ConflictException(BaseApiException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code=ErrorCodes.CONFLICT,
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            details=details,
        )


class InsufficientEvidenceException(BaseApiException):
    def __init__(self, message: str = "Insufficient authoritative evidence found to reliably answer query."):
        super().__init__(
            code=ErrorCodes.INSUFFICIENT_EVIDENCE,
            message=message,
            status_code=status.HTTP_200_OK,  # Answer with safe refusal
        )


def build_error_envelope(
    code: str,
    message: str,
    request_id: str,
    details: Optional[Dict[str, Any]] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> JSONResponse:
    """Construct a standard JSONResponse containing error envelope."""
    canonical_category = map_to_standard_category(code)
    payload = {
        "success": False,
        "data": None,
        "error": {
            "code": code,
            "category": canonical_category,
            "message": message,
            "details": details or {},
        },
        "meta": {
            "request_id": request_id,
        },
    }
    return JSONResponse(status_code=status_code, content=payload)
