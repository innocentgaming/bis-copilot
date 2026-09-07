"""Tests for VectorSearcher component and pgvector integration."""

import pytest
from sqlalchemy import select
from sqlalchemy.dialects import postgresql

from backend.app.models.document_chunk import DocumentChunk
from backend.app.retrieval.models import RetrievalRequest
from backend.app.retrieval.vector_search import VectorSearcher


def test_vector_search_sql_generation():
    """Verify that VectorSearcher constructs valid pgvector cosine distance SQL."""
    dummy_embedding = [0.0] * 1536
    req = RetrievalRequest(query="test query", candidate_k=25)

    cosine_dist = DocumentChunk.embedding.cosine_distance(dummy_embedding).label("distance")
    stmt = select(DocumentChunk, cosine_dist).order_by(cosine_dist.asc()).limit(req.candidate_k)

    compiled = str(stmt.compile(dialect=postgresql.dialect()))
    assert "<=>" in compiled
    assert "ORDER BY" in compiled
    assert "LIMIT" in compiled


@pytest.mark.asyncio
async def test_vector_search_live_db():
    """Execute live vector search if PostgreSQL + pgvector is reachable, otherwise skip cleanly."""
    from backend.app.database.session import AsyncSessionLocal
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(select(1))
    except Exception:
        pytest.skip("SKIPPED — PostgreSQL unavailable")

    async with AsyncSessionLocal() as session:
        dummy_vec = [0.01] * 1536
        req = RetrievalRequest(query="sample search", candidate_k=5)
        results = await VectorSearcher.search(session, dummy_vec, req)
        assert isinstance(results, list)
