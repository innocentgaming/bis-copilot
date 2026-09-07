"""Document and standard metadata extraction prioritizing authoritative sources."""

import os
import re
from datetime import date
from typing import Dict, Any, Optional, List
import pymupdf as fitz

from backend.app.ingestion.models import ExtractedPage, IngestionOptions
from backend.app.ingestion.standard_parser import detect_standard_candidates, resolve_primary_standard


def extract_metadata_from_filename(filename: str) -> Dict[str, Any]:
    """Extract standard number and basic title cues from file naming conventions."""
    base = os.path.splitext(os.path.basename(filename))[0]
    meta: Dict[str, Any] = {}

    # Match patterns like IS_1293_2019 or IS-1293-2019
    match = re.search(r"\bIS[_\-\s]*(\d+)[_\-\s]*(\d{4})?\b", base, re.IGNORECASE)
    if match:
        num = match.group(1)
        year = f":{match.group(2)}" if match.group(2) else ""
        meta["inferred_standard_number"] = f"IS {num}{year}"

    # Replace underscores/hyphens with spaces for a fallback title
    cleaned_title = re.sub(r"[_\-]+", " ", base).strip()
    if cleaned_title:
        meta["fallback_title"] = cleaned_title

    return meta


def extract_document_metadata(
    file_path: str,
    pages: List[ExtractedPage],
    options: IngestionOptions,
) -> Dict[str, Any]:
    """Resolve document metadata following the priority chain:

    1. Explicit CLI options
    2. PDF embedded metadata
    3. Filename cues
    4. First-page text heuristics
    """
    metadata: Dict[str, Any] = {
        "title": None,
        "standard_number": None,
        "edition": None,
        "version": "1.0",
        "publication_date": None,
        "effective_date": None,
        "document_type": "standard",
        "source_name": "Bureau of Indian Standards",
        "source_url": None,
        "language": "en",
        "scope": None,
    }

    # 1. Inspect first page text for Title, Scope, Edition
    first_page_text = pages[0].text if pages else ""
    first_two_pages = "\n".join(p.text for p in pages[:2]) if pages else ""

    # Detect Standard Number
    candidates = detect_standard_candidates(pages[:3] if pages else [])
    resolved_std = resolve_primary_standard(candidates, override_number=options.standard_number_override)
    metadata["standard_number"] = resolved_std

    # Detect Title
    # Strategy: Look for lines following Indian Standard or IS header
    title_match = re.search(
        r"(?:Indian Standard|INDIAN STANDARD)\s*\n+([^\n]+(?:\n+[^\n]+){0,2})",
        first_two_pages,
    )
    if title_match:
        inferred_title = " ".join(title_match.group(1).split()).strip()
        # Clean out obvious boilerplate
        if len(inferred_title) > 5 and not inferred_title.startswith("IS "):
            metadata["title"] = inferred_title

    # Detect Edition
    edition_match = re.search(r"\b(\d+(?:st|nd|rd|th)?\s+Revision|\d+(?:st|nd|rd|th)?\s+Edition)\b", first_two_pages, re.IGNORECASE)
    if edition_match:
        metadata["edition"] = edition_match.group(1).strip()

    # Detect Publication Year
    year_match = re.search(r"\b(?:Published|Adopted|Approved)\s+(?:in\s+)?([A-Z][a-z]+\s+\d{4}|\d{4})\b", first_two_pages)
    if year_match:
        try:
            year_str = year_match.group(1)
            year_digits = re.search(r"\b(\d{4})\b", year_str)
            if year_digits:
                metadata["publication_date"] = date(int(year_digits.group(1)), 1, 1)
        except Exception:
            pass

    # Detect Scope (Clause 1 / Scope paragraph)
    scope_match = re.search(
        r"(?:1\s+SCOPE|1\.\s+SCOPE|SCOPE)\s*\n+([^\n]+(?:\n+[^\n]+){1,5})",
        first_two_pages,
        re.IGNORECASE,
    )
    if scope_match:
        metadata["scope"] = " ".join(scope_match.group(1).split()).strip()

    # 2. PDF metadata fallback
    try:
        doc = fitz.open(file_path)
        pdf_meta = doc.metadata or {}
        if not metadata["title"] and pdf_meta.get("title"):
            metadata["title"] = pdf_meta["title"].strip()
        doc.close()
    except Exception:
        pass

    # 3. Filename fallback for Title
    filename_meta = extract_metadata_from_filename(file_path)
    if not metadata["standard_number"] and filename_meta.get("inferred_standard_number"):
        metadata["standard_number"] = filename_meta["inferred_standard_number"]
    if not metadata["title"] and filename_meta.get("fallback_title"):
        metadata["title"] = filename_meta["fallback_title"]

    # If title is still missing, fallback to standard number or filename
    if not metadata["title"]:
        metadata["title"] = metadata["standard_number"] or os.path.basename(file_path)

    # 4. Apply explicit CLI overrides (highest priority)
    if options.standard_number_override:
        metadata["standard_number"] = options.standard_number_override.strip()
    if options.document_type_override:
        metadata["document_type"] = options.document_type_override.strip()
    if options.source_name_override:
        metadata["source_name"] = options.source_name_override.strip()
    if options.source_url_override:
        metadata["source_url"] = options.source_url_override.strip()

    return metadata
