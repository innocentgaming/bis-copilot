"""IS (Indian Standard) number normalization and parsing utilities."""

from dataclasses import dataclass
from typing import Optional
import re


@dataclass
class ParsedISNumber:
    """Parsed components of an Indian Standard identifier."""
    raw_query: str
    canonical_number: str
    base_number: Optional[str] = None
    part_number: Optional[str] = None
    year: Optional[int] = None
    compact_key: str = ""  # e.g., '191061993' or '19101993' or '1910'
    normalized_query: str = ""


class ISNormalizer:
    """Robust parser and normalizer for Indian Standard (IS) numbers.
    
    Handles common real-world user variations:
    - Extra whitespace: 'IS   1910 - 6 : 1993' -> 'IS 1910-6:1993'
    - Missing punctuation: 'IS 1910 6 1993' -> 'IS 1910-6:1993'
    - Part notations: 'IS 1910 Part 6:1993', 'IS 1910 Pt 6 1993' -> 'IS 1910-6:1993'
    - Slash notations: 'IS 1910/6/1993' -> 'IS 1910-6:1993'
    - Case insensitivity: 'is 1910-6:1993' -> 'IS 1910-6:1993'
    - Bare numbers: '1910-6:1993' -> 'IS 1910-6:1993'
    - Incomplete queries: '1910', 'IS 1910', 'IS 1910-6'
    """

    # Comprehensive regex pattern matching various IS standard representations
    # Group 1: Base number (digits)
    # Group 2: Part number (optional, e.g., '-6', ' Part 6', '/6')
    # Group 3: Year (optional, 4 digits 19xx or 20xx)
    _PATTERN = re.compile(
        r'^(?:IS\s*[:\-_./\s]*)?'                         # Optional 'IS' prefix
        r'(\d+)'                                          # Base number (e.g. 1910)
        r'(?:'                                            # Optional Part group:
            r'[\s\-_/:]*(?:part|pt|sec|p)[\s\-_/:]*(\d+)' # e.g. Part 6, Pt. 6
            r'|\s*[\-_/]\s*(\d+)'                         # e.g. - 6, / 6
            r'|\s+(\d{1,3})(?!\d)'                        # e.g. space separated part: '1910 6'
        r')?'
        r'(?:\s*[:/\-_]\s*((?:19|20)\d{2})|\s+((?:19|20)\d{2}))?' # Year: : 1993, / 1993, or space 1993
        r'$',
        re.IGNORECASE
    )

    @classmethod
    def clean_text(cls, text: str) -> str:
        """Strip and standardize whitespace."""
        if not text:
            return ""
        return re.sub(r'\s+', ' ', text.strip())

    @classmethod
    def make_compact_key(cls, text: str) -> str:
        """Remove all non-alphanumeric characters and lowercase."""
        if not text:
            return ""
        # Remove 'IS' prefix if present for uniform keying
        cleaned = re.sub(r'[^a-zA-Z0-9]', '', text).upper()
        if cleaned.startswith("IS"):
            cleaned = cleaned[2:]
        return cleaned

    @classmethod
    def parse(cls, query: str) -> ParsedISNumber:
        """Parse a query string into structured IS components."""
        raw = cls.clean_text(query)
        if not raw:
            return ParsedISNumber(
                raw_query="",
                canonical_number="",
                compact_key="",
                normalized_query="",
            )

        # Remove extra whitespace and standard punctuation noise
        normalized_str = raw
        
        # Try structured regex extraction
        match = cls._PATTERN.match(raw)
        base_num = None
        part_num = None
        year_num = None

        if match:
            base_num = match.group(1)
            part_num = match.group(2) or match.group(3) or match.group(4)
            year_str = match.group(5) or match.group(6)

            # Check if part_num was mistakenly captured when user actually supplied a 4-digit year directly
            if part_num and len(part_num) == 4 and (part_num.startswith("19") or part_num.startswith("20")) and not year_str:
                year_str = part_num
                part_num = None

            if year_str:
                try:
                    year_num = int(year_str)
                except ValueError:
                    pass

        # Build canonical representation
        if base_num:
            canonical_parts = [f"IS {base_num}"]
            if part_num:
                canonical_parts[0] += f"-{part_num}"
            if year_num:
                canonical_parts[0] += f":{year_num}"
            canonical = canonical_parts[0]
        else:
            # Fallback if regex didn't match structured pattern (e.g. text search)
            # Standardize 'is ' prefix to uppercase 'IS '
            if raw.lower().startswith("is ") or raw.lower().startswith("is-") or raw.lower().startswith("is:"):
                canonical = "IS " + raw[3:].strip()
            elif raw.lower().startswith("is") and len(raw) > 2 and raw[2].isdigit():
                canonical = "IS " + raw[2:].strip()
            else:
                canonical = raw

        compact = cls.make_compact_key(canonical)

        return ParsedISNumber(
            raw_query=raw,
            canonical_number=canonical,
            base_number=base_num,
            part_number=part_num,
            year=year_num,
            compact_key=compact,
            normalized_query=canonical,
        )
