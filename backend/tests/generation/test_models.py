"""Unit tests for Phase 4 generation data contracts and models."""

import uuid
import pytest
from pydantic import ValidationError

from backend.app.generation.models import (
    AnswerCitation,
    AnswerFilters,
    AnswerRequest,
    AnswerResponse,
    ConfidenceLevel,
    EvidenceContext,
    EvidenceItem,
    Language,
    LLMAnswerPayload,
    LLMCitation,
    ProcessingTimings,
)


def test_answer_request_valid():
    req = AnswerRequest(query="What is the tensile limit in IS 99999?", language="en")
    assert req.query == "What is the tensile limit in IS 99999?"
    assert req.language == "en"


def test_answer_request_empty_query_rejected():
    with pytest.raises(ValidationError):
        AnswerRequest(query="   \t \n ")


def test_answer_request_language_fallback():
    # Unsupported language code falls back gracefully to 'en'
    req = AnswerRequest(query="Valid query", language="fr")
    assert req.language == "en"


def test_evidence_item_model():
    cid = uuid.uuid4()
    item = EvidenceItem(
        evidence_id="E1",
        chunk_id=cid,
        content="Breaking load must be at least 450 N.",
        standard_number="IS 99999:2025",
        clause_number="5.2",
        relevance_score=0.92,
        citation_text="[IS 99999:2025, Clause 5.2]",
    )
    assert item.evidence_id == "E1"
    assert item.chunk_id == cid
    assert item.relevance_score == 0.92


def test_llm_answer_payload():
    payload = LLMAnswerPayload(
        answer="The breaking load is 450 N.",
        confidence=0.95,
        evidence_used=["E1"],
        citations=[
            LLMCitation(
                evidence_id="E1",
                standard="IS 99999:2025",
                clause="5.2",
            )
        ],
        insufficient_evidence=False,
    )
    assert payload.confidence == 0.95
    assert len(payload.citations) == 1
    assert payload.citations[0].standard == "IS 99999:2025"
