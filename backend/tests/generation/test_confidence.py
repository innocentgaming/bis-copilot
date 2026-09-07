"""Unit tests for ConfidenceEngine calibrated score levels."""

import uuid
from backend.app.generation.confidence import ConfidenceEngine
from backend.app.generation.models import (
    CitationValidationResult,
    ConfidenceLevel,
    EvidenceContext,
    EvidenceItem,
    GroundingCheckResult,
)


def create_confidence_context(score: float = 0.95, has_conflicts: bool = False):
    cid = uuid.uuid4()
    item = EvidenceItem(
        evidence_id="E1",
        chunk_id=cid,
        content="Testing requirements.",
        standard_number="IS 99999:2025",
        relevance_score=score,
        citation_text="[IS 99999:2025]",
    )
    return EvidenceContext(
        query="query",
        intent="general",
        items=[item],
        has_conflicts=has_conflicts,
    )


def test_confidence_high():
    ctx = create_confidence_context(score=0.95)
    grounding = GroundingCheckResult(grounding_score=1.0, is_grounded=True)
    citations = CitationValidationResult(is_valid=True, valid_citations=[{"cite": 1}])

    score, level = ConfidenceEngine.calculate_confidence(ctx, grounding, citations)
    assert level == ConfidenceLevel.HIGH
    assert score >= 0.75


def test_confidence_insufficient_when_flagged():
    ctx = create_confidence_context(score=0.10)
    grounding = GroundingCheckResult(grounding_score=0.0, is_grounded=False)
    citations = CitationValidationResult(is_valid=False)

    score, level = ConfidenceEngine.calculate_confidence(ctx, grounding, citations, insufficient_evidence=True)
    assert level == ConfidenceLevel.INSUFFICIENT
    assert score <= 0.20


def test_confidence_conflict_penalty():
    ctx_normal = create_confidence_context(score=0.85, has_conflicts=False)
    ctx_conflict = create_confidence_context(score=0.85, has_conflicts=True)

    grounding = GroundingCheckResult(grounding_score=0.9, is_grounded=True)
    citations = CitationValidationResult(is_valid=True, valid_citations=[{"cite": 1}])

    score_normal, _ = ConfidenceEngine.calculate_confidence(ctx_normal, grounding, citations)
    score_conflict, _ = ConfidenceEngine.calculate_confidence(ctx_conflict, grounding, citations)

    assert score_conflict < score_normal
