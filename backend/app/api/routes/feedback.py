"""Feedback routes for recording answer ratings and commentary."""

from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    get_current_user_optional,
    get_db_session,
    get_request_id,
)
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.api.schemas.feedback import FeedbackResponse, FeedbackSubmitRequest
from backend.app.models.user import User
from backend.app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post(
    "",
    response_model=ResponseEnvelope[FeedbackResponse],
    summary="Submit satisfaction rating on an assistant answer",
)
async def submit_feedback(
    request: FeedbackSubmitRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
    req_id: str = Depends(get_request_id),
):
    """Record positive (+1) or negative (-1) rating and optional commentary."""
    fb = await FeedbackService.submit_feedback(
        session=session,
        request=request,
        user=current_user,
    )
    return ResponseEnvelope(
        success=True,
        data=fb,
        meta=ResponseMeta(request_id=req_id),
    )
