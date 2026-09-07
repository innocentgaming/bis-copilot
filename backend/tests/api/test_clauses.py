"""Tests for hierarchical clause endpoints."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.api.schemas.standards import ClauseDetail, ClauseSummary
from backend.app.main import app


@pytest.mark.asyncio
async def test_clause_detail_and_children(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    cid = uuid.uuid4()
    sid = uuid.uuid4()
    child_id = uuid.uuid4()

    child = ClauseSummary(
        id=child_id,
        clause_number="5.1",
        heading="General Mechanical Requirements",
        page_start=4,
        page_end=4,
        parent_clause_id=cid,
    )
    detail = ClauseDetail(
        id=cid,
        standard_id=sid,
        clause_number="5",
        heading="Mechanical Performance",
        content="Overall mechanical requirements for compliance.",
        page_start=4,
        page_end=8,
        children=[child],
    )

    with patch("backend.app.services.standard_service.StandardService.get_clause", return_value=detail):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.get(f"/api/v1/clauses/{cid}")
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["data"]["clause_number"] == "5"
            assert len(data["data"]["children"]) == 1

            child_res = await ac.get(f"/api/v1/clauses/{cid}/children")
            assert child_res.status_code == 200
            assert len(child_res.json()["data"]) == 1

    app.dependency_overrides.clear()
