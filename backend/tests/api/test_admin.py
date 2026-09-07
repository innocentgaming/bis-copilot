"""Tests for administrative oversight and system statistics endpoints."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session, require_admin
from backend.app.main import app
from backend.app.models.user import User


@pytest.mark.asyncio
async def test_admin_statistics_and_users(mock_session, admin_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_admin] = lambda: admin_user

    mock_result = MagicMock()
    mock_result.scalar_one.return_value = 10
    mock_result.scalars.return_value.all.return_value = [admin_user]
    mock_session.execute = AsyncMock(return_value=mock_result)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Statistics
        res = await ac.get("/api/v1/admin/statistics")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "total_users" in data["data"]

        # 2. Users
        user_res = await ac.get("/api/v1/admin/users")
        assert user_res.status_code == 200
        assert user_res.json()["data"]["total"] == 10

        # 3. System info
        sys_res = await ac.get("/api/v1/admin/system")
        assert sys_res.status_code == 200
        assert "version" in sys_res.json()["data"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_endpoints_forbidden_for_standard_user(mock_session, standard_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/admin/statistics")
        assert res.status_code in (401, 403)

    app.dependency_overrides.clear()
