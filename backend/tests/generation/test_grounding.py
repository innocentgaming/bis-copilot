"""Unit tests for GroundingValidator anti-hallucination checks."""

import uuid
from backend.app.generation.grounding import GroundingValidator
from backend.app.generation.models import EvidenceContext, EvidenceItem


def create_grounding_context():
    cid = uuid.uuid4()
    item = EvidenceItem(
        evidence_id="E1",
        chunk_id=cid,
        content="Breaking load shall be tested at 25°C with a minimum force of 450 N under IS 99999:2025 Clause 5.2.",
        standard_number="IS 99999:2025",
        clause_number="5.2",
        relevance_score=0.95,
        citation_text="[IS 99999:2025, Clause 5.2]",
    )
    return EvidenceContext(query="query", intent="requirement_question", items=[item])


def test_grounding_supported_answer_passes():
    ctx = create_grounding_context()
    answer = "Under IS 99999:2025 Clause 5.2, breaking load shall withstand a minimum force of 450 N at 25°C."
    res = GroundingValidator.check_grounding(answer, ctx)
    assert res.is_grounded is True
    assert res.grounding_score >= 0.90
    assert len(res.violations) == 0


def test_grounding_unsupported_standard_violates():
    ctx = create_grounding_context()
    # Mentions IS 1234:2020 which is not in evidence
    answer = "According to IS 1234:2020 Clause 5.2, force is 450 N."
    res = GroundingValidator.check_grounding(answer, ctx)
    assert res.is_grounded is False
    assert any("IS 1234:2020" in v for v in res.violations)


def test_grounding_unsupported_numerical_limit_violates():
    ctx = create_grounding_context()
    # Hallucinates '999 N' instead of '450 N'
    answer = "Under IS 99999:2025 Clause 5.2, breaking load is 999 N."
    res = GroundingValidator.check_grounding(answer, ctx)
    assert res.grounding_score < 1.0
    assert any("999" in v for v in res.violations)


def test_grounding_unsupported_clause_violates():
    ctx = create_grounding_context()
    # Hallucinates Clause 9.9
    answer = "Under IS 99999:2025 Clause 9.9, force is 450 N."
    res = GroundingValidator.check_grounding(answer, ctx)
    assert any("9.9" in v for v in res.violations)
