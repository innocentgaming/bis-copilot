"""Tests for direct hybrid search endpoint."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.main import app
from backend.app.services.search_service import SearchHit, SearchResponseData


@pytest.mark.asyncio
async def test_direct_search(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    fake_data = SearchResponseData(
        query="breaking load",
        normalized_query="breaking load",
        total_results=1,
        duration_ms=4.2,
        hits=[
            SearchHit(
                chunk_id=uuid.uuid4(),
                content="Under Clause 5.2, minimum breaking load is 450 N.",
                standard_number="IS 99999:2025",
                clause_number="5.2",
                heading="Mechanical Performance",
                pages="5–6",
                score=0.95,
                citation_text="[IS 99999:2025, Clause 5.2, pp. 5–6]",
            )
        ],
    )

    with patch("backend.app.services.search_service.SearchService.search", return_value=fake_data):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post("/api/v1/search", json={"query": "breaking load", "limit": 10})
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["data"]["total_results"] == 1
            assert data["data"]["hits"][0]["standard_number"] == "IS 99999:2025"

    app.dependency_overrides.clear()
