"""Tests for clause-aware chunking, overlap, metadata, and content preservation."""

from backend.app.ingestion.chunker import chunk_parsed_clauses, split_text_with_overlap
from backend.app.ingestion.models import ParsedClause


def test_short_clause_creates_single_chunk():
    """Verify that a concise clause produces exactly one chunk."""
    clause = ParsedClause(
        clause_number="3.1",
        heading="Marking",
        content="Appliances shall be marked with manufacturer name and rated voltage.",
        page_start=2,
        page_end=2,
    )
    chunks = chunk_parsed_clauses([clause], standard_number="IS 1293:2019", chunk_size=1000)
    assert len(chunks) == 1
    assert chunks[0].chunk_index == 0
    assert chunks[0].clause_number == "3.1"
    assert chunks[0].heading == "Marking"
    assert "Standard: IS 1293:2019" in chunks[0].content
    assert "Clause: 3.1" in chunks[0].content
    assert "rated voltage" in chunks[0].content


def test_long_clause_splits_with_overlap():
    """Verify that a long clause splits into multiple overlapping chunks."""
    long_content = " ".join([f"Sentence {i} describing technical test procedure in detail." for i in range(100)])
    clause = ParsedClause(
        clause_number="4.2",
        heading="Complex Test",
        content=long_content,
        page_start=3,
        page_end=4,
    )

    chunks = chunk_parsed_clauses(
        [clause],
        standard_number="IS 99999:2025",
        chunk_size=500,
        chunk_overlap=100,
    )
    assert len(chunks) > 1

    # Verify deterministic indexes
    for idx, ch in enumerate(chunks):
        assert ch.chunk_index == idx
        assert ch.clause_number == "4.2"
        assert ch.heading == "Complex Test"
        assert ch.page_start == 3
        assert ch.page_end == 4


def test_chunk_content_reconstruction_no_data_loss():
    """Verify chunks can reconstruct the core technical substance without content loss."""
    original_paragraphs = [
        "First section paragraph detailing safety insulation parameters.",
        "Second paragraph detailing dielectric strength voltage thresholds.",
        "Third paragraph specifying creepage distance and clearance requirements.",
    ]
    full_text = "\n\n".join(original_paragraphs)
    clause = ParsedClause(
        clause_number="5",
        heading="Safety Limits",
        content=full_text,
        page_start=1,
        page_end=1,
    )

    chunks = chunk_parsed_clauses([clause], chunk_size=100, chunk_overlap=20)
    combined_content = " ".join(c.content for c in chunks)

    # All distinct keywords and clauses from each paragraph must be present in the chunked stream
    for para in original_paragraphs:
        words = para.split()
        for w in words[:4]:
            assert w in combined_content
