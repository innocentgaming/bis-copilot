"""Unit tests for candidate deduplication and clause diversification."""

import uuid
from backend.app.retrieval.diversification import Diversifier


def test_deduplicate_merges_scores_and_sources():
    cid = uuid.uuid4()
    c1 = {"chunk_id": cid, "score": 0.8, "vector_score": 0.8, "retrieval_source": "vector"}
    c2 = {"chunk_id": cid, "score": 0.9, "keyword_score": 0.9, "retrieval_source": "keyword"}

    deduped = Diversifier.deduplicate([c1, c2])
    assert len(deduped) == 1
    assert deduped[0]["score"] == 0.9
    assert deduped[0]["vector_score"] == 0.8
    assert deduped[0]["keyword_score"] == 0.9
    assert "vector" in deduped[0]["retrieval_source"]
    assert "keyword" in deduped[0]["retrieval_source"]


def test_diversify_by_clause_limits_flooding():
    # 5 chunks from clause '5.2' and 2 chunks from clause '7.1'
    clause_52_chunks = [
        {"chunk_id": uuid.uuid4(), "clause_number": "5.2", "score": 0.95 - (i * 0.01)}
        for i in range(5)
    ]
    clause_71_chunks = [
        {"chunk_id": uuid.uuid4(), "clause_number": "7.1", "score": 0.80 - (i * 0.01)}
        for i in range(2)
    ]

    all_candidates = clause_52_chunks + clause_71_chunks

    # top_k = 5, max_per_clause = 2
    diversified = Diversifier.diversify_by_clause(all_candidates, top_k=5, max_per_clause=2)

    # Clause 5.2 should have at most 2 in primary pass, clause 7.1 has 2, backfill gets 1 more from 5.2 -> total 5
    count_52 = sum(1 for c in diversified if c["clause_number"] == "5.2")
    count_71 = sum(1 for c in diversified if c["clause_number"] == "7.1")

    assert count_71 == 2
    assert count_52 == 3
    assert len(diversified) == 5
