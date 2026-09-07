"""Unit tests for reranker abstractions and fallbacks."""

import uuid
from backend.app.retrieval.reranker import CrossEncoderReranker, NoOpReranker, get_reranker


def test_noop_reranker_preserves_order_and_sets_score():
    reranker = NoOpReranker()
    c1 = {"chunk_id": uuid.uuid4(), "content": "Sample content 1", "score": 0.88}
    c2 = {"chunk_id": uuid.uuid4(), "content": "Sample content 2", "score": 0.72}

    candidates = [c1, c2]
    result = reranker.rerank("query", candidates, top_k=2)

    assert len(result) == 2
    assert result[0]["rerank_score"] == 0.88
    assert result[1]["rerank_score"] == 0.72


def test_get_reranker_factory_noop():
    reranker = get_reranker(enabled=False)
    assert isinstance(reranker, NoOpReranker)

    reranker_prefer = get_reranker(prefer_noop=True)
    assert isinstance(reranker_prefer, NoOpReranker)


def test_cross_encoder_fallback_on_missing_model():
    # Attempting to rerank with a nonexistent model name should gracefully fall back without crashing
    reranker = CrossEncoderReranker(model_name="nonexistent/fake-reranker-model-test")
    c1 = {"chunk_id": uuid.uuid4(), "content": "Sample content", "score": 0.85}

    result = reranker.rerank("query", [c1], top_k=1)
    assert len(result) == 1
    assert result[0]["score"] == 0.85
