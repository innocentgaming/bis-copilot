"""Regex and heuristic parser for Indian Standard (IS) number detection."""

import re
from typing import List, Optional
from backend.app.ingestion.models import ExtractedPage, StandardCandidate

# Common Indian Standard pattern variations
# Examples: IS 1293:2019, IS 1293 : 2019, IS 302-2-3, IS 13947:Part 3, IS 1234 (Part 1):2020
IS_PATTERNS = [
    # IS 1293:2019 or IS 1293 : 2019
    re.compile(r"\bIS\s+(\d+(?:\s*[-/]\s*\w+)*)\s*:\s*(\d{4})\b", re.IGNORECASE),
    # IS 1234 Part 1 : 2020 or IS 1234 (Part 1) : 2020
    re.compile(r"\bIS\s+(\d+)\s*(?:\(?Part\s*(\d+(?:\s*[-/]\s*\w+)*)\)?)\s*(?::\s*(\d{4}))?\b", re.IGNORECASE),
    # Plain IS 1234 without year
    re.compile(r"\bIS\s+(\d{3,6})\b", re.IGNORECASE),
]


def detect_standard_candidates(pages: List[ExtractedPage]) -> List[StandardCandidate]:
    """Scan extracted pages for Indian Standard numbers with confidence scoring.

    Scans the first 3 pages with higher priority as authoritative cover/title pages.
    """
    candidates: List[StandardCandidate] = []
    seen_numbers = set()

    for page in pages:
        text = page.text
        page_num = page.page_number
        # First 3 pages carry much higher authority for document identity
        base_confidence = 0.95 if page_num <= 3 else 0.70

        # Pattern 1: IS <number>:<year>
        for match in IS_PATTERNS[0].finditer(text):
            std_num = f"IS {match.group(1).strip()}:{match.group(2).strip()}"
            if std_num not in seen_numbers:
                seen_numbers.add(std_num)
                candidates.append(
                    StandardCandidate(
                        standard_number=std_num,
                        confidence=base_confidence,
                        source_page=page_num,
                        pattern_matched="IS_NUM_YEAR",
                    )
                )

        # Pattern 2: IS <number> Part <part> : <year>
        for match in IS_PATTERNS[1].finditer(text):
            num = match.group(1).strip()
            part = match.group(2).strip() if match.group(2) else ""
            year = f":{match.group(3).strip()}" if match.group(3) else ""
            part_str = f" Part {part}" if part else ""
            std_num = f"IS {num}{part_str}{year}"
            if std_num not in seen_numbers:
                seen_numbers.add(std_num)
                candidates.append(
                    StandardCandidate(
                        standard_number=std_num,
                        confidence=base_confidence,
                        source_page=page_num,
                        pattern_matched="IS_NUM_PART_YEAR",
                    )
                )

        # Pattern 3: Simple IS <number> (only if no candidate found yet on this page)
        if not candidates:
            for match in IS_PATTERNS[2].finditer(text):
                std_num = f"IS {match.group(1).strip()}"
                if std_num not in seen_numbers:
                    seen_numbers.add(std_num)
                    candidates.append(
                        StandardCandidate(
                            standard_number=std_num,
                            confidence=base_confidence - 0.15,
                            source_page=page_num,
                            pattern_matched="IS_NUM_ONLY",
                        )
                    )

    # Sort by confidence descending, then by source page ascending
    candidates.sort(key=lambda c: (-c.confidence, c.source_page))
    return candidates


def resolve_primary_standard(
    candidates: List[StandardCandidate],
    override_number: Optional[str] = None,
) -> Optional[str]:
    """Resolve the authoritative primary standard number.

    Priority:
    1. Explicit manual CLI override
    2. Highest confidence candidate from title/cover pages
    3. None if no candidates found
    """
    if override_number and override_number.strip():
        return override_number.strip()

    if not candidates:
        return None

    # Pick candidate with highest confidence (already sorted)
    return candidates[0].standard_number
