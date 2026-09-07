"""Schemas for administrative oversight and system statistics."""

from typing import Any, Dict
from pydantic import BaseModel, Field


class AdminStatisticsResponse(BaseModel):
    total_users: int
    total_documents: int
    active_documents: int
    total_standards: int
    total_clauses: int
    total_chunks: int
    total_conversations: int
    total_messages: int
    total_feedbacks: int
    positive_feedback_count: int
    negative_feedback_count: int


class SystemInfoResponse(BaseModel):
    environment: str
    version: str
    database_status: str
    vector_dimension: int
    embedding_model: str
    llm_provider: str
    llm_model: str
    caching_enabled: bool
    rate_limiting_enabled: bool
