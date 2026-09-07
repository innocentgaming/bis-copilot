"""Tests for structural clause detection and hierarchy construction."""

from backend.app.ingestion.clause_parser import (
    parse_clauses_from_pages,
    get_parent_clause_number,
)
from backend.app.ingestion.models import ExtractedPage


def test_parent_clause_number_resolution():
    """Verify parent identifier calculation logic."""
    assert get_parent_clause_number("5.2.1") == "5.2"
    assert get_parent_clause_number("5.2") == "5"
    assert get_parent_clause_number("5") is None
    assert get_parent_clause_number("A.1.2") == "A.1"
    assert get_parent_clause_number("A.1") == "Annex A"
    assert get_parent_clause_number("Annex A") is None


def test_clause_hierarchy_and_content_preservation():
    """Verify clause detection builds correct tree without losing body text."""
    sample_text = """
1 Scope
This standard specifies requirements.

2 General Requirements
The product shall be constructed safely.

2.1 Material
The material shall be stainless steel.

2.1.1 Coating
The coating shall be non-toxic.

2.2 Dimensions
Dimensions shall comply with Table 1.

Annex A (Normative) Test Methods

A.1 Mechanical Test
Perform drop test from 1 meter.
"""
    pages = [ExtractedPage(page_number=1, text=sample_text, char_count=len(sample_text))]
    clauses = parse_clauses_from_pages(pages)

    clause_map = {c.clause_number: c for c in clauses}

    # Verify all clauses are recognized
    assert "1" in clause_map
    assert "2" in clause_map
    assert "2.1" in clause_map
    assert "2.1.1" in clause_map
    assert "2.2" in clause_map
    assert "Annex A" in clause_map
    assert "A.1" in clause_map

    # Verify parent hierarchy
    assert clause_map["2"].parent_clause_number is None
    assert clause_map["2.1"].parent_clause_number == "2"
    assert clause_map["2.1.1"].parent_clause_number == "2.1"
    assert clause_map["2.2"].parent_clause_number == "2"
    assert clause_map["Annex A"].parent_clause_number is None
    assert clause_map["A.1"].parent_clause_number == "Annex A"

    # Verify content preservation
    assert "stainless steel" in clause_map["2.1"].content
    assert "non-toxic" in clause_map["2.1.1"].content
    assert "drop test" in clause_map["A.1"].content


def test_multi_page_clause_span():
    """Verify page_start and page_end update when clause spans across pages."""
    pages = [
        ExtractedPage(page_number=1, text="5 Safety Requirements\nFirst paragraph of requirement on page 1.", char_count=60),
        ExtractedPage(page_number=2, text="Continuing requirement text on page 2.\n6 Marking\nMarking details on page 2.", char_count=60),
    ]

    clauses = parse_clauses_from_pages(pages)
    clause_5 = next(c for c in clauses if c.clause_number == "5")
    clause_6 = next(c for c in clauses if c.clause_number == "6")

    assert clause_5.page_start == 1
    assert clause_5.page_end == 2
    assert clause_6.page_start == 2
    assert clause_6.page_end == 2
