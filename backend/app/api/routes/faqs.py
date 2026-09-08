"""BIS Frequently Asked Questions (FAQ) API Routes."""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query

from backend.app.api.dependencies import get_request_id
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.services.faq_service import FAQService

router = APIRouter(prefix="/faqs", tags=["FAQs"])


@router.get(
    "",
    response_model=ResponseEnvelope[List[Dict[str, Any]]],
    summary="List FAQs with category and keyword search",
)
async def list_faqs(
    category: Optional[str] = Query(None, description="Category filter"),
    search: Optional[str] = Query(None, description="Search term in questions or answers"),
    req_id: str = Depends(get_request_id),
):
    """Retrieve authoritative BIS questions and answers."""
    faqs = FAQService.list_faqs(category=category, search=search)
    return ResponseEnvelope(
        success=True,
        data=faqs,
        meta=ResponseMeta(request_id=req_id),
    )
