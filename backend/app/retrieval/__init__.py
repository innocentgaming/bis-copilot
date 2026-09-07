"""BIS Copilot Knowledge / RAG Retrieval Foundation package."""

from backend.app.retrieval.citations import CitationBuilder
from backend.app.retrieval.diversification import Diversifier
from backend.app.retrieval.evidence import EvidencePackager
from backend.app.retrieval.exceptions import (
    EmbeddingQueryError,
    EvidencePackagingError,
    KeywordSearchError,
    QueryValidationError,
    RerankerError,
    RetrievalError,
    VectorSearchError,
)
from backend.app.retrieval.filters import FilterBuilder
from backend.app.retrieval.hybrid import HybridFusion
from backend.app.retrieval.keyword_search import KeywordSearcher
from backend.app.retrieval.models import (
    CitationReference,
    Evidence,
    RetrievalMethod,
    RetrievalRequest,
    RetrievalResponse,
    RetrievalResult,
    RetrievalStatus,
)
from backend.app.retrieval.query import QueryNormalizer
from backend.app.retrieval.reranker import (
    CrossEncoderReranker,
    NoOpReranker,
    Reranker,
    get_reranker,
)
from backend.app.retrieval.scoring import ScoreNormalizer, sort_candidates_deterministic
from backend.app.retrieval.service import RetrievalService
from backend.app.retrieval.vector_search import VectorSearcher

__all__ = [
    # Core Service
    "RetrievalService",
    # Data Contracts
    "RetrievalRequest",
    "RetrievalResult",
    "RetrievalResponse",
    "Evidence",
    "CitationReference",
    "RetrievalMethod",
    "RetrievalStatus",
    # Query Processing
    "QueryNormalizer",
    # Database Searchers
    "VectorSearcher",
    "KeywordSearcher",
    "FilterBuilder",
    # Fusion & Scoring
    "HybridFusion",
    "ScoreNormalizer",
    "sort_candidates_deterministic",
    # Reranking & Diversification
    "Reranker",
    "NoOpReranker",
    "CrossEncoderReranker",
    "get_reranker",
    "Diversifier",
    # Evidence & Citations
    "CitationBuilder",
    "EvidencePackager",
    # Exceptions
    "RetrievalError",
    "QueryValidationError",
    "EmbeddingQueryError",
    "VectorSearchError",
    "KeywordSearchError",
    "RerankerError",
    "EvidencePackagingError",
]
