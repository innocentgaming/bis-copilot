"""Chat request and response schemas for BIS Copilot API."""

import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.generation.models import AnswerCitation, ProcessingTimings


class ChatFilters(BaseModel):
    standard_number: Optional[str] = None
    standard_id: Optional[uuid.UUID] = None
    document_id: Optional[uuid.UUID] = None
    clause_number: Optional[str] = None


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000, description="Question or compliance inquiry")
    conversation_id: Optional[uuid.UUID] = Field(None, description="Existing conversation UUID")
    language: str = Field("en", pattern="^(en|hi|ta|te|bn|mr|gu|kn|ml|pa|or)$", description="Response language (en, hi, ta, te, bn, mr, gu, kn, ml, pa, or)")
    filters: Optional[ChatFilters] = Field(None, description="Optional metadata constraints")


class ChatResponseData(BaseModel):
    conversation_id: uuid.UUID
    message_id: uuid.UUID
    answer: str
    confidence: float
    confidence_level: str
    intent: str
    insufficient_evidence: bool
    citations: List[AnswerCitation] = Field(default_factory=list)
    caveats: List[str] = Field(default_factory=list)
    follow_up_questions: List[str] = Field(default_factory=list)
    processing: ProcessingTimings = Field(default_factory=ProcessingTimings)
