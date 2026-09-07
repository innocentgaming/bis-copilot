"""Testing laboratory discovery and capability inspection routes."""

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
from backend.app.api.schemas.laboratories import (
    LaboratoryDetail,
    LaboratorySummary,
)
from backend.app.services.laboratory_service import LaboratoryService

router = APIRouter(prefix="/laboratories", tags=["Laboratories"])


@router.get(
    "",
    response_model=ResponseEnvelope[PaginatedResponse[LaboratorySummary]],
    summary="List accredited laboratories with geographic filters",
)
async def list_laboratories(
    city: Optional[str] = Query(None, description="Filter by city name"),
    state: Optional[str] = Query(None, description="Filter by state"),
    pincode: Optional[str] = Query(None, description="Filter by pincode"),
    pagination: PaginationParams = Depends(get_pagination),
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Retrieve paginated list of accredited testing laboratories."""
    items, total = await LaboratoryService.list_laboratories(
        session=session,
        city=city,
        state=state,
        pincode=pincode,
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
    "/search",
    response_model=ResponseEnvelope[List[LaboratorySummary]],
    summary="Search laboratories by test capability or standard number",
)
async def search_laboratories(
    query: str = Query(..., min_length=1, description="Search term for laboratory, test, or standard"),
    limit: int = Query(20, ge=1, le=50),
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Search laboratories matching testing scopes."""
    labs = await LaboratoryService.search_laboratories(session=session, query=query, limit=limit)
    return ResponseEnvelope(
        success=True,
        data=labs,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{laboratory_id}",
    response_model=ResponseEnvelope[LaboratoryDetail],
    summary="Retrieve laboratory profile and accredited capabilities",
)
async def get_laboratory(
    laboratory_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Fetch complete laboratory details with test capabilities."""
    lab = await LaboratoryService.get_laboratory(session, laboratory_id)
    if not lab:
        raise NotFoundException("Laboratory", laboratory_id)

    return ResponseEnvelope(
        success=True,
        data=lab,
        meta=ResponseMeta(request_id=req_id),
    )
