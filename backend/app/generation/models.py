"""Data contracts and validation models for RAG answer generation and AI orchestration."""

from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, ConfigDict, Field, field_validator


class Language(str, Enum):
    """Supported multilingual generation languages."""
    EN = "en"
    HI = "hi"
    MR = "mr"


class ConfidenceLevel(str, Enum):
    """Calibrated confidence classifications."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INSUFFICIENT = "INSUFFICIENT"


class AnswerFilters(BaseModel):
    """Optional search filtering constraints for generation requests."""
    model_config = ConfigDict(extra="ignore")

    standard_number: Optional[str] = None
    clause_number: Optional[str] = None
    status: Optional[str] = "active"


class AnswerRequest(BaseModel):
    """Inbound request for question answering."""
    model_config = ConfigDict(extra="ignore")

    query: str = Field(..., min_length=1, description="User question or research query")
    conversation_id: Optional[UUID] = None
    language: str = Field(default="en", description="Target language: en, hi, mr")
    filters: Optional[AnswerFilters] = None
    stream: bool = False
    user_id: Optional[UUID] = None

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Query must contain at least 1 non-whitespace character")
        if len(s) > 2000:
            raise ValueError("Query exceeds maximum allowed length of 2000 characters")
        return s

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        lang = v.strip().lower()
        if lang not in {"en", "hi", "mr"}:
            return "en"
        return lang


class EvidenceItem(BaseModel):
    """Discrete, structured authoritative evidence chunk framed for prompt injection."""
    model_config = ConfigDict(extra="ignore")

    evidence_id: str = Field(..., description="Deterministic prompt token e.g. E1, E2")
    chunk_id: UUID
    content: str
    standard_number: Optional[str] = None
    standard_title: Optional[str] = None
    clause_number: Optional[str] = None
    clause_heading: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    document_id: Optional[UUID] = None
    document_name: Optional[str] = None
    relevance_score: float
    retrieval_method: str = "hybrid"
    citation_text: str


class EvidenceContext(BaseModel):
    """Curated, delimited evidence package supplied to LLM generation."""
    model_config = ConfigDict(extra="ignore")

    query: str
    intent: str
    items: List[EvidenceItem] = Field(default_factory=list)
    total_items: int = 0
    quality: str = "GOOD"  # GOOD, WEAK, INSUFFICIENT
    has_conflicts: bool = False
    warnings: List[str] = Field(default_factory=list)


class LLMCitation(BaseModel):
    """Citation item produced by LLM in structured response."""
    model_config = ConfigDict(extra="ignore")

    evidence_id: str
    standard: str
    clause: Optional[str] = None
    pages: Optional[str] = None


class LLMAnswerPayload(BaseModel):
    """Raw structured JSON payload schema expected from LLM."""
    model_config = ConfigDict(extra="ignore")

    answer: str
    confidence: float = 0.0
    evidence_used: List[str] = Field(default_factory=list)
    citations: List[LLMCitation] = Field(default_factory=list)
    caveats: List[str] = Field(default_factory=list)
    insufficient_evidence: bool = False
    follow_up_questions: List[str] = Field(default_factory=list)
    intent: Optional[str] = None


class CitationValidationResult(BaseModel):
    """Outcome of verifying model citations against authentic database evidence."""
    model_config = ConfigDict(extra="ignore")

    is_valid: bool
    repaired: bool = False
    valid_citations: List[Dict[str, Any]] = Field(default_factory=list)
    invalid_citations: List[Dict[str, Any]] = Field(default_factory=list)
    repaired_citations: List[Dict[str, Any]] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class GroundingCheckResult(BaseModel):
    """Outcome of deterministic grounding checks against retrieved evidence."""
    model_config = ConfigDict(extra="ignore")

    grounding_score: float
    is_grounded: bool
    supported_claims: List[str] = Field(default_factory=list)
    unsupported_claims: List[str] = Field(default_factory=list)
    unsupported_values: List[str] = Field(default_factory=list)
    unsupported_clauses: List[str] = Field(default_factory=list)
    unsupported_standards: List[str] = Field(default_factory=list)
    violations: List[str] = Field(default_factory=list)


class ProcessingTimings(BaseModel):
    """Latency breakdown across orchestration pipeline phases."""
    model_config = ConfigDict(extra="ignore")

    # High-level phase timings
    retrieval_ms: float = 0.0
    context_ms: float = 0.0
    generation_ms: float = 0.0
    validation_ms: float = 0.0
    persistence_ms: float = 0.0
    total_ms: float = 0.0

    # Granular Phase 9 RAG observability timings
    query_validation_ms: float = 0.0
    embedding_ms: float = 0.0
    vector_search_ms: float = 0.0
    keyword_search_ms: float = 0.0
    hybrid_fusion_ms: float = 0.0
    reranking_ms: float = 0.0
    citation_validation_ms: float = 0.0
    total_pipeline_ms: float = 0.0


class SSERequestMetrics(BaseModel):
    """Real-time observability metrics for SSE streaming."""
    model_config = ConfigDict(extra="ignore")

    request_to_first_token_ms: float = 0.0
    stream_duration_ms: float = 0.0
    tokens_or_chunks_streamed: int = 0



class AnswerCitation(BaseModel):
    """Public citation reference attached to verified assistant answers."""
    model_config = ConfigDict(extra="ignore")

    standard: str
    clause: Optional[str] = None
    pages: Optional[str] = None
    chunk_id: Optional[UUID] = None
    document_id: Optional[UUID] = None
    relevance_score: Optional[float] = None
    citation_text: str


class AnswerResponse(BaseModel):
    """Complete, verified, structured response returned by generation service."""
    model_config = ConfigDict(extra="ignore")

    conversation_id: UUID
    message_id: UUID
    answer: str
    confidence: float
    confidence_level: str
    citations: List[AnswerCitation] = Field(default_factory=list)
    intent: str = "general"
    insufficient_evidence: bool = False
    caveats: List[str] = Field(default_factory=list)
    follow_up_questions: List[str] = Field(default_factory=list)
    processing: ProcessingTimings = Field(default_factory=ProcessingTimings)
    provider: str = "deterministic"
    model: str = "default"
