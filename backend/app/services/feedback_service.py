"""Feedback management service for assistant response quality ratings."""

from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.errors import BaseApiException, ErrorCodes, NotFoundException
from backend.app.api.schemas.feedback import FeedbackResponse, FeedbackSubmitRequest
from backend.app.models.chat import Conversation, Feedback, Message
from backend.app.models.user import User
from backend.app.observability.metrics import metrics


class FeedbackService:
    """Records satisfaction ratings and correction notes."""

    @staticmethod
    async def submit_feedback(
        session: AsyncSession,
        request: FeedbackSubmitRequest,
        user: Optional[User] = None,
    ) -> FeedbackResponse:
        """Submit feedback on an assistant message with user check."""
        if request.rating not in (-1, 1):
            raise BaseApiException(
                code=ErrorCodes.INVALID_REQUEST,
                message="Feedback rating must be either 1 (positive) or -1 (negative).",
            )

        msg = await session.get(Message, request.message_id)
        if not msg:
            raise NotFoundException("Message", request.message_id)

        # Check conversation accessibility if user authenticated
        if user and user.role != "admin":
            conv = await session.get(Conversation, msg.conversation_id)
            if conv and conv.user_id is not None and conv.user_id != user.id:
                raise BaseApiException(
                    code=ErrorCodes.FORBIDDEN,
                    message="You do not have permission to rate messages in this conversation.",
                )

        feedback = Feedback(
            message_id=request.message_id,
            user_id=user.id if user else None,
            rating=request.rating,
            is_correct=request.is_correct,
            comment=request.comment,
        )
        session.add(feedback)
        await session.flush()
        await session.refresh(feedback)

        metrics.record_feedback(request.rating)

        return FeedbackResponse(
            id=feedback.id,
            message_id=feedback.message_id,
            user_id=feedback.user_id,
            rating=feedback.rating,
            is_correct=feedback.is_correct,
            comment=feedback.comment,
            created_at=feedback.created_at.isoformat() if feedback.created_at else None,
        )
