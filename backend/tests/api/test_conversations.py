"""Tests for conversation sessions and message history."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session, require_authenticated_user
from backend.app.api.schemas.conversation import ConversationDetail, MessageDetail
from backend.app.main import app
from backend.app.models.user import User


@pytest.mark.asyncio
async def test_conversations_list_and_create(mock_session, standard_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_authenticated_user] = lambda: standard_user

    cid = uuid.uuid4()
    detail = ConversationDetail(
        id=cid,
        title="Testing Standard IS 1293",
        language="en",
        user_id=standard_user.id,
        message_count=2,
    )

    with patch("backend.app.services.conversation_service.ConversationService.list_conversations", return_value=([detail], 1)), \
         patch("backend.app.services.conversation_service.ConversationService.create_conversation", return_value=detail):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. List
            res = await ac.get("/api/v1/conversations")
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["data"]["total"] == 1
            assert len(data["data"]["items"]) == 1

            # 2. Create
            res = await ac.post("/api/v1/conversations", json={"title": "Testing Standard IS 1293", "language": "en"})
            assert res.status_code == 200
            assert res.json()["data"]["title"] == "Testing Standard IS 1293"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_conversation_user_isolation(mock_session, standard_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_authenticated_user] = lambda: standard_user

    cid = uuid.uuid4()
    # Conversation belongs to another user -> service returns None
    with patch("backend.app.services.conversation_service.ConversationService.get_conversation", return_value=None):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.get(f"/api/v1/conversations/{cid}")
            assert res.status_code == 404
            data = res.json()
            assert data["success"] is False
            assert data["error"]["code"] == "NOT_FOUND"

    app.dependency_overrides.clear()
