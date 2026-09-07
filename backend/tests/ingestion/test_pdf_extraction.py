"""Tests for PDF text extraction and normalization."""

import os
import pytest

from backend.app.ingestion.pdf_extractor import (
    extract_pdf_pages,
    normalize_extracted_text,
    detect_and_strip_headers_footers,
)
from backend.app.ingestion.models import ExtractedPage
from scripts.generate_sample_pdf import generate_sample_standard_pdf


@pytest.fixture(scope="module")
def sample_pdf_path():
    path = "data/samples/sample_standard.pdf"
    if not os.path.exists(path):
        generate_sample_standard_pdf(path)
    return path


def test_pdf_extraction_page_preservation(sample_pdf_path):
    """Verify pages are extracted with 1-indexed page numbers and non-empty content."""
    pages, method = extract_pdf_pages(sample_pdf_path)
    assert len(pages) == 3
    assert method == "native_pdf"

    for idx, page in enumerate(pages, 1):
        assert page.page_number == idx
        assert page.char_count > 50
        assert page.width > 0
        assert page.height > 0

    # Verify key text is captured
    assert "IS 99999:2025" in pages[0].text or "SPECIFICATION" in pages[0].text
    assert "TESTING REQUIREMENTS" in pages[1].text
    assert "Annex A" in pages[2].text


def test_text_normalization():
    """Verify conservative text normalization."""
    raw = "This is a soft-\n line wrapped word with   extra   spaces\n\n\n\nand three blank lines."
    normalized = normalize_extracted_text(raw)

    # Word rejoined
    assert "softline" in normalized
    # Excessive newlines collapsed
    assert "\n\n\n" not in normalized
    # Multiple spaces collapsed
    assert "   " not in normalized


def test_header_footer_stripping():
    """Verify repeated headers and footers are detected and stripped across pages."""
    pages = [
        ExtractedPage(page_number=1, text="REPEATED HEADER\nBody content page 1\nREPEATED FOOTER", char_count=40),
        ExtractedPage(page_number=2, text="REPEATED HEADER\nBody content page 2\nREPEATED FOOTER", char_count=40),
        ExtractedPage(page_number=3, text="REPEATED HEADER\nBody content page 3\nREPEATED FOOTER", char_count=40),
    ]

    cleaned = detect_and_strip_headers_footers(pages)
    for p in cleaned:
        assert "REPEATED HEADER" not in p.text
        assert "REPEATED FOOTER" not in p.text
        assert "Body content" in p.text
