"""Tests for metadata and Indian Standard number detection."""

import os
import pytest

from backend.app.ingestion.metadata import extract_document_metadata
from backend.app.ingestion.standard_parser import detect_standard_candidates, resolve_primary_standard
from backend.app.ingestion.models import ExtractedPage, IngestionOptions
from scripts.generate_sample_pdf import generate_sample_standard_pdf


@pytest.fixture(scope="module")
def sample_pdf_path():
    path = "data/samples/sample_standard.pdf"
    if not os.path.exists(path):
        generate_sample_standard_pdf(path)
    return path


def test_standard_number_detection():
    """Verify regex detects various formats of Indian Standards."""
    pages = [
        ExtractedPage(page_number=1, text="Cover page\nIS 1293:2019\nPlugs and Socket Outlets", char_count=50),
        ExtractedPage(page_number=2, text="Reference to IS 302 Part 1:2018 in text", char_count=40),
    ]

    candidates = detect_standard_candidates(pages)
    std_numbers = [c.standard_number for c in candidates]

    assert "IS 1293:2019" in std_numbers
    assert any("IS 302 Part 1" in s for s in std_numbers)

    # First page candidate has higher confidence
    assert candidates[0].standard_number == "IS 1293:2019"
    assert candidates[0].confidence >= 0.90


def test_metadata_extraction_from_sample_pdf(sample_pdf_path):
    """Verify metadata extraction extracts standard number and title from sample PDF."""
    from backend.app.ingestion.pdf_extractor import extract_pdf_pages
    pages, _ = extract_pdf_pages(sample_pdf_path)

    options = IngestionOptions()
    meta = extract_document_metadata(sample_pdf_path, pages, options)

    assert meta["standard_number"] == "IS 99999:2025"
    assert "ELECTRIC TOASTERS" in meta["title"]
    assert meta["source_name"] == "Bureau of Indian Standards"


def test_manual_override_priority(sample_pdf_path):
    """Verify explicit CLI option overrides inferred standard number and metadata."""
    from backend.app.ingestion.pdf_extractor import extract_pdf_pages
    pages, _ = extract_pdf_pages(sample_pdf_path)

    options = IngestionOptions(
        standard_number_override="IS-OVERRIDE:2099",
        document_type_override="regulation",
        source_name_override="Manual Quality Authority",
    )
    meta = extract_document_metadata(sample_pdf_path, pages, options)

    assert meta["standard_number"] == "IS-OVERRIDE:2099"
    assert meta["document_type"] == "regulation"
    assert meta["source_name"] == "Manual Quality Authority"
