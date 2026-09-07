"""Direct search route exposing Phase 3 hybrid retrieval without LLM answer generation."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import get_db_session, get_request_id
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.services.search_service import SearchResponseData, SearchService

router = APIRouter(prefix="/search", tags=["Search"])


class DirectSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="Keyword or technical search string")
    standard_number: Optional[str] = Field(None, description="Filter by Indian Standard number")
    clause_number: Optional[str] = Field(None, description="Filter by clause identifier")
    limit: int = Field(10, ge=1, le=50, description="Max candidate chunks to return")


@router.post(
    "",
    response_model=ResponseEnvelope[SearchResponseData],
    summary="Direct hybrid retrieval over Indian Standards database",
)
async def search(
    request: DirectSearchRequest,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Retrieve scored document chunks and citations directly without answer generation."""
    search_data = await SearchService.search(
        session=session,
        query=request.query,
        standard_number=request.standard_number,
        clause_number=request.clause_number,
        limit=request.limit,
    )
    return ResponseEnvelope(
        success=True,
        data=search_data,
        meta=ResponseMeta(
            request_id=req_id,
            processing_ms=search_data.duration_ms,
        ),
    )


@router.get(
    "",
    response_model=ResponseEnvelope[SearchResponseData],
    summary="Direct hybrid retrieval via query parameters",
)
async def search_get(
    q: str = Query(..., min_length=1, max_length=1000, description="Search query"),
    standard_number: Optional[str] = Query(None, description="Standard filter"),
    clause_number: Optional[str] = Query(None, description="Clause filter"),
    top_k: int = Query(10, ge=1, le=50, alias="limit"),
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Retrieve scored document chunks via GET query parameters."""
    search_data = await SearchService.search(
        session=session,
        query=q,
        standard_number=standard_number,
        clause_number=clause_number,
        limit=top_k,
    )
    return ResponseEnvelope(
        success=True,
        data=search_data,
        meta=ResponseMeta(
            request_id=req_id,
            processing_ms=search_data.duration_ms,
        ),
    )
