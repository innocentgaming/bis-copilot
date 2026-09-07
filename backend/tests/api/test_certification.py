"""Tests for BIS certification schemes and requirements endpoints."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.api.schemas.certification import (
    CertificationRequirementSummary,
    CertificationSchemeDetail,
    CertificationSchemeSummary,
)
from backend.app.main import app


@pytest.mark.asyncio
async def test_certification_schemes_and_requirements(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    sid = uuid.uuid4()
    summary = CertificationSchemeSummary(
        id=sid,
        code="SCHEME-I",
        name="Product Certification Scheme (ISI Mark)",
        status="active",
        description="Standard conformity assessment scheme",
    )
    req = CertificationRequirementSummary(
        id=uuid.uuid4(),
        clause_number="5.2",
        title="Breaking Load Certification Requirement",
        requirement_type="testing",
        is_mandatory=True,
    )
    detail = CertificationSchemeDetail(
        id=sid,
        code="SCHEME-I",
        name="Product Certification Scheme (ISI Mark)",
        status="active",
        requirements=[req],
    )

    with patch("backend.app.services.certification_service.CertificationService.list_schemes", return_value=([summary], 1)), \
         patch("backend.app.services.certification_service.CertificationService.get_scheme", return_value=detail), \
         patch("backend.app.services.certification_service.CertificationService.get_requirements_for_standard", return_value=[req]):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. List
            res = await ac.get("/api/v1/certification/schemes")
            assert res.status_code == 200
            assert res.json()["data"]["total"] == 1

            # 2. Scheme Detail
            res = await ac.get(f"/api/v1/certification/schemes/{sid}")
            assert res.status_code == 200
            assert res.json()["data"]["code"] == "SCHEME-I"

            # 3. Requirements for standard
            res = await ac.get(f"/api/v1/certification/standards/{uuid.uuid4()}")
            assert res.status_code == 200
            assert len(res.json()["data"]) == 1

    app.dependency_overrides.clear()
