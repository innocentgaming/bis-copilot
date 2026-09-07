"""Abstract base class and data contracts for LLM providers."""

import abc
from typing import Any, AsyncIterator, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class LLMResponse(BaseModel):
    """Structured response object returned by an LLMProvider."""
    model_config = ConfigDict(extra="ignore")

    content: str
    model: str
    provider: str
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    finish_reason: str = "stop"
    latency_ms: float = 0.0
    raw_response: Optional[Dict[str, Any]] = None


class LLMProvider(abc.ABC):
    """Abstract interface for multi-vendor LLM backends."""

    @abc.abstractmethod
    async def generate(
        self,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.0,
        max_tokens: int = 1500,
        timeout: float = 30.0,
    ) -> LLMResponse:
        """Execute chat completion and return structured LLMResponse."""
        pass

    @abc.abstractmethod
    async def stream_generate(
        self,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.0,
        max_tokens: int = 1500,
        timeout: float = 30.0,
    ) -> AsyncIterator[str]:
        """Stream raw token chunks asynchronously."""
        pass
