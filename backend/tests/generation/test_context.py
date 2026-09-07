"""Unit tests for EvidenceContextBuilder."""

import uuid
from backend.app.generation.context import EvidenceContextBuilder
from backend.app.retrieval.models import (
    CitationReference,
    RetrievalResponse,
    RetrievalResult,
)


def test_build_context_limiting_and_enumeration():
    chunks = []
    citations = []
    for i in range(8):
        cid = uuid.uuid4()
        score = 0.90 - (i * 0.05)
        chunks.append(
            RetrievalResult(
                chunk_id=cid,
                content=f"Content for chunk {i}",
                score=score,
                standard_number="IS 99999:2025",
                clause_number=f"5.{i}",
            )
        )
        citations.append(
            CitationReference(
                chunk_id=cid,
                standard_number="IS 99999:2025",
                clause_number=f"5.{i}",
                citation_text=f"[IS 99999:2025, Clause 5.{i}]",
            )
        )

    resp = RetrievalResponse(
        query="test query",
        normalized_query="test query",
        results=chunks,
        citations=citations,
        total_candidates=8,
    )

    ctx = EvidenceContextBuilder.build_context(resp, max_chunks=3, min_score=0.50)
    assert ctx.total_items == 3
    assert len(ctx.items) == 3
    assert ctx.items[0].evidence_id == "E1"
    assert ctx.items[1].evidence_id == "E2"
    assert ctx.items[2].evidence_id == "E3"
    assert ctx.quality == "GOOD"


def test_build_context_filters_low_scores():
    cid = uuid.uuid4()
    weak_chunk = RetrievalResult(
        chunk_id=cid,
        content="Weak content",
        score=0.10,  # Below default min_score 0.20
        standard_number="IS 1234:2020",
    )
    resp = RetrievalResponse(
        query="query",
        normalized_query="query",
        results=[weak_chunk],
    )
    ctx = EvidenceContextBuilder.build_context(resp, min_score=0.20)
    assert ctx.total_items == 0
    assert ctx.quality == "INSUFFICIENT"


def test_build_context_conflict_detection():
    cid1, cid2 = uuid.uuid4(), uuid.uuid4()
    # Same standard prefix IS 1293 with different editions (2005 vs 2019)
    res1 = RetrievalResult(
        chunk_id=cid1,
        content="Content from 2005 edition",
        score=0.85,
        standard_number="IS 1293:2005",
    )
    res2 = RetrievalResult(
        chunk_id=cid2,
        content="Content from 2019 edition",
        score=0.84,
        standard_number="IS 1293:2019",
    )
    resp = RetrievalResponse(
        query="plugs",
        normalized_query="plugs",
        results=[res1, res2],
    )
    ctx = EvidenceContextBuilder.build_context(resp)
    assert ctx.has_conflicts is True
    assert any("Detected multiple versions" in w for w in ctx.warnings)
