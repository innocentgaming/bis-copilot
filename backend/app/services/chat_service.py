"""Chat service delegating to Phase 4 GenerationOrchestrator with user context."""

from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.schemas.chat import ChatRequest
from backend.app.generation.models import AnswerRequest, AnswerResponse
from backend.app.generation.orchestration import GenerationOrchestrator
from backend.app.models.chat import Conversation
from backend.app.models.user import User
from backend.app.observability.metrics import metrics


class ChatService:
    """Orchestrates end-to-end question answering pipeline."""

    @staticmethod
    async def answer(
        session: AsyncSession,
        request: ChatRequest,
        user: Optional[User] = None,
    ) -> AnswerResponse:
        """Process user inquiry through anti-hallucinatory RAG orchestration."""
        orchestrator = GenerationOrchestrator(session=session)

        # Build Phase 4 AnswerRequest
        answer_req = AnswerRequest(
            query=request.query,
            conversation_id=request.conversation_id,
            language=request.language,
            filters=request.filters.model_dump(exclude_none=True) if request.filters else None,
        )

        resp = await orchestrator.answer(answer_req)

        # Associate user with conversation if authenticated and not already associated
        if user and resp.conversation_id:
            conv = await session.get(Conversation, resp.conversation_id)
            if conv and conv.user_id is None:
                conv.user_id = user.id
                session.add(conv)
                await session.flush()

        metrics.record_chat(
            retrieval_ms=resp.processing.retrieval_ms,
            generation_ms=resp.processing.generation_ms,
        )

        return resp
