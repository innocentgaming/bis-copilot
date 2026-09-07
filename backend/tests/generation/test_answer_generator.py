"""Unit tests for AnswerGenerator parsing and fallback behaviors."""

import pytest
from backend.app.generation.answer_generator import AnswerGenerator
from backend.app.generation.deterministic_provider import DeterministicLLMProvider
from backend.app.generation.exceptions import InvalidLLMResponseError
from backend.app.generation.models import EvidenceContext, EvidenceItem


def test_parse_payload_with_markdown_fences():
    generator = AnswerGenerator(DeterministicLLMProvider())
    raw_with_fences = """```json
{
  "answer": "Grounded answer text.",
  "confidence": 0.90,
  "evidence_used": ["E1"],
  "citations": [],
  "caveats": [],
  "insufficient_evidence": false,
  "follow_up_questions": [],
  "intent": "requirement_question"
}
```"""
    payload = generator.parse_payload(raw_with_fences)
    assert payload.answer == "Grounded answer text."
    assert payload.confidence == 0.90


def test_parse_payload_invalid_json_raises():
    generator = AnswerGenerator(DeterministicLLMProvider())
    with pytest.raises(InvalidLLMResponseError):
        generator.parse_payload("This is plain conversational text, not valid JSON.")


def test_create_fallback_payload_insufficient_evidence():
    generator = AnswerGenerator(DeterministicLLMProvider())
    empty_ctx = EvidenceContext(query="What is XYZ?", intent="general", items=[], quality="INSUFFICIENT")

    payload = generator.create_fallback_payload(empty_ctx)
    assert payload.insufficient_evidence is True
    assert "could not find sufficient evidence" in payload.answer
    assert len(payload.citations) == 0
