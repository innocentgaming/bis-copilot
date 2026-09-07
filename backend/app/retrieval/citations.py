"""Authoritative citation building from database chunk entities."""

from typing import Any, Dict, List, Optional
from uuid import UUID

from backend.app.retrieval.models import CitationReference


class CitationBuilder:
    """Formats exact, verifiable citation references pointing to source standard documents."""

    @staticmethod
    def format_citation_string(
        standard_number: Optional[str] = None,
        clause_number: Optional[str] = None,
        heading: Optional[str] = None,
        page_start: Optional[int] = None,
        page_end: Optional[int] = None,
        chunk_id: Optional[UUID] = None,
    ) -> str:
        """Format an authoritative citation string, e.g. '[IS 1293:2019, Clause 5.2, pp. 14–15]'.
        
        Preserves actual database attributes without inventing ungrounded citations.
        """
        parts: List[str] = []

        # Standard identifier
        if standard_number:
            parts.append(standard_number.strip())
        else:
            parts.append("BIS Document")

        # Clause or Annex identifier
        if clause_number:
            c_clean = clause_number.strip()
            if c_clean.lower().startswith("annex"):
                parts.append(c_clean)
            else:
                parts.append(f"Clause {c_clean}")

        # Page reference
        if page_start is not None and page_end is not None:
            if page_start == page_end:
                parts.append(f"p. {page_start}")
            else:
                parts.append(f"pp. {page_start}–{page_end}")
        elif page_start is not None:
            parts.append(f"p. {page_start}")
        elif page_end is not None:
            parts.append(f"p. {page_end}")

        return f"[{', '.join(parts)}]"

    @classmethod
    def from_candidate(cls, candidate: Dict[str, Any]) -> CitationReference:
        """Construct a CitationReference model from a retrieved candidate dictionary."""
        std_num = candidate.get("standard_number")
        cls_num = candidate.get("clause_number")
        heading = candidate.get("heading")
        p_start = candidate.get("page_start")
        p_end = candidate.get("page_end")
        chunk_id = candidate["chunk_id"]

        citation_str = cls.format_citation_string(
            standard_number=std_num,
            clause_number=cls_num,
            heading=heading,
            page_start=p_start,
            page_end=p_end,
            chunk_id=chunk_id,
        )

        return CitationReference(
            document_id=candidate.get("document_id"),
            standard_id=candidate.get("standard_id"),
            clause_id=candidate.get("clause_id"),
            standard_number=std_num,
            clause_number=cls_num,
            page_start=p_start,
            page_end=p_end,
            chunk_id=chunk_id,
            citation_text=citation_str,
        )
