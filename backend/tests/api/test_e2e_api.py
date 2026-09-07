"""End-to-end integration test validating the entire API lifecycle."""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.auth.hashing import hash_password
from backend.app.auth.jwt import create_access_token
from backend.app.generation.deterministic_provider import DeterministicLLMProvider
from backend.app.generation.models import (
    AnswerCitation,
    AnswerResponse,
    ProcessingTimings,
)
from backend.app.main import app
from backend.app.models.chat import Conversation, Message
from backend.app.models.user import User


@pytest.mark.asyncio
async def test_end_to_end_api_pipeline(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    uid = uuid.uuid4()
    cid = uuid.uuid4()
    mid = uuid.uuid4()

    user = User(
        id=uid,
        name="SIH Auditor",
        email="auditor@example.com",
        password_hash=hash_password("auditorSecretPass123"),
        role="user",
        preferred_language="en",
    )
    token = create_access_token(user.id, user.email, user.role)

    fake_ans = AnswerResponse(
        conversation_id=cid,
        message_id=mid,
        answer="According to IS 99999:2025 Clause 5.2, the minimum breaking load is 450 N.",
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
        processing=ProcessingTimings(retrieval_ms=1.2, generation_ms=2.5, total_ms=4.0),
    )

    conv_obj = Conversation(id=cid, user_id=uid, title="Audit Question", language="en")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        headers = {"Authorization": f"Bearer {token}", "X-Request-ID": "sih-e2e-audit-001"}

        # 1. Health check
        health_res = await ac.get("/api/v1/health")
        assert health_res.status_code == 200
        assert health_res.json()["success"] is True

        # 2. Chat inquiry
        with patch("backend.app.services.chat_service.ChatService.answer", return_value=fake_ans):
            chat_res = await ac.post(
                "/api/v1/chat",
                headers=headers,
                json={"query": "What does Clause 5.2 require?", "language": "en"},
            )
            assert chat_res.status_code == 200
            chat_data = chat_res.json()
            assert chat_data["success"] is True
            assert chat_data["data"]["confidence"] >= 0.75
            assert len(chat_data["data"]["citations"]) == 1
            assert "IS 99999:2025" in chat_data["data"]["answer"]

        # 3. Conversation inspection
        with patch("backend.app.services.conversation_service.ConversationService.get_conversation", return_value=conv_obj):
            conv_res = await ac.get(f"/api/v1/conversations/{cid}", headers=headers)
            assert conv_res.status_code == 200
            assert conv_res.json()["data"]["id"] == str(cid)

        # 4. Feedback submission
        with patch("backend.app.services.feedback_service.FeedbackService.submit_feedback") as mock_fb:
            from backend.app.api.schemas.feedback import FeedbackResponse
            mock_fb.return_value = FeedbackResponse(
                id=uuid.uuid4(),
                message_id=mid,
                user_id=uid,
                rating=1,
                is_correct=True,
                comment="Accurate citation.",
                created_at="2026-09-07T12:00:00Z",
            )
            fb_res = await ac.post(
                "/api/v1/feedback",
                headers=headers,
                json={"message_id": str(mid), "rating": 1, "is_correct": True, "comment": "Accurate citation."},
            )
            assert fb_res.status_code == 200
            assert fb_res.json()["success"] is True

    app.dependency_overrides.clear()
