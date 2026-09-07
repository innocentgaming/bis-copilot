"""BIS Copilot RAG Answer Generation and AI Orchestration package."""

from backend.app.generation.answer_generator import AnswerGenerator
from backend.app.generation.citation_validator import CitationValidator
from backend.app.generation.confidence import ConfidenceEngine
from backend.app.generation.context import EvidenceContextBuilder
from backend.app.generation.conversation import ConversationManager
from backend.app.generation.deterministic_provider import DeterministicLLMProvider
from backend.app.generation.exceptions import (
    CitationValidationError,
    GenerationError,
    GroundingError,
    InsufficientEvidenceError,
    InvalidLLMResponseError,
    ProviderTimeoutError,
    ProviderUnavailableError,
    SafetyValidationError,
)
from backend.app.generation.grounding import GroundingValidator
from backend.app.generation.llm_provider import OpenAICompatibleProvider, get_llm_provider
from backend.app.generation.logging import GenerationLogger
from backend.app.generation.models import (
    AnswerCitation,
    AnswerFilters,
    AnswerRequest,
    AnswerResponse,
    CitationValidationResult,
    ConfidenceLevel,
    EvidenceContext,
    EvidenceItem,
    GroundingCheckResult,
    Language,
    LLMAnswerPayload,
    LLMCitation,
    ProcessingTimings,
)
from backend.app.generation.orchestration import GenerationOrchestrator
from backend.app.generation.prompts import PromptBuilder
from backend.app.generation.provider import LLMProvider, LLMResponse
from backend.app.generation.response_formatter import ResponseFormatter
from backend.app.generation.safety import SafetyChecker
from backend.app.generation.streaming import StreamingManager

__all__ = [
    # Master Orchestration
    "GenerationOrchestrator",
    "AnswerGenerator",
    "EvidenceContextBuilder",
    # Providers
    "LLMProvider",
    "LLMResponse",
    "DeterministicLLMProvider",
    "OpenAICompatibleProvider",
    "get_llm_provider",
    # Validation & Guards
    "CitationValidator",
    "GroundingValidator",
    "ConfidenceEngine",
    "SafetyChecker",
    # Formatting & Streaming
    "PromptBuilder",
    "ResponseFormatter",
    "StreamingManager",
    "ConversationManager",
    "GenerationLogger",
    # Models & Schemas
    "AnswerRequest",
    "AnswerResponse",
    "AnswerFilters",
    "EvidenceItem",
    "EvidenceContext",
    "LLMCitation",
    "LLMAnswerPayload",
    "AnswerCitation",
    "ConfidenceLevel",
    "Language",
    "CitationValidationResult",
    "GroundingCheckResult",
    "ProcessingTimings",
    # Exceptions
    "GenerationError",
    "ProviderUnavailableError",
    "ProviderTimeoutError",
    "InvalidLLMResponseError",
    "CitationValidationError",
    "GroundingError",
    "InsufficientEvidenceError",
    "SafetyValidationError",
]
