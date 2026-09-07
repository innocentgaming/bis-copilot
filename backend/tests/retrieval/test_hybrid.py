"""Unit tests for hybrid search fusion algorithms."""

import uuid
from backend.app.retrieval.hybrid import HybridFusion


def test_weighted_score_fusion_both_modalities():
    cid1, cid2, cid3 = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()

    vector_candidates = [
        {"chunk_id": cid1, "vector_score": 0.9, "chunk_index": 0, "content": "chunk 1"},
        {"chunk_id": cid2, "vector_score": 0.5, "chunk_index": 1, "content": "chunk 2"},
    ]
    keyword_candidates = [
        {"chunk_id": cid2, "keyword_score": 10.0, "chunk_index": 1, "content": "chunk 2"},
        {"chunk_id": cid3, "keyword_score": 5.0, "chunk_index": 2, "content": "chunk 3"},
    ]

    fused = HybridFusion.weighted_score_fusion(
        vector_candidates=vector_candidates,
        keyword_candidates=keyword_candidates,
        vector_weight=0.6,
        keyword_weight=0.4,
    )

    assert len(fused) == 3
    ids = [c["chunk_id"] for c in fused]
    assert cid1 in ids
    assert cid2 in ids
    assert cid3 in ids
    # Each fused candidate should have an explanation
    assert "fusion_method" in fused[0]["explanation"]


def test_reciprocal_rank_fusion():
    cid1, cid2, cid3 = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()

    vector_candidates = [
        {"chunk_id": cid1, "score": 0.9, "chunk_index": 0, "content": "chunk 1"},
        {"chunk_id": cid2, "score": 0.8, "chunk_index": 1, "content": "chunk 2"},
    ]
    keyword_candidates = [
        {"chunk_id": cid2, "score": 0.95, "chunk_index": 1, "content": "chunk 2"},
        {"chunk_id": cid3, "score": 0.7, "chunk_index": 2, "content": "chunk 3"},
    ]

    fused = HybridFusion.reciprocal_rank_fusion(
        vector_candidates=vector_candidates,
        keyword_candidates=keyword_candidates,
        rrf_k=60,
    )

    # cid2 appears rank 2 in vector and rank 1 in keyword, so it should rank highest
    assert fused[0]["chunk_id"] == cid2
    assert len(fused) == 3
