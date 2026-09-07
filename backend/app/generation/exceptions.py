"""Custom exception hierarchy for RAG generation and AI orchestration."""


class GenerationError(Exception):
    """Base exception for all answer generation and orchestration operations."""

    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ProviderUnavailableError(GenerationError):
    """Raised when the requested LLM provider service is unreachable or unconfigured."""
    pass


class ProviderTimeoutError(GenerationError):
    """Raised when an LLM provider generation call exceeds configured timeout bounds."""
    pass


class InvalidLLMResponseError(GenerationError):
    """Raised when the LLM returns non-JSON, incomplete, or unparseable output."""
    pass


class CitationValidationError(GenerationError):
    """Raised when model citations fail authenticity checks against retrieved evidence."""
    pass


class GroundingError(GenerationError):
    """Raised when an answer fails critical grounding checks or invents facts."""
    pass


class InsufficientEvidenceError(GenerationError):
    """Raised when available evidence cannot support answering the question."""
    pass


class SafetyValidationError(GenerationError):
    """Raised when a user query triggers prompt injection or safety guardrails."""
    pass
