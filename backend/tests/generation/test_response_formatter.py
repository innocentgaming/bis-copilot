"""Unit tests for ResponseFormatter."""

from backend.app.generation.models import AnswerCitation
from backend.app.generation.response_formatter import ResponseFormatter


def test_format_final_markdown():
    answer = "The breaking load is 450 N."
    citations = [
        AnswerCitation(
            standard="IS 99999:2025",
            clause="5.2",
            pages="pp. 5–6",
            citation_text="[IS 99999:2025, Clause 5.2, pp. 5–6]",
        )
    ]
    caveats = ["Testing must be performed at 25°C."]
    follow_ups = ["What are the sampling criteria?"]

    formatted = ResponseFormatter.format_final_markdown(
        answer=answer,
        citations=citations,
        caveats=caveats,
        follow_ups=follow_ups,
    )

    assert "The breaking load is 450 N." in formatted
    assert "**Authoritative References:**" in formatted
    assert "IS 99999:2025" in formatted
    assert "**Compliance Notes & Caveats:**" in formatted
    assert "**Suggested Follow-up Inquiries:**" in formatted
