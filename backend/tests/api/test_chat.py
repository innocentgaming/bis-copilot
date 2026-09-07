"""Tests for chat answering endpoints."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.generation.models import (
    AnswerCitation,
    AnswerResponse,
    ProcessingTimings,
)
from backend.app.main import app


@pytest.mark.asyncio
async def test_chat_success(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    cid = uuid.uuid4()
    mid = uuid.uuid4()
    fake_ans = AnswerResponse(
        conversation_id=cid,
        message_id=mid,
        answer="Under IS 99999:2025 Clause 5.2, the breaking load is 450 N.",
        confidence=0.88,
        confidence_level="HIGH",
        intent="requirement_question",
        insufficient_evidence=False,
        citations=[
            AnswerCitation(
                standard="IS 99999:2025",
                clause="5.2",
                pages="5–6",
                citation_text="[IS 99999:2025, Clause 5.2, pp. 5–6]",
                relevance_score=0.96,
            )
        ],
        processing=ProcessingTimings(retrieval_ms=1.5, generation_ms=2.0, total_ms=3.5),
    )

    with patch("backend.app.services.chat_service.ChatService.answer", return_value=fake_ans):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/chat",
                headers={"X-Request-ID": "custom-req-1234"},
                json={"query": "What is the breaking load under Clause 5.2?", "language": "en"},
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["meta"]["request_id"] == "custom-req-1234"
            assert res.headers.get("X-Request-ID") == "custom-req-1234"
            assert data["data"]["confidence"] == 0.88
            assert data["data"]["confidence_level"] == "HIGH"
            assert len(data["data"]["citations"]) == 1
            assert "IS 99999:2025" in data["data"]["answer"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_chat_insufficient_evidence(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    fake_ans = AnswerResponse(
        conversation_id=uuid.uuid4(),
        message_id=uuid.uuid4(),
        answer="I could not find sufficient evidence in the available standards.",
        confidence=0.10,
        confidence_level="INSUFFICIENT",
        intent="general",
        insufficient_evidence=True,
        citations=[],
        processing=ProcessingTimings(retrieval_ms=1.0, generation_ms=0.5, total_ms=1.5),
    )

    with patch("backend.app.services.chat_service.ChatService.answer", return_value=fake_ans):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/chat",
                json={"query": "What are requirements for unapproved product?", "language": "en"},
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["data"]["insufficient_evidence"] is True
            assert data["data"]["confidence_level"] == "INSUFFICIENT"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_chat_validation_empty_query(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/api/v1/chat", json={"query": "", "language": "en"})
        assert res.status_code == 422
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "VALIDATION_ERROR"

    app.dependency_overrides.clear()
