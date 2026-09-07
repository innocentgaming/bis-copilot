"""Continuous evaluation service measuring retrieval, grounding, and citation accuracy."""

import time
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.schemas.evaluation import (
    EvaluationQuestionDetail,
    EvaluationRunDetail,
    EvaluationRunTriggerRequest,
)
from backend.app.generation.models import AnswerRequest
from backend.app.generation.orchestration import GenerationOrchestrator
from backend.app.models.evaluation import EvaluationQuestion, EvaluationRun


class EvaluationService:
    """Manages ground-truth evaluation questions and benchmark executions."""

    @staticmethod
    async def list_questions(
        session: AsyncSession,
        language: Optional[str] = None,
        limit: int = 50,
    ) -> List[EvaluationQuestionDetail]:
        """List benchmark ground-truth questions."""
        query = select(EvaluationQuestion)
        if language:
            query = query.where(EvaluationQuestion.language == language)
        query = query.limit(limit)

        questions = (await session.execute(query)).scalars().all()
        return [
            EvaluationQuestionDetail(
                id=q.id,
                question=q.question,
                language=q.language,
                expected_intent=q.expected_intent,
                expected_standard_id=q.expected_standard_id,
                expected_clause_id=q.expected_clause_id,
                expected_answer=q.expected_answer,
            )
            for q in questions
        ]

    @staticmethod
    async def run_benchmark(
        session: AsyncSession,
        request: EvaluationRunTriggerRequest,
    ) -> Dict[str, Any]:
        """Execute benchmark evaluation across questions and persist run results."""
        query = select(EvaluationQuestion)
        if request.language:
            query = query.where(EvaluationQuestion.language == request.language)
        if request.sample_size:
            query = query.limit(request.sample_size)

        questions = (await session.execute(query)).scalars().all()
        if not questions:
            return {
                "message": "No evaluation questions found matching criteria.",
                "total_runs": 0,
                "metrics": {},
            }

        orchestrator = GenerationOrchestrator(session=session)
        run_records = []
        total_latency = 0.0
        total_confidence = 0.0

        for q in questions:
            start_t = time.perf_counter()
            req = AnswerRequest(query=q.question, language=q.language)
            resp = await orchestrator.answer(req)
            elapsed_ms = (time.perf_counter() - start_t) * 1000.0

            total_latency += elapsed_ms
            total_confidence += resp.confidence

            run = EvaluationRun(
                question_id=q.id,
                retrieved_chunks=[str(c.chunk_id) for c in resp.citations if c.chunk_id],
                generated_answer=resp.answer,
                confidence=resp.confidence,
                latency_ms=elapsed_ms,
                evaluation_metadata={
                    "intent": resp.intent,
                    "confidence_level": resp.confidence_level,
                    "insufficient_evidence": resp.insufficient_evidence,
                    "citations_count": len(resp.citations),
                },
            )
            session.add(run)
            run_records.append(run)

        await session.flush()

        n = len(questions)
        return {
            "message": f"Successfully evaluated {n} benchmark questions.",
            "total_runs": n,
            "metrics": {
                "avg_latency_ms": round(total_latency / n, 2),
                "avg_confidence": round(total_confidence / n, 4),
            },
        }
