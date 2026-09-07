"""Conversation and message schemas for session management."""

import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class CitationDetail(BaseModel):
    id: uuid.UUID
    citation_text: str
    standard_id: Optional[uuid.UUID] = None
    clause_id: Optional[uuid.UUID] = None
    page_number: Optional[int] = None
    relevance_score: Optional[float] = None


class MessageDetail(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    intent: Optional[str] = None
    confidence: Optional[float] = None
    created_at: Optional[str] = None
    citations: List[CitationDetail] = Field(default_factory=list)


class ConversationDetail(BaseModel):
    id: uuid.UUID
    title: str
    language: str
    user_id: Optional[uuid.UUID] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    message_count: int = 0


class ConversationCreateRequest(BaseModel):
    title: Optional[str] = Field("New Conversation", max_length=255)
    language: str = Field("en", pattern="^(en|hi|mr)$")
