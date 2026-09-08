"""Pydantic schemas for BIS IS Number lookup."""

from typing import List, Optional
from pydantic import BaseModel, Field


class StandardRecord(BaseModel):
    """Full record for an Indian Standard (8 primary dataset columns + metadata)."""
    id: Optional[int] = None
    is_number: str = Field(..., description="The standard identifier, e.g. IS 1910-6:1993")
    title: str = Field(..., description="Title/name of the standard")
    section: str = Field(..., description="BIS sectional division (e.g. Chemical, Mechanical)")
    year_notified: Optional[int] = Field(None, description="Year the standard was notified")
    ics_code: Optional[str] = Field(None, description="International Classification for Standards code")
    status: str = Field(..., description="Standard status: Active, Under Revision, or Withdrawn")
    applicable_to: Optional[str] = Field(None, description="Product or subject category the standard applies to")
    scope_description: Optional[str] = Field(None, description="Description of standard scope and coverage")


class CloseMatchRecord(BaseModel):
    """Close or partial match standard record with explanation."""
    standard: StandardRecord
    match_reason: str = Field(..., description="Explanation of why this standard matches closely")
    similarity_score: float = Field(..., description="Relevance score from 0.0 to 1.0")


class ISLookupResponse(BaseModel):
    """Response payload for IS Number lookup endpoint."""
    query: str
    normalized_query: str
    match_type: str = Field(..., description="'exact', 'partial', or 'none'")
    exact_match: Optional[StandardRecord] = None
    close_matches: List[CloseMatchRecord] = Field(default_factory=list)
    total_results: int = 0
    message: str = ""
