"""Certification schemes and compliance requirements routes."""

from typing import List
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    get_db_session,
    get_pagination,
    get_request_id,
)
from backend.app.api.errors import NotFoundException
from backend.app.api.schemas.certification import (
    CertificationRequirementSummary,
    CertificationSchemeDetail,
    CertificationSchemeSummary,
)
from backend.app.api.schemas.common import (
    PaginatedResponse,
    PaginationParams,
    ResponseEnvelope,
    ResponseMeta,
)
from backend.app.services.certification_service import CertificationService

router = APIRouter(prefix="/certification", tags=["Certification"])


@router.get(
    "/schemes",
    response_model=ResponseEnvelope[PaginatedResponse[CertificationSchemeSummary]],
    summary="List BIS certification schemes",
)
async def list_schemes(
    pagination: PaginationParams = Depends(get_pagination),
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Retrieve collection of official BIS certification schemes (e.g. ISI Scheme-I, CRS)."""
    items, total = await CertificationService.list_schemes(
        session=session,
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
    "/schemes/{scheme_id}",
    response_model=ResponseEnvelope[CertificationSchemeDetail],
    summary="Get certification scheme details and requirements",
)
async def get_scheme(
    scheme_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Fetch certification scheme specifics and associated audit requirements."""
    scheme = await CertificationService.get_scheme(session, scheme_id)
    if not scheme:
        raise NotFoundException("CertificationScheme", scheme_id)

    return ResponseEnvelope(
        success=True,
        data=scheme,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/standards/{standard_id}",
    response_model=ResponseEnvelope[List[CertificationRequirementSummary]],
    summary="Get certification requirements applicable to a standard",
)
async def get_standard_certification_requirements(
    standard_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """List mandatory certification requirements associated with an Indian Standard."""
    reqs = await CertificationService.get_requirements_for_standard(session, standard_id)
    return ResponseEnvelope(
        success=True,
        data=reqs,
        meta=ResponseMeta(request_id=req_id),
    )
