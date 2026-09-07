"""Tests for standards and clause listing endpoints."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.api.schemas.standards import StandardDetail, StandardSummary
from backend.app.main import app


@pytest.mark.asyncio
async def test_standards_listing_and_detail(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    sid = uuid.uuid4()
    summary = StandardSummary(
        id=sid,
        standard_number="IS 1293:2019",
        title="Plugs and Socket-Outlets",
        edition="Third Revision",
        status="active",
    )
    detail = StandardDetail(
        id=sid,
        standard_number="IS 1293:2019",
        title="Plugs and Socket-Outlets",
        edition="Third Revision",
        status="active",
        clauses_count=15,
        clauses=[],
    )

    with patch("backend.app.services.standard_service.StandardService.list_standards", return_value=([summary], 1)), \
         patch("backend.app.services.standard_service.StandardService.get_standard", return_value=detail):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. List
            res = await ac.get("/api/v1/standards?search=1293")
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["data"]["total"] == 1
            assert data["data"]["items"][0]["standard_number"] == "IS 1293:2019"

            # 2. Detail
            res = await ac.get(f"/api/v1/standards/{sid}")
            assert res.status_code == 200
            data = res.json()
            assert data["data"]["standard_number"] == "IS 1293:2019"

    app.dependency_overrides.clear()
