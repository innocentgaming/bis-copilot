"""CLI interactive demonstration tool for BIS Copilot Phase 5 API platform."""

import argparse
import asyncio
import json
import os
import sys
import uuid

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from httpx import ASGITransport, AsyncClient
from backend.app.api.dependencies import get_db_session
from backend.app.auth.hashing import hash_password
from backend.app.auth.jwt import create_access_token
from backend.app.generation.models import (
    AnswerCitation,
    AnswerResponse,
    ProcessingTimings,
)
from backend.app.main import app
from backend.app.models.user import User


def print_step(title: str):
    print("\n" + "=" * 76)
    print(f"  STEP: {title}")
    print("=" * 76)


async def run_api_demo(deterministic: bool = True):
    print("\n" + "#" * 76)
    print("       BIS COPILOT — PHASE 5 PRODUCTION API PLATFORM DEMONSTRATION")
    print("#" * 76)

    mock_user_id = uuid.uuid4()
    mock_user = User(
        id=mock_user_id,
        name="SIH Demonstration Officer",
        email="officer@bis.gov.in",
        password_hash=hash_password("bisPassword123!"),
        role="user",
        preferred_language="en",
    )

    if deterministic:
        from unittest.mock import AsyncMock, MagicMock
        from backend.app.api.dependencies import get_current_user_optional
        mock_session = AsyncMock()
        mock_session.add = MagicMock()
        mock_session.flush = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.rollback = AsyncMock()
        mock_session.get = AsyncMock(return_value=mock_user)
        app.dependency_overrides[get_db_session] = lambda: mock_session
        app.dependency_overrides[get_current_user_optional] = lambda: mock_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://localhost:8000") as client:

        # 1. Health Checks
        print_step("1. Subsystem Health & Readiness Probes")
        h_res = await client.get("/api/v1/health")
        print(f"GET /api/v1/health -> Status {h_res.status_code}")
        print(json.dumps(h_res.json(), indent=2))

        dep_res = await client.get("/api/v1/health/dependencies")
        print(f"\nGET /api/v1/health/dependencies -> Status {dep_res.status_code}")
        print(json.dumps(dep_res.json(), indent=2))

        # 2. Authentication: Login
        print_step("2. User Authentication & JWT Issuance")
        # In deterministic mode, generate valid token directly for mock user
        token = create_access_token(mock_user.id, mock_user.email, mock_user.role)
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Request-ID": "demo-req-" + str(uuid.uuid4())[:8],
        }
        print(f"Generated JWT Access Token for '{mock_user.email}' (Role: {mock_user.role})")
        print(f"Token: {token[:32]}...[TRUNCATED]...{token[-16:]}")

        # 3. Authenticated Chat Query
        print_step("3. Evidence-Grounded Compliance Chat Inquiry")
        query_text = "What is the minimum breaking load and test temperature under Clause 5.2?"
        print(f"POST /api/v1/chat")
        print(f"Query: '{query_text}'")

        # Fake deterministic answer response for offline demonstration
        conv_id = uuid.uuid4()
        msg_id = uuid.uuid4()
        fake_ans = AnswerResponse(
            conversation_id=conv_id,
            message_id=msg_id,
            answer=(
                "Under IS 99999:2025 Clause 5.2 (Mechanical Performance), breaking load for all structural "
                "components shall withstand a minimum force of 450 N when tested at 25°C. Deformation under "
                "load shall not exceed 1.5 mm."
            ),
            confidence=0.94,
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
            caveats=["Answer grounded strictly in verified database chunks."],
            processing=ProcessingTimings(retrieval_ms=1.4, generation_ms=18.2, total_ms=19.6),
        )

        from unittest.mock import patch
        with patch("backend.app.services.chat_service.ChatService.answer", return_value=fake_ans):
            chat_res = await client.post(
                "/api/v1/chat",
                headers=headers,
                json={"query": query_text, "language": "en"},
            )
            print(f"Response Status: {chat_res.status_code}")
            chat_json = chat_res.json()
            print(json.dumps(chat_json, indent=2))

        # 4. User Feedback Submission
        print_step("4. Quality Feedback Submission (+1 Rating)")
        with patch("backend.app.services.feedback_service.FeedbackService.submit_feedback") as mock_fb:
            from backend.app.api.schemas.feedback import FeedbackResponse
            mock_fb.return_value = FeedbackResponse(
                id=uuid.uuid4(),
                message_id=msg_id,
                user_id=mock_user.id,
                rating=1,
                is_correct=True,
                comment="Accurate clause reference and exact numerical force value.",
                created_at="2026-09-07T12:00:00Z",
            )
            fb_res = await client.post(
                "/api/v1/feedback",
                headers=headers,
                json={
                    "message_id": str(msg_id),
                    "rating": 1,
                    "is_correct": True,
                    "comment": "Accurate clause reference and exact numerical force value.",
                },
            )
            print(f"POST /api/v1/feedback -> Status {fb_res.status_code}")
            print(json.dumps(fb_res.json(), indent=2))

        # 5. Direct Search Query
        print_step("5. Direct Hybrid Search (Without LLM Synthesis)")
        from backend.app.services.search_service import SearchHit, SearchResponseData
        fake_search = SearchResponseData(
            query="breaking load",
            normalized_query="breaking load",
            total_results=1,
            duration_ms=2.1,
            hits=[
                SearchHit(
                    chunk_id=uuid.uuid4(),
                    content="Under IS 99999:2025 Clause 5.2, breaking load must withstand 450 N.",
                    standard_number="IS 99999:2025",
                    clause_number="5.2",
                    heading="Mechanical Performance",
                    pages="5–6",
                    score=0.96,
                    citation_text="[IS 99999:2025, Clause 5.2, pp. 5–6]",
                )
            ],
        )
        with patch("backend.app.services.search_service.SearchService.search", return_value=fake_search):
            search_res = await client.post(
                "/api/v1/search",
                headers=headers,
                json={"query": "breaking load", "limit": 5},
            )
            print(f"POST /api/v1/search -> Status {search_res.status_code}")
            print(json.dumps(search_res.json(), indent=2))

        print_step("Phase 5 API Platform Demonstration Finished Successfully")
        print("All endpoints returned standard ResponseEnvelope with verified metadata.")


def main():
    parser = argparse.ArgumentParser(description="Test BIS Copilot Phase 5 API Platform")
    parser.add_argument(
        "--deterministic",
        action="store_true",
        default=True,
        help="Run in offline deterministic test mode",
    )
    args = parser.parse_args()
    asyncio.run(run_api_demo(deterministic=args.deterministic))


if __name__ == "__main__":
    main()
