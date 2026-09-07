"""Schemas for continuous evaluation benchmarks and metrics."""

import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class EvaluationQuestionDetail(BaseModel):
    id: uuid.UUID
    question: str
    language: str
    expected_intent: Optional[str] = None
    expected_standard_id: Optional[uuid.UUID] = None
    expected_clause_id: Optional[uuid.UUID] = None
    expected_answer: Optional[str] = None


class EvaluationRunTriggerRequest(BaseModel):
    sample_size: Optional[int] = Field(None, ge=1, le=100, description="Optional question limit")
    language: Optional[str] = Field(None, pattern="^(en|hi|mr)$")


class EvaluationRunDetail(BaseModel):
    id: uuid.UUID
    question_id: uuid.UUID
    retrieved_chunk_ids: List[str] = Field(default_factory=list)
    generated_answer: Optional[str] = None
    grounding_score: Optional[float] = None
    confidence: Optional[float] = None
    latency_ms: Optional[float] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[str] = None
