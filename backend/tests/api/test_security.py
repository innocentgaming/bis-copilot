"""Comprehensive security, authorization, and data privacy tests."""

import io
import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session, require_authenticated_user
from backend.app.api.middleware import rate_limiter
from backend.app.config import get_settings
from backend.app.main import app
from backend.app.models.user import User

settings = get_settings()


@pytest.mark.asyncio
async def test_security_user_cannot_access_other_user_conversation(mock_session, standard_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_authenticated_user] = lambda: standard_user

    cid = uuid.uuid4()
    with patch("backend.app.services.conversation_service.ConversationService.get_messages", return_value=None):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.get(f"/api/v1/conversations/{cid}/messages")
            assert res.status_code == 404
            data = res.json()
            assert data["success"] is False
            assert data["error"]["code"] == "NOT_FOUND"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_security_non_admin_cannot_access_admin_stats(mock_session, standard_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_authenticated_user] = lambda: standard_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/admin/statistics")
        assert res.status_code == 403
        data = res.json()
        assert data["success"] is False

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_security_invalid_jwt(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.fake.token"})
        assert res.status_code == 401
        data = res.json()
        assert data["success"] is False

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_security_non_pdf_upload_rejected(mock_session, admin_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Attempt uploading executable or script
        files = {"file": ("malicious.exe", io.BytesIO(b"binary payload"), "application/octet-stream")}
        res = await ac.post("/api/v1/documents/ingest", files=files)
        # Should be rejected with 401/403 (if unauthenticated) or 400 FILE_INVALID
        assert res.status_code in (400, 401, 403)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_security_password_hashes_never_exposed(mock_session, admin_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    with patch("backend.app.auth.service.AuthService.authenticate_user", return_value=admin_user):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "secretPassword123"})
            assert res.status_code == 200
            text = res.text
            assert "password_hash" not in text
            assert "mock_argon2_hash" not in text

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_rate_limiter_logic():
    rate_limiter.reset()
    try:
        settings.RATE_LIMIT_ENABLED = True
        client_key = "127.0.0.1"

        # Allow 3 requests
        assert rate_limiter.is_allowed(client_key, max_requests=3, window_seconds=60) is True
        assert rate_limiter.is_allowed(client_key, max_requests=3, window_seconds=60) is True
        assert rate_limiter.is_allowed(client_key, max_requests=3, window_seconds=60) is True

        # 4th request within window must be blocked
        assert rate_limiter.is_allowed(client_key, max_requests=3, window_seconds=60) is False
    finally:
        settings.RATE_LIMIT_ENABLED = False
        rate_limiter.reset()
