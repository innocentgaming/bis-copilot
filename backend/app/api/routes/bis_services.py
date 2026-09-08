"""BIS Services Directory API Routes."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field

from backend.app.api.dependencies import get_request_id
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.services.bis_service import BISServiceCatalogue

router = APIRouter(prefix="/services", tags=["BIS Services"])


class BISServiceSchema(BaseModel):
    name: str
    slug: str
    category: str
    description: str
    eligibility: str
    documents_required: List[str]
    fee_structure: str
    processing_time_days: int
    how_to_apply: str
    portal_url: Optional[str] = None
    is_active: bool = True


@router.get(
    "",
    response_model=ResponseEnvelope[List[BISServiceSchema]],
    summary="List BIS services with search and category filters",
)
async def list_services(
    category: Optional[str] = Query(None, description="Category filter (e.g. Product Certification, Hallmarking)"),
    search: Optional[str] = Query(None, description="Search term for service name or keyword"),
    req_id: str = Depends(get_request_id),
):
    """Retrieve official BIS service catalogue."""
    services = BISServiceCatalogue.list_services(category=category, search=search)
    return ResponseEnvelope(
        success=True,
        data=[BISServiceSchema(**s) for s in services],
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{slug}",
    response_model=ResponseEnvelope[BISServiceSchema],
    summary="Retrieve single BIS service details by slug",
)
async def get_service(
    slug: str,
    req_id: str = Depends(get_request_id),
):
    """Fetch complete details, fee structure, and application guide for a BIS service."""
    service = BISServiceCatalogue.get_service_by_slug(slug)
    if not service:
        raise HTTPException(status_code=404, detail=f"Service '{slug}' not found")

    return ResponseEnvelope(
        success=True,
        data=BISServiceSchema(**service),
        meta=ResponseMeta(request_id=req_id),
    )
