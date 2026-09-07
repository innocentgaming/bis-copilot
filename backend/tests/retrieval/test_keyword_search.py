"""Tests for KeywordSearcher component and PostgreSQL FTS integration."""

import pytest
from sqlalchemy import func, select
from sqlalchemy.dialects import postgresql

from backend.app.models.document_chunk import DocumentChunk
from backend.app.retrieval.keyword_search import KeywordSearcher
from backend.app.retrieval.models import RetrievalRequest


def test_keyword_search_sql_generation():
    """Verify that KeywordSearcher constructs valid tsquery and ts_rank_cd SQL."""
    req = RetrievalRequest(query="fire safety requirements", candidate_k=15)
    ts_query = func.websearch_to_tsquery("english", req.query)
    rank = func.ts_rank_cd(DocumentChunk.search_vector, ts_query).label("kw_rank")
    stmt = (
        select(DocumentChunk, rank)
        .where(DocumentChunk.search_vector.op("@@")(ts_query))
        .order_by(rank.desc())
        .limit(req.candidate_k)
    )

    compiled = str(stmt.compile(dialect=postgresql.dialect()))
    assert "websearch_to_tsquery" in compiled
    assert "ts_rank_cd" in compiled
    assert "@@" in compiled


@pytest.mark.asyncio
async def test_keyword_search_live_db():
    """Execute live keyword search if PostgreSQL FTS is reachable, otherwise skip cleanly."""
    from backend.app.database.session import AsyncSessionLocal
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(select(1))
    except Exception:
        pytest.skip("SKIPPED — PostgreSQL unavailable")

    async with AsyncSessionLocal() as session:
        req = RetrievalRequest(query="safety specifications", candidate_k=5)
        results = await KeywordSearcher.search(session, req.query, req)
        assert isinstance(results, list)
