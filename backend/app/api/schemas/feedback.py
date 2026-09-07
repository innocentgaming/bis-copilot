"""Feedback submission and retrieval schemas."""

import uuid
from typing import Optional
from pydantic import BaseModel, Field


class FeedbackSubmitRequest(BaseModel):
    message_id: uuid.UUID = Field(..., description="Target assistant message ID")
    rating: int = Field(..., description="+1 for helpful/positive, -1 for unhelpful/negative")
    is_correct: Optional[bool] = Field(None, description="Optional accuracy judgment")
    comment: Optional[str] = Field(None, max_length=2000, description="Optional user commentary or correction")


class FeedbackResponse(BaseModel):
    id: uuid.UUID
    message_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    rating: int
    is_correct: Optional[bool] = None
    comment: Optional[str] = None
    created_at: Optional[str] = None
