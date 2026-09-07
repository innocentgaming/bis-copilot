"""Tests for user feedback submission and rating verification."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session
from backend.app.api.schemas.feedback import FeedbackResponse
from backend.app.main import app


@pytest.mark.asyncio
async def test_feedback_submission_positive(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    mid = uuid.uuid4()
    fid = uuid.uuid4()
    resp_obj = FeedbackResponse(
        id=fid,
        message_id=mid,
        rating=1,
        is_correct=True,
        comment="Great citation link!",
    )

    with patch("backend.app.services.feedback_service.FeedbackService.submit_feedback", return_value=resp_obj):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.post(
                "/api/v1/feedback",
                json={"message_id": str(mid), "rating": 1, "is_correct": True, "comment": "Great citation link!"},
            )
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["data"]["rating"] == 1

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_feedback_invalid_rating(mock_session):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    mid = uuid.uuid4()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post(
            "/api/v1/feedback",
            json={"message_id": str(mid), "rating": 5},  # Only -1 and 1 allowed
        )
        assert res.status_code == 400
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "INVALID_REQUEST"

    app.dependency_overrides.clear()
