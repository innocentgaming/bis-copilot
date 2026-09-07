"""Unit tests for citation reference building and formatting."""

import uuid
from backend.app.retrieval.citations import CitationBuilder


def test_format_citation_string_full():
    citation = CitationBuilder.format_citation_string(
        standard_number="IS 1293:2019",
        clause_number="5.2",
        page_start=14,
        page_end=15,
    )
    assert citation == "[IS 1293:2019, Clause 5.2, pp. 14–15]"


def test_format_citation_string_single_page():
    citation = CitationBuilder.format_citation_string(
        standard_number="IS 99999:2025",
        clause_number="4.1",
        page_start=8,
        page_end=8,
    )
    assert citation == "[IS 99999:2025, Clause 4.1, p. 8]"


def test_format_citation_string_annex():
    citation = CitationBuilder.format_citation_string(
        standard_number="IS 99999:2025",
        clause_number="Annex A",
        page_start=22,
    )
    assert citation == "[IS 99999:2025, Annex A, p. 22]"


def test_from_candidate():
    cid = uuid.uuid4()
    candidate = {
        "chunk_id": cid,
        "standard_number": "IS 1234:2021",
        "clause_number": "6.3",
        "heading": "Tensile Requirements",
        "page_start": 10,
        "page_end": 11,
    }
    ref = CitationBuilder.from_candidate(candidate)
    assert ref.chunk_id == cid
    assert ref.standard_number == "IS 1234:2021"
    assert ref.clause_number == "6.3"
    assert ref.citation_text == "[IS 1234:2021, Clause 6.3, pp. 10–11]"
