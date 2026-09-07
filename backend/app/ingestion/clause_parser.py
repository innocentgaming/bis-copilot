"""Structural clause detection and hierarchical tree builder for Indian Standards."""

import re
from typing import List, Optional, Tuple, Dict
from backend.app.ingestion.models import ExtractedPage, ParsedClause

# Regex for matching clause headers at line starts
# Matches:
# - "5 Requirements" or "5.1 General Requirements" or "5.1.2 Test Method"
# - "Annex A (Normative) Sampling Procedure" or "A.1 General"
CLAUSE_REGEX = re.compile(
    r"^(?P<num>(?:Annex\s+[A-Z]|[A-Z]\.\d+(?:\.\d+)*|\d+(?:\.\d+)*))(?:\s+(?P<heading>[A-Za-z\(][^\n]{1,150}))?$",
    re.IGNORECASE,
)


def get_parent_clause_number(clause_num: str) -> Optional[str]:
    """Determine the parent clause identifier from a hierarchical clause string.

    Examples:
        "5.2.1" -> "5.2"
        "5.2"   -> "5"
        "5"     -> None
        "A.1.2" -> "A.1"
        "A.1"   -> "Annex A"
        "Annex A" -> None
    """
    clean = clause_num.strip()

    # Case 1: Annex sub-clause like A.1 or A.1.2
    annex_sub_match = re.match(r"^([A-Z])\.(\d+(?:\.\d+)*)$", clean, re.IGNORECASE)
    if annex_sub_match:
        letter = annex_sub_match.group(1).upper()
        rest = annex_sub_match.group(2)
        if "." in rest:
            parent_rest = rest.rsplit(".", 1)[0]
            return f"{letter}.{parent_rest}"
        else:
            return f"Annex {letter}"

    # Case 2: Numbered clause like 5.2.1 or 5.2
    if "." in clean:
        parts = clean.rsplit(".", 1)
        return parts[0]

    return None


def parse_clauses_from_pages(pages: List[ExtractedPage]) -> List[ParsedClause]:
    """Parse hierarchical clauses and annexes from extracted pages.

    Preserves full text content, assigns page ranges, headings, and parent clause links.
    """
    if not pages:
        return []

    raw_clauses: List[Dict] = []
    current_clause: Optional[Dict] = None

    for page in pages:
        page_num = page.page_number
        lines = page.text.split("\n")

        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue

            match = CLAUSE_REGEX.match(line_stripped)
            if match:
                num = match.group("num").strip()
                # Normalize Annex numbering capitalization
                if num.lower().startswith("annex"):
                    parts = num.split()
                    num = f"Annex {parts[1].upper()}"

                heading = match.group("heading").strip() if match.group("heading") else None

                # Finalize previous clause
                if current_clause:
                    current_clause["page_end"] = page_num
                    raw_clauses.append(current_clause)

                # Start new clause
                is_annex = num.lower().startswith("annex") or re.match(r"^[A-Z]\.\d+", num) is not None
                current_clause = {
                    "clause_number": num,
                    "heading": heading,
                    "content_lines": [],
                    "page_start": page_num,
                    "page_end": page_num,
                    "is_annex": is_annex,
                }
            else:
                if current_clause is not None:
                    current_clause["content_lines"].append(line)
                    current_clause["page_end"] = page_num
                else:
                    # Content preceding the first detected clause (e.g., Foreword / Scope introduction)
                    # Create a default preamble clause so no text is lost
                    current_clause = {
                        "clause_number": "0",
                        "heading": "Foreword",
                        "content_lines": [line],
                        "page_start": page_num,
                        "page_end": page_num,
                        "is_annex": False,
                    }

    # Finalize the last open clause
    if current_clause:
        raw_clauses.append(current_clause)

    # Convert to ParsedClause models and resolve parent clause relationships
    parsed_list: List[ParsedClause] = []
    known_clause_numbers = {c["clause_number"] for c in raw_clauses}

    for c in raw_clauses:
        body_text = "\n".join(c["content_lines"]).strip()
        parent = get_parent_clause_number(c["clause_number"])
        # Only assign parent if parent actually exists in the document
        if parent not in known_clause_numbers:
            parent = None

        parsed_list.append(
            ParsedClause(
                clause_number=c["clause_number"],
                heading=c["heading"],
                content=body_text,
                page_start=c["page_start"],
                page_end=c["page_end"],
                parent_clause_number=parent,
                is_annex=c["is_annex"],
            )
        )

    return parsed_list
