"""Unit tests for LLM providers (deterministic and mock)."""

import json
import pytest
from backend.app.generation.deterministic_provider import DeterministicLLMProvider
from backend.app.generation.llm_provider import get_llm_provider


@pytest.mark.asyncio
async def test_deterministic_provider_with_evidence():
    provider = DeterministicLLMProvider()
    prompt = """
<EVIDENCE id="E1">
Standard: IS 99999:2025
Clause: 5.2
Pages: 5-6
Citation: [IS 99999:2025, Clause 5.2]
Content:
Breaking load must withstand a minimum force of 450 N.
</EVIDENCE>

QUESTION:
What is the breaking load?
"""
    messages = [{"role": "user", "content": prompt}]
    resp = await provider.generate(messages)

    assert resp.provider == "deterministic"
    assert resp.latency_ms > 0

    data = json.loads(resp.content)
    assert data["insufficient_evidence"] is False
    assert "450 N" in data["answer"]
    assert "E1" in data["evidence_used"]
    assert data["citations"][0]["standard"] == "IS 99999:2025"


@pytest.mark.asyncio
async def test_deterministic_provider_insufficient_evidence():
    provider = DeterministicLLMProvider()
    prompt = "No authoritative evidence chunks retrieved from the database.\nQUESTION: What is IS 00000?"
    messages = [{"role": "user", "content": prompt}]
    resp = await provider.generate(messages)

    data = json.loads(resp.content)
    assert data["insufficient_evidence"] is True
    assert "could not find sufficient evidence" in data["answer"]
    assert len(data["citations"]) == 0


@pytest.mark.asyncio
async def test_deterministic_provider_stream():
    provider = DeterministicLLMProvider()
    prompt = "<EVIDENCE id=\"E1\">\nStandard: IS 99999\nClause: 1\nPages: 1\nCitation: [IS 99999]\nContent:\nSample\n</EVIDENCE>"
    messages = [{"role": "user", "content": prompt}]

    tokens = []
    async for chunk in provider.stream_generate(messages):
        tokens.append(chunk)

    assembled = "".join(tokens)
    assert len(tokens) > 1
    assert "IS 99999" in assembled


def test_get_llm_provider_factory():
    provider = get_llm_provider("deterministic")
    assert isinstance(provider, DeterministicLLMProvider)
