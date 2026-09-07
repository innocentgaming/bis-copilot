"""Pydantic data models for the Phase 3 RAG Retrieval Foundation."""

from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

from backend.app.config import get_settings

settings = get_settings()


class RetrievalMethod(str, Enum):
    """Supported retrieval execution methods."""
    HYBRID = "hybrid"
    VECTOR = "vector"
    KEYWORD = "keyword"


class RetrievalStatus(str, Enum):
    """Status indicating retrieval execution outcome and confidence."""
    SUCCESS = "SUCCESS"
    NO_RESULTS = "NO_RESULTS"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    PARTIAL_FALLBACK = "PARTIAL_FALLBACK"


class RetrievalRequest(BaseModel):
    """Structured request for document chunk retrieval."""
    model_config = ConfigDict(extra="ignore")

    query: str = Field(..., description="User search query string", min_length=1)
    top_k: int = Field(default=10, ge=1, le=settings.MAX_RETRIEVAL_TOP_K)
    candidate_k: int = Field(default=50, ge=1, le=settings.MAX_CANDIDATE_K)
    method: RetrievalMethod = Field(default=RetrievalMethod.HYBRID)

    # Relational & metadata filters
    standard_id: Optional[UUID] = None
    standard_number: Optional[str] = None
    document_id: Optional[UUID] = None
    clause_id: Optional[UUID] = None
    clause_number: Optional[str] = None
    language: Optional[str] = None
    source_type: Optional[str] = None
    status: Optional[str] = "active"  # By default filter to active documents; set None for all

    # Execution controls
    use_vector: bool = True
    use_keyword: bool = True
    rerank: bool = True
    debug: bool = False

    @field_validator("query")
    @classmethod
    def validate_query_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Query must contain at least 1 non-whitespace character")
        if len(stripped) > 2000:
            raise ValueError("Query exceeds maximum allowed length of 2000 characters")
        return stripped


class RetrievalResult(BaseModel):
    """Core retrieval output representing an authoritative, scored document chunk."""
    model_config = ConfigDict(extra="ignore")

    chunk_id: UUID
    content: str
    score: float = Field(..., description="Final fused/reranked relevance score")
    vector_score: Optional[float] = None
    keyword_score: Optional[float] = None
    rerank_score: Optional[float] = None

    # Traceability links
    document_id: Optional[UUID] = None
    standard_id: Optional[UUID] = None
    clause_id: Optional[UUID] = None

    # Human-readable identifiers
    standard_number: Optional[str] = None
    clause_number: Optional[str] = None
    heading: Optional[str] = None

    # Source page coordinates
    page_start: Optional[int] = None
    page_end: Optional[int] = None

    # Additional metadata & scoring explanation
    metadata: Dict[str, Any] = Field(default_factory=dict)
    explanation: Optional[Dict[str, Any]] = None


class Evidence(BaseModel):
    """Authoritative evidence package consumed by downstream LLM reasoning agents."""
    model_config = ConfigDict(extra="ignore")

    chunk_id: UUID
    document_id: Optional[UUID] = None
    standard_number: Optional[str] = None
    clause_number: Optional[str] = None
    heading: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    content: str
    relevance_score: float


class CitationReference(BaseModel):
    """Precise, verifiable citation referencing source standard, clause, and pages."""
    model_config = ConfigDict(extra="ignore")

    document_id: Optional[UUID] = None
    standard_id: Optional[UUID] = None
    clause_id: Optional[UUID] = None
    standard_number: Optional[str] = None
    clause_number: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    chunk_id: UUID
    citation_text: str = Field(
        ...,
        description="Formatted citation e.g. [IS 1293:2019, Clause 5.2, pp. 14–15]"
    )


class RetrievalResponse(BaseModel):
    """Complete retrieval service response containing scored results, evidence, and audit metrics."""
    model_config = ConfigDict(extra="ignore")

    query: str
    normalized_query: str
    status: RetrievalStatus = RetrievalStatus.SUCCESS
    results: List[RetrievalResult] = Field(default_factory=list)
    evidence: List[Evidence] = Field(default_factory=list)
    citations: List[CitationReference] = Field(default_factory=list)
    total_candidates: int = 0
    retrieval_method: str = "hybrid"
    duration_ms: float = 0.0
    warnings: List[str] = Field(default_factory=list)
    debug_info: Optional[Dict[str, Any]] = None
