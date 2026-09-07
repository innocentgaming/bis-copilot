"""Tests for Server-Sent Events (SSE) streaming chat endpoint."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.generation.models import AnswerResponse
from backend.app.main import app


@pytest.mark.asyncio
async def test_chat_stream_sse(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    async def fake_stream_gen(*args, **kwargs):
        yield "According"
        yield " to"
        yield " Clause 5.2"

    fake_ans = AnswerResponse(
        conversation_id=uuid.uuid4(),
        message_id=uuid.uuid4(),
        answer="According to Clause 5.2, force is 450 N.",
        confidence=0.85,
        confidence_level="HIGH",
    )

    with patch("backend.app.generation.deterministic_provider.DeterministicLLMProvider.stream_generate", side_effect=fake_stream_gen), \
         patch("backend.app.services.chat_service.ChatService.answer", return_value=fake_ans):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/chat/stream",
                json={"query": "What does Clause 5.2 say?", "language": "en"},
            )
            assert res.status_code == 200
            assert "text/event-stream" in res.headers["content-type"]
            text = res.text
            assert "event: token" in text or "event: complete" in text
