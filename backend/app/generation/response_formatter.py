"""Response formatting and presentation utilities."""

from typing import List, Optional
from backend.app.generation.models import AnswerCitation


class ResponseFormatter:
    """Formats answer text, citations, and metadata for consumer readability."""

    @classmethod
    def format_final_markdown(
        cls,
        answer: str,
        citations: List[AnswerCitation],
        caveats: Optional[List[str]] = None,
        follow_ups: Optional[List[str]] = None,
    ) -> str:
        """Structure output with clean markdown, citation links, caveats, and suggestions."""
        sections: List[str] = [answer.strip()]

        # Format Citations Section
        if citations:
            cite_lines = []
            for c in citations:
                clause_str = f", {c.clause}" if c.clause else ""
                pages_str = f", {c.pages}" if c.pages else ""
                cite_lines.append(f"- **{c.standard}**{clause_str}{pages_str}")
            sections.append("\n**Authoritative References:**\n" + "\n".join(cite_lines))

        # Format Caveats Section
        if caveats:
            clean_cav = [c.strip() for c in caveats if c.strip()]
            if clean_cav:
                sections.append("\n**Compliance Notes & Caveats:**\n" + "\n".join(f"> [!NOTE]\n> {c}" for c in clean_cav))

        # Format Follow-ups
        if follow_ups:
            clean_fup = [f.strip() for f in follow_ups if f.strip()]
            if clean_fup:
                sections.append("\n**Suggested Follow-up Inquiries:**\n" + "\n".join(f"- {f}" for f in clean_fup))

        return "\n\n".join(sections)
