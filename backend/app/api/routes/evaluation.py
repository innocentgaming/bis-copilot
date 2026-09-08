"""Evaluation and benchmarking routes for RAG accuracy (Admin only)."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    get_db_session,
    get_request_id,
    require_admin,
)
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.api.schemas.evaluation import (
    EvaluationQuestionDetail,
    EvaluationRunTriggerRequest,
)
from backend.app.models.user import User
from backend.app.services.evaluation_service import EvaluationService

router = APIRouter(prefix="/evaluation", tags=["Evaluation (Admin)"])


@router.get(
    "/questions",
    response_model=ResponseEnvelope[List[EvaluationQuestionDetail]],
    summary="List evaluation ground-truth benchmark questions (Admin only)",
)
async def list_evaluation_questions(
    language: Optional[str] = Query(None, pattern="^(en|hi|ta|te|bn|mr|gu|kn|ml|pa|or)$"),
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Retrieve benchmark question dataset used for continuous accuracy testing."""
    questions = await EvaluationService.list_questions(session, language=language)
    return ResponseEnvelope(
        success=True,
        data=questions,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/run",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Trigger RAG accuracy and latency evaluation run (Admin only)",
)
async def run_evaluation(
    request: EvaluationRunTriggerRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Execute automated benchmark run measuring retrieval, citation, and grounding accuracy."""
    results = await EvaluationService.run_benchmark(session, request)
    return ResponseEnvelope(
        success=True,
        data=results,
        meta=ResponseMeta(request_id=req_id),
    )
