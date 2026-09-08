"""Standards exploration routes."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    get_db_session,
    get_pagination,
    get_request_id,
)
from backend.app.api.errors import NotFoundException
from backend.app.api.schemas.common import (
    PaginatedResponse,
    PaginationParams,
    ResponseEnvelope,
    ResponseMeta,
)
from backend.app.api.schemas.is_lookup import ISLookupResponse
from backend.app.api.schemas.standards import (
    ClauseSummary,
    StandardDetail,
    StandardSummary,
)
from backend.app.services.is_lookup_service import ISLookupService
from backend.app.services.standard_service import StandardService

router = APIRouter(prefix="/standards", tags=["Standards"])


@router.get(
    "/lookup",
    response_model=ResponseEnvelope[ISLookupResponse],
    summary="Lookup Indian Standard by IS Number (query parameter)",
)
async def lookup_standard_query(
    q: Optional[str] = Query(None, alias="q", description="IS Number (e.g. IS 1910-6:1993, 1910-6, IS 356)"),
    is_number: Optional[str] = Query(None, alias="is_number", description="Alternative parameter for IS Number"),
    limit: int = Query(10, ge=1, le=50, description="Max close matches to return"),
    req_id: str = Depends(get_request_id),
):
    """Lookup standard specification by IS Number with formatting tolerance and close matches."""
    query_str = q or is_number or ""
    result = ISLookupService.lookup(query_str=query_str, max_close_matches=limit)
    return ResponseEnvelope(
        success=True,
        data=result,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/lookup/{is_number:path}",
    response_model=ResponseEnvelope[ISLookupResponse],
    summary="Lookup Indian Standard by IS Number (path parameter)",
)
async def lookup_standard_path(
    is_number: str,
    limit: int = Query(10, ge=1, le=50, description="Max close matches to return"),
    req_id: str = Depends(get_request_id),
):
    """Lookup standard specification by IS Number with formatting tolerance and close matches."""
    result = ISLookupService.lookup(query_str=is_number, max_close_matches=limit)
    return ResponseEnvelope(
        success=True,
        data=result,
        meta=ResponseMeta(request_id=req_id),
    )



@router.get(
    "",
    response_model=ResponseEnvelope[PaginatedResponse[StandardSummary]],
    summary="List Indian Standards with search and filters",
)
async def list_standards(
    search: Optional[str] = Query(None, description="Search term for standard number or title"),
    status: Optional[str] = Query("active", description="Filter by status ('active', 'superseded', etc.)"),
    pagination: PaginationParams = Depends(get_pagination),
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Retrieve paginated collection of Indian Standards."""
    items, total = await StandardService.list_standards(
        session=session,
        search=search,
        status_filter=status,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    paginated = PaginatedResponse(
        items=items,
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
        has_more=(pagination.offset + len(items)) < total,
    )
    return ResponseEnvelope(
        success=True,
        data=paginated,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{standard_id}",
    response_model=ResponseEnvelope[StandardDetail],
    summary="Retrieve standard specification detail and clause tree",
)
async def get_standard(
    standard_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Fetch complete metadata and top-level clauses for an Indian Standard."""
    detail = await StandardService.get_standard(session, standard_id)
    if not detail:
        raise NotFoundException("Standard", standard_id)

    return ResponseEnvelope(
        success=True,
        data=detail,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{standard_id}/clauses",
    response_model=ResponseEnvelope[List[ClauseSummary]],
    summary="List all clauses for an Indian Standard",
)
async def get_standard_clauses(
    standard_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Retrieve full clause listing for a standard."""
    detail = await StandardService.get_standard(session, standard_id)
    if not detail:
        raise NotFoundException("Standard", standard_id)

    return ResponseEnvelope(
        success=True,
        data=detail.clauses,
        meta=ResponseMeta(request_id=req_id),
    )
