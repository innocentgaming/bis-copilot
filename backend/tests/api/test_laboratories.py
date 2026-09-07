"""Tests for testing laboratory discovery endpoints."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.api.schemas.laboratories import (
    LaboratoryCapabilityDetail,
    LaboratoryDetail,
    LaboratorySummary,
)
from backend.app.main import app


@pytest.mark.asyncio
async def test_laboratories_listing_and_search(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    lid = uuid.uuid4()
    summary = LaboratorySummary(
        id=lid,
        name="National Testing House (WR)",
        city="Mumbai",
        state="Maharashtra",
        pincode="400093",
        status="active",
        phone="+91-22-28220000",
        email="nthwr@example.com",
    )
    detail = LaboratoryDetail(
        id=lid,
        name="National Testing House (WR)",
        address="MIDC Andheri East, Mumbai",
        city="Mumbai",
        state="Maharashtra",
        pincode="400093",
        status="active",
        phone="+91-22-28220000",
        email="nthwr@example.com",
        capabilities=[
            LaboratoryCapabilityDetail(
                id=uuid.uuid4(),
                standard_number="IS 1293:2019",
                test_name="High-voltage insulation breakdown test",
                is_accredited=True,
            )
        ],
    )

    with patch("backend.app.services.laboratory_service.LaboratoryService.list_laboratories", return_value=([summary], 1)), \
         patch("backend.app.services.laboratory_service.LaboratoryService.search_laboratories", return_value=[summary]), \
         patch("backend.app.services.laboratory_service.LaboratoryService.get_laboratory", return_value=detail):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. List
            res = await ac.get("/api/v1/laboratories?city=Mumbai")
            assert res.status_code == 200
            assert res.json()["data"]["total"] == 1

            # 2. Search
            res = await ac.get("/api/v1/laboratories/search?query=insulation")
            assert res.status_code == 200
            assert len(res.json()["data"]) == 1

            # 3. Detail
            res = await ac.get(f"/api/v1/laboratories/{lid}")
            assert res.status_code == 200
            assert len(res.json()["data"]["capabilities"]) == 1

    app.dependency_overrides.clear()
