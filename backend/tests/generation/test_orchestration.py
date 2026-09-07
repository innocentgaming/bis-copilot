"""Unit tests for GenerationOrchestrator master pipeline."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from backend.app.generation.deterministic_provider import DeterministicLLMProvider
from backend.app.generation.models import AnswerRequest, ConfidenceLevel
from backend.app.generation.orchestration import GenerationOrchestrator
from backend.app.retrieval.models import (
    CitationReference,
    RetrievalResponse,
    RetrievalResult,
)


@pytest.fixture
def mock_session():
    session = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def sample_retrieval_response():
    cid = uuid.uuid4()
    chunk = RetrievalResult(
        chunk_id=cid,
        content="Under IS 99999:2025 Clause 5.2, breaking load shall withstand a minimum force of 450 N at 25°C.",
        score=0.94,
        standard_number="IS 99999:2025",
        clause_number="5.2",
        heading="Mechanical Performance",
        page_start=5,
        page_end=6,
    )
    citation = CitationReference(
        chunk_id=cid,
        standard_number="IS 99999:2025",
        clause_number="5.2",
        page_start=5,
        page_end=6,
        citation_text="[IS 99999:2025, Clause 5.2, pp. 5–6]",
    )
    return RetrievalResponse(
        query="What is the breaking load?",
        normalized_query="What is the breaking load?",
        results=[chunk],
        citations=[citation],
        total_candidates=1,
    )


@pytest.mark.asyncio
async def test_orchestrator_successful_answer(mock_session, sample_retrieval_response):
    mock_retrieval = AsyncMock()
    mock_retrieval.retrieve.return_value = sample_retrieval_response

    orchestrator = GenerationOrchestrator(
        session=mock_session,
        retrieval_service=mock_retrieval,
        llm_provider=DeterministicLLMProvider(),
    )

    req = AnswerRequest(query="What is the breaking load in Clause 5.2?", language="en")
    resp = await orchestrator.answer(req)

    assert resp.insufficient_evidence is False
    assert resp.confidence >= 0.70
    assert resp.confidence_level in ("HIGH", "MEDIUM")
    assert "IS 99999:2025" in resp.answer
    assert len(resp.citations) == 1
    assert resp.citations[0].standard == "IS 99999:2025"
    assert resp.processing.total_ms > 0


@pytest.mark.asyncio
async def test_orchestrator_insufficient_evidence_refusal(mock_session):
    empty_resp = RetrievalResponse(
        query="What is the requirement for unknown product?",
        normalized_query="What is the requirement for unknown product?",
        results=[],
        citations=[],
        total_candidates=0,
    )
    mock_retrieval = AsyncMock()
    mock_retrieval.retrieve.return_value = empty_resp

    orchestrator = GenerationOrchestrator(
        session=mock_session,
        retrieval_service=mock_retrieval,
        llm_provider=DeterministicLLMProvider(),
    )

    req = AnswerRequest(query="What is the requirement for unknown product?")
    resp = await orchestrator.answer(req)

    assert resp.insufficient_evidence is True
    assert resp.confidence_level == ConfidenceLevel.INSUFFICIENT.value
    assert "could not find sufficient evidence" in resp.answer
