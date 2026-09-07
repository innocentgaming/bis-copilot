"""Custom exception hierarchy for the Phase 3 RAG Retrieval Foundation."""


class RetrievalError(Exception):
    """Base exception for all retrieval operations."""
    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class QueryValidationError(RetrievalError):
    """Raised when a user query fails validation criteria."""
    pass


class EmbeddingQueryError(RetrievalError):
    """Raised when vector embedding generation for a query fails."""
    pass


class VectorSearchError(RetrievalError):
    """Raised when pgvector cosine similarity search encounters a database error."""
    pass


class KeywordSearchError(RetrievalError):
    """Raised when PostgreSQL full-text search encounters a database error."""
    pass


class RerankerError(RetrievalError):
    """Raised when the reranking step fails."""
    pass


class EvidencePackagingError(RetrievalError):
    """Raised when structuring evidence or citations fails."""
    pass
