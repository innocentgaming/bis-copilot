"""PDF text extraction and normalization preserving page boundaries."""

import re
import unicodedata
from collections import Counter
from typing import List, Tuple, Optional
import pymupdf as fitz

from backend.app.ingestion.models import ExtractedPage
from backend.app.ingestion.ocr import is_ocr_needed, extract_page_with_ocr
from backend.app.ingestion.exceptions import PDFExtractionError


def normalize_extracted_text(text: str) -> str:
    """Conservatively normalize extracted text while preserving technical symbols and numbers.

    Rules:
    - Normalizes Unicode characters (NFKC)
    - Replaces non-breaking spaces and exotic whitespace with standard space
    - Reconnects hyphenated words split across line breaks (e.g., 're- \\n quirement')
    - Reduces 3+ consecutive newlines to 2
    - Strips leading and trailing whitespace
    """
    if not text:
        return ""

    # 1. Unicode normalization
    text = unicodedata.normalize("NFKC", text)

    # 2. Convert non-breaking space and control chars
    text = text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")

    # 3. Fix soft hyphenation broken by line wrapping (e.g. "certifi-\n cation" -> "certification")
    # Be conservative: only merge when preceding is letters and following is lower-case letter
    text = re.sub(r"([a-zA-Z]{2,})-\s*\n\s*([a-z]{2,})", r"\1\2", text)

    # 4. Collapse 3+ newlines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 5. Collapse excessive spaces and tabs (not newlines)
    text = re.sub(r"[ \t]{2,}", " ", text)

    return text.strip()


def detect_and_strip_headers_footers(pages: List[ExtractedPage]) -> List[ExtractedPage]:
    """Detect and remove repeated boilerplate running headers/footers.

    Only lines appearing in identical form at the very top (first 2 lines)
    or very bottom (last 2 lines) across > 70% of pages (minimum 3 pages) are removed.
    """
    if len(pages) < 3:
        return pages

    top_lines = []
    bottom_lines = []

    for page in pages:
        lines = [line.strip() for line in page.text.split("\n") if line.strip()]
        if lines:
            top_lines.append(lines[0])
            if len(lines) > 1:
                bottom_lines.append(lines[-1])

    threshold = len(pages) * 0.7
    top_counter = Counter(top_lines)
    bottom_counter = Counter(bottom_lines)

    repeated_headers = {line for line, count in top_counter.items() if count >= threshold}
    repeated_footers = {line for line, count in bottom_counter.items() if count >= threshold}

    if not repeated_headers and not repeated_footers:
        return pages

    cleaned_pages: List[ExtractedPage] = []
    for page in pages:
        lines = page.text.split("\n")
        filtered_lines = []
        for i, line in enumerate(lines):
            stripped = line.strip()
            # Check top 2 lines for header
            if i < 2 and stripped in repeated_headers:
                continue
            # Check bottom 2 lines for footer
            if i >= len(lines) - 2 and stripped in repeated_footers:
                continue
            filtered_lines.append(line)

        new_text = "\n".join(filtered_lines).strip()
        cleaned_pages.append(
            ExtractedPage(
                page_number=page.page_number,
                text=new_text,
                char_count=len(new_text),
                width=page.width,
                height=page.height,
                is_ocr=page.is_ocr,
                warnings=page.warnings,
            )
        )

    return cleaned_pages


def extract_pdf_pages(
    file_path: str,
    ocr_enabled: bool = True,
    ocr_language: str = "eng",
    strip_headers: bool = True,
) -> Tuple[List[ExtractedPage], str]:
    """Extract page-by-page text from PDF with PyMuPDF and OCR fallback.

    Args:
        file_path: Path to PDF file.
        ocr_enabled: Whether to attempt OCR if native text layer is insufficient.
        ocr_language: OCR language code (default 'eng').
        strip_headers: Whether to remove detected running headers/footers.

    Returns:
        Tuple of (list_of_ExtractedPage, extraction_method_string).
    """
    try:
        doc = fitz.open(file_path)
    except Exception as exc:
        raise PDFExtractionError(f"Failed to open PDF document: {exc}", file_path=file_path)

    raw_pages: List[ExtractedPage] = []

    try:
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            rect = page.rect
            page_text = page.get_text("text")

            # Extract tables if available in PyMuPDF
            try:
                tables = page.find_tables()
                if tables and len(tables.tables) > 0:
                    table_texts = []
                    for t in tables:
                        df_rows = t.extract()
                        if df_rows:
                            table_str = "\nTABLE:\n" + "\n".join(
                                " | ".join(str(cell) if cell is not None else "" for cell in row)
                                for row in df_rows
                            )
                            table_texts.append(table_str)
                    if table_texts:
                        page_text += "\n" + "\n".join(table_texts)
            except Exception:
                pass  # Fall back gracefully to standard text

            normalized = normalize_extracted_text(page_text)
            raw_pages.append(
                ExtractedPage(
                    page_number=page_idx + 1,
                    text=normalized,
                    char_count=len(normalized),
                    width=rect.width,
                    height=rect.height,
                    is_ocr=False,
                )
            )

        # Check if OCR fallback is needed
        needs_ocr, reason = is_ocr_needed(raw_pages)
        extraction_method = "native_pdf"

        if needs_ocr and ocr_enabled:
            extraction_method = "ocr"
            ocr_pages: List[ExtractedPage] = []
            for page_idx in range(len(doc)):
                ocr_p = extract_page_with_ocr(doc, page_idx, language=ocr_language)
                ocr_p.text = normalize_extracted_text(ocr_p.text)
                ocr_p.char_count = len(ocr_p.text)
                ocr_pages.append(ocr_p)
            raw_pages = ocr_pages

    finally:
        doc.close()

    # Strip repeated headers and footers if requested
    if strip_headers:
        final_pages = detect_and_strip_headers_footers(raw_pages)
    else:
        final_pages = raw_pages

    return final_pages, extraction_method
