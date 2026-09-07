"""Unit tests for CitationValidator authenticity and repair."""

import uuid
from backend.app.generation.citation_validator import CitationValidator
from backend.app.generation.models import EvidenceContext, EvidenceItem, LLMCitation


def create_sample_context():
    cid = uuid.uuid4()
    item = EvidenceItem(
        evidence_id="E1",
        chunk_id=cid,
        content="Testing requirements for plugs.",
        standard_number="IS 1293:2019",
        clause_number="5.2",
        page_start=14,
        page_end=15,
        relevance_score=0.95,
        citation_text="[IS 1293:2019, Clause 5.2, pp. 14–15]",
    )
    return EvidenceContext(query="query", intent="test_method", items=[item])


def test_valid_citation():
    ctx = create_sample_context()
    citations = [
        LLMCitation(
            evidence_id="E1",
            standard="IS 1293:2019",
            clause="5.2",
            pages="pp. 14–15",
        )
    ]
    res = CitationValidator.validate_citations(citations, ctx)
    assert res.is_valid is True
    assert res.repaired is False
    assert len(res.valid_citations) == 1
    assert len(res.invalid_citations) == 0


def test_fabricated_citation_purged():
    ctx = create_sample_context()
    # E99 does not exist in context, nor does IS 9999
    citations = [
        LLMCitation(
            evidence_id="E99",
            standard="IS 9999:2020",
            clause="9.9",
        )
    ]
    res = CitationValidator.validate_citations(citations, ctx)
    assert res.is_valid is False
    assert len(res.invalid_citations) == 1
    assert any("Removed fabricated citation" in w for w in res.warnings)


def test_discrepant_citation_repaired():
    ctx = create_sample_context()
    # Model referenced E1 but wrote wrong clause or wrong page numbers
    citations = [
        LLMCitation(
            evidence_id="E1",
            standard="IS 1293:2019",
            clause="9.9",  # True clause is 5.2
            pages="p. 99",  # True pages are 14-15
        )
    ]
    res = CitationValidator.validate_citations(citations, ctx)
    assert res.repaired is True
    assert len(res.valid_citations) == 1
    assert res.valid_citations[0]["clause"] == "5.2"
    assert res.valid_citations[0]["pages"] == "pp. 14–15"
