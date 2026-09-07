"""Tests for authentication endpoints and JWT issuance."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session, require_authenticated_user
from backend.app.auth.hashing import hash_password
from backend.app.auth.jwt import create_access_token, create_refresh_token
from backend.app.main import app
from backend.app.models.user import User


@pytest.mark.asyncio
async def test_auth_register_success(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    user = User(
        id=uuid.uuid4(),
        name="Ramesh Kumar",
        email="ramesh@example.com",
        password_hash="mock_hash",
        role="user",
        preferred_language="en",
    )

    with patch("backend.app.auth.service.AuthService.register_user", new_callable=AsyncMock) as mock_reg:
        mock_reg.return_value = (user, None)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/auth/register",
                json={
                    "name": "Ramesh Kumar",
                    "email": "ramesh@example.com",
                    "password": "strongPassword123!",
                    "preferred_language": "en",
                },
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["data"]["email"] == "ramesh@example.com"
            assert data["data"]["role"] == "user"
            assert "meta" in data
            assert "request_id" in data["meta"]


@pytest.mark.asyncio
async def test_auth_register_duplicate_email(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    with patch("backend.app.auth.service.AuthService.register_user", new_callable=AsyncMock) as mock_reg:
        mock_reg.return_value = (None, "User with email 'ramesh@example.com' already exists.")

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/auth/register",
                json={
                    "name": "Ramesh Kumar",
                    "email": "ramesh@example.com",
                    "password": "strongPassword123!",
                    "preferred_language": "en",
                },
            )
            assert res.status_code == 409
            data = res.json()
            assert data["success"] is False
            assert data["error"]["code"] == "CONFLICT"


@pytest.mark.asyncio
async def test_auth_login_success(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    user = User(
        id=uuid.uuid4(),
        name="Sunita Rao",
        email="sunita@example.com",
        password_hash=hash_password("correctPassword123"),
        role="user",
        preferred_language="hi",
    )

    with patch("backend.app.auth.service.AuthService.authenticate_user", new_callable=AsyncMock, return_value=user):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/auth/login",
                json={"email": "sunita@example.com", "password": "correctPassword123"},
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert "access_token" in data["data"]
            assert "refresh_token" in data["data"]


@pytest.mark.asyncio
async def test_auth_login_invalid_credentials(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    with patch("backend.app.auth.service.AuthService.authenticate_user", new_callable=AsyncMock, return_value=None):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/auth/login",
                json={"email": "unknown@example.com", "password": "wrongPassword"},
            )
            assert res.status_code == 401
            data = res.json()
            assert data["success"] is False
            assert data["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_auth_get_me(mock_session, standard_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_authenticated_user] = lambda: standard_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/auth/me")
        assert res.status_code == 200
        data = res.json()
        assert data["data"]["email"] == standard_user.email
        assert data["data"]["role"] == "user"
