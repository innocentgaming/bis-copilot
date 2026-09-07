"""Chat and streaming endpoints for evidence-grounded BIS compliance answering."""

from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    check_rate_limit,
    get_current_user_optional,
    get_db_session,
    get_request_id,
)
from backend.app.api.schemas.chat import ChatRequest, ChatResponseData
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.generation.models import AnswerRequest
from backend.app.generation.orchestration import GenerationOrchestrator
from backend.app.generation.streaming import StreamingManager
from backend.app.models.user import User
from backend.app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "",
    response_model=ResponseEnvelope[ChatResponseData],
    summary="Submit inquiry for anti-hallucinatory BIS standard answering",
    dependencies=[Depends(check_rate_limit(max_requests=60, window_seconds=60))],
)
async def chat(
    request: ChatRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
    req_id: str = Depends(get_request_id),
):
    """Execute end-to-end RAG answer generation with citation verification and confidence scoring."""
    answer_resp = await ChatService.answer(
        session=session,
        request=request,
        user=current_user,
    )

    data = ChatResponseData(
        conversation_id=answer_resp.conversation_id,
        message_id=answer_resp.message_id,
        answer=answer_resp.answer,
        confidence=answer_resp.confidence,
        confidence_level=answer_resp.confidence_level,
        intent=answer_resp.intent,
        insufficient_evidence=answer_resp.insufficient_evidence,
        citations=answer_resp.citations,
        caveats=answer_resp.caveats,
        follow_up_questions=answer_resp.follow_up_questions,
        processing=answer_resp.processing,
    )

    return ResponseEnvelope(
        success=True,
        data=data,
        meta=ResponseMeta(
            request_id=req_id,
            processing_ms=answer_resp.processing.total_ms,
        ),
    )


@router.post(
    "/stream",
    summary="Stream question answering token events via Server-Sent Events (SSE)",
    dependencies=[Depends(check_rate_limit(max_requests=60, window_seconds=60))],
)
async def chat_stream(
    request: ChatRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
    req_id: str = Depends(get_request_id),
):
    """Stream token generation followed by final verified citations and confidence metadata."""
    orchestrator = GenerationOrchestrator(session=session)

    # Token stream from provider
    token_generator = orchestrator.llm_provider.stream_generate(
        messages=[{"role": "user", "content": request.query}],
    )

    async def get_final():
        return await ChatService.answer(
            session=session,
            request=request,
            user=current_user,
        )

    stream = StreamingManager.create_stream(
        token_stream=token_generator,
        final_payload_getter=get_final,
        request_id=req_id,
    )
    response = StreamingResponse(stream, media_type="text/event-stream")
    response.headers["X-Request-ID"] = req_id
    return response
