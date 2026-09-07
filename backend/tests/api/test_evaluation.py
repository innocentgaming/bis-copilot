"""Tests for evaluation question management and benchmark run endpoints (Admin only)."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session, require_admin
from backend.app.api.schemas.evaluation import EvaluationQuestionDetail
from backend.app.main import app
from backend.app.models.user import User


@pytest.mark.asyncio
async def test_evaluation_endpoints_admin(mock_session, admin_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_admin] = lambda: admin_user

    q = EvaluationQuestionDetail(
        id=uuid.uuid4(),
        question="What is the breaking load in Clause 5.2?",
        language="en",
        expected_intent="requirement_question",
        expected_answer="Breaking load is 450 N.",
    )
    fake_metrics = {"message": "Success", "total_runs": 1, "metrics": {"avg_latency_ms": 12.5}}

    with patch("backend.app.services.evaluation_service.EvaluationService.list_questions", return_value=[q]), \
         patch("backend.app.services.evaluation_service.EvaluationService.run_benchmark", return_value=fake_metrics):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. Questions
            res = await ac.get("/api/v1/evaluation/questions")
            assert res.status_code == 200
            assert len(res.json()["data"]) == 1

            # 2. Run
            res = await ac.post("/api/v1/evaluation/run", json={"sample_size": 5})
            assert res.status_code == 200
            assert res.json()["data"]["total_runs"] == 1

    app.dependency_overrides.clear()
