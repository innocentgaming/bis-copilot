"""Production OpenAI-compatible LLM provider implementation."""

import asyncio
import json
import logging
import time
from typing import Any, AsyncIterator, Dict, List, Optional
import httpx

from backend.app.config import get_settings
from backend.app.generation.deterministic_provider import DeterministicLLMProvider
from backend.app.generation.exceptions import (
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from backend.app.generation.provider import LLMProvider, LLMResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class OpenAICompatibleProvider(LLMProvider):
    """Client for OpenAI and OpenAI-compatible API providers (vLLM, Ollama, Groq, Mistral)."""

    def __init__(
        self,
        api_key: Optional[str] = settings.LLM_API_KEY,
        base_url: Optional[str] = settings.LLM_BASE_URL,
        model: str = settings.LLM_MODEL,
        timeout: float = float(settings.LLM_TIMEOUT_SECONDS),
        max_retries: int = settings.LLM_MAX_RETRIES,
    ):
        self.api_key = api_key or ""
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")
        self.model = model
        self.timeout = timeout
        self.max_retries = max_retries

    async def generate(
        self,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.0,
        max_tokens: int = 1500,
        timeout: float = 30.0,
    ) -> LLMResponse:
        if not self.api_key:
            raise ProviderUnavailableError(
                "LLM_API_KEY is not configured for OpenAICompatibleProvider."
            )

        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }

        t0 = time.perf_counter()
        last_exc: Optional[Exception] = None

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=timeout or self.timeout) as client:
                    resp = await client.post(endpoint, headers=headers, json=payload)
                    resp.raise_for_status()
                    data = resp.json()

                    latency = (time.perf_counter() - t0) * 1000
                    choice = data["choices"][0]
                    content = choice["message"]["content"]
                    usage = data.get("usage", {})

                    return LLMResponse(
                        content=content,
                        model=self.model,
                        provider="openai_compatible",
                        input_tokens=usage.get("prompt_tokens", 0),
                        output_tokens=usage.get("completion_tokens", 0),
                        total_tokens=usage.get("total_tokens", 0),
                        finish_reason=choice.get("finish_reason", "stop"),
                        latency_ms=round(latency, 2),
                        raw_response=data if settings.STORE_RAW_LLM_RESPONSE else None,
                    )
            except httpx.TimeoutException as exc:
                last_exc = exc
                logger.warning(f"LLM call timed out on attempt {attempt}/{self.max_retries}: {exc}")
                if attempt == self.max_retries:
                    raise ProviderTimeoutError(f"LLM request timed out after {attempt} attempts") from exc
            except Exception as exc:
                last_exc = exc
                logger.warning(f"LLM call failed on attempt {attempt}/{self.max_retries}: {exc}")
                if attempt == self.max_retries:
                    raise ProviderUnavailableError(f"LLM provider error: {exc}") from exc

            await asyncio.sleep(0.5 * (2 ** (attempt - 1)))

        raise ProviderUnavailableError(f"LLM provider failed: {last_exc}")

    async def stream_generate(
        self,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.0,
        max_tokens: int = 1500,
        timeout: float = 30.0,
    ) -> AsyncIterator[str]:
        if not self.api_key:
            raise ProviderUnavailableError("LLM_API_KEY is not configured for streaming.")

        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", endpoint, headers=headers, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data_str = line[6:].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk_json = json.loads(data_str)
                        delta = chunk_json["choices"][0].get("delta", {})
                        if "content" in delta:
                            yield delta["content"]
                    except Exception:
                        continue


def get_llm_provider(provider_type: Optional[str] = None) -> LLMProvider:
    """Factory creating configured LLM provider instance."""
    p_type = (provider_type or settings.LLM_PROVIDER).lower().strip()
    if p_type in ("openai", "openai_compatible") and settings.LLM_API_KEY:
        return OpenAICompatibleProvider()
    return DeterministicLLMProvider()
