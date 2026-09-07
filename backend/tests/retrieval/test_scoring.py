"""Unit tests for score normalization and ranking functions."""

import uuid
from backend.app.retrieval.scoring import ScoreNormalizer, sort_candidates_deterministic


def test_cosine_distance_to_similarity():
    assert ScoreNormalizer.cosine_distance_to_similarity(0.0) == 1.0
    assert ScoreNormalizer.cosine_distance_to_similarity(0.2) == 0.8
    assert ScoreNormalizer.cosine_distance_to_similarity(1.0) == 0.0
    assert ScoreNormalizer.cosine_distance_to_similarity(1.5) == 0.0
    assert ScoreNormalizer.cosine_distance_to_similarity(None) == 0.0


def test_min_max_normalize():
    u1, u2, u3 = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()
    raw = {u1: 10.0, u2: 20.0, u3: 30.0}
    norm = ScoreNormalizer.min_max_normalize(raw)

    assert norm[u1] == 0.0
    assert norm[u2] == 0.5
    assert norm[u3] == 1.0


def test_min_max_normalize_equal_scores():
    u1, u2 = uuid.uuid4(), uuid.uuid4()
    raw = {u1: 5.0, u2: 5.0}
    norm = ScoreNormalizer.min_max_normalize(raw)
    assert norm[u1] == 1.0
    assert norm[u2] == 1.0


def test_min_max_normalize_empty():
    assert ScoreNormalizer.min_max_normalize({}) == {}


def test_rank_based_normalize():
    ids = [uuid.uuid4() for _ in range(4)]
    ranked = ScoreNormalizer.rank_based_normalize(ids)
    assert ranked[ids[0]] == 1.0
    assert ranked[ids[3]] == 0.25


def test_sort_candidates_deterministic():
    u1 = uuid.UUID("00000000-0000-0000-0000-000000000001")
    u2 = uuid.UUID("00000000-0000-0000-0000-000000000002")
    u3 = uuid.UUID("00000000-0000-0000-0000-000000000003")

    candidates = [
        {"chunk_id": u2, "score": 0.85, "chunk_index": 1},
        {"chunk_id": u1, "score": 0.95, "chunk_index": 0},
        {"chunk_id": u3, "score": 0.85, "chunk_index": 0},  # Same score, lower chunk_index -> wins over u2
    ]

    sorted_res = sort_candidates_deterministic(candidates)
    assert sorted_res[0]["chunk_id"] == u1
    assert sorted_res[1]["chunk_id"] == u3
    assert sorted_res[2]["chunk_id"] == u2
