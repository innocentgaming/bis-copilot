"""Schemas for Indian Standards and clause hierarchies."""

import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class ClauseSummary(BaseModel):
    id: uuid.UUID
    clause_number: str
    heading: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    parent_clause_id: Optional[uuid.UUID] = None


class ClauseDetail(ClauseSummary):
    standard_id: uuid.UUID
    content: str
    children: List[ClauseSummary] = Field(default_factory=list)


class StandardSummary(BaseModel):
    id: uuid.UUID
    standard_number: str
    title: str
    short_title: Optional[str] = None
    edition: Optional[str] = None
    status: str
    publication_date: Optional[str] = None


class StandardDetail(StandardSummary):
    scope: Optional[str] = None
    document_id: Optional[uuid.UUID] = None
    clauses_count: int = 0
    clauses: List[ClauseSummary] = Field(default_factory=list)
