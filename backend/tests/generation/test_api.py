"""Unit and integration tests for chat and health API endpoints."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.routes.chat import get_db_session
from backend.app.generation.models import (
    AnswerCitation,
    AnswerResponse,
    ConfidenceLevel,
    ProcessingTimings,
)
from backend.app.main import app


@pytest.mark.asyncio
async def test_api_health_details():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/health/details")
        assert res.status_code == 200
        data = res.json()
        assert "subsystems" in data
        assert "llm_provider" in data["subsystems"]
        assert "retrieval" in data["subsystems"]


@pytest.mark.asyncio
async def test_api_chat_endpoint():
    mock_session = AsyncMock()
    app.dependency_overrides[get_db_session] = lambda: mock_session

    fake_response = AnswerResponse(
        conversation_id=uuid.uuid4(),
        message_id=uuid.uuid4(),
        answer="According to IS 99999:2025 Clause 5.2, force is 450 N.",
        confidence=0.92,
        confidence_level="HIGH",
        citations=[
            AnswerCitation(
                standard="IS 99999:2025",
                clause="5.2",
                citation_text="[IS 99999:2025, Clause 5.2]",
            )
        ],
        intent="requirement_question",
        insufficient_evidence=False,
        processing=ProcessingTimings(total_ms=45.0),
    )

    with patch("backend.app.api.routes.chat.GenerationOrchestrator.answer", return_value=fake_response):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/chat",
                json={"query": "What is the breaking load?", "language": "en"},
            )
            assert res.status_code == 200
            data = res.json()
            payload = data["data"] if ("data" in data and isinstance(data["data"], dict)) else data
            assert payload["confidence_level"] == "HIGH"
            assert "IS 99999:2025" in payload["answer"]
            assert len(payload["citations"]) == 1

    app.dependency_overrides.clear()
