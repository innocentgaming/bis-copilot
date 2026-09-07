"""Master orchestration service coordinating retrieval, generation, validation, and persistence."""

import logging
import time
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import get_settings
from backend.app.generation.answer_generator import AnswerGenerator
from backend.app.generation.citation_validator import CitationValidator
from backend.app.generation.confidence import ConfidenceEngine
from backend.app.generation.context import EvidenceContextBuilder
from backend.app.generation.conversation import ConversationManager
from backend.app.generation.grounding import GroundingValidator
from backend.app.generation.logging import GenerationLogger
from backend.app.generation.models import (
    AnswerCitation,
    AnswerRequest,
    AnswerResponse,
    ConfidenceLevel,
    EvidenceContext,
    ProcessingTimings,
)
from backend.app.generation.provider import LLMProvider
from backend.app.generation.llm_provider import get_llm_provider
from backend.app.generation.safety import SafetyChecker
from backend.app.retrieval.models import (
    RetrievalMethod,
    RetrievalRequest,
    RetrievalResponse,
)
from backend.app.retrieval.query import QueryNormalizer
from backend.app.retrieval.service import RetrievalService

logger = logging.getLogger(__name__)
settings = get_settings()


class GenerationOrchestrator:
    """Master pipeline orchestrating RAG question answering, validation, and conversation tracking."""

    def __init__(
        self,
        session: AsyncSession,
        retrieval_service: Optional[RetrievalService] = None,
        llm_provider: Optional[LLMProvider] = None,
    ):
        self.session = session
        self.retrieval_service = retrieval_service or RetrievalService(session=session)
        self.llm_provider = llm_provider or get_llm_provider()
        self.answer_generator = AnswerGenerator(provider=self.llm_provider)

    async def answer(self, request: AnswerRequest) -> AnswerResponse:
        """Execute complete question answering workflow with zero-hallucination guardrails."""
        t_start = time.perf_counter()
        timings = ProcessingTimings()

        # Step 1: Query Validation & Safety Scanning
        SafetyChecker.validate_query(request.query)
        clean_query = QueryNormalizer.validate(request.query)

        # Step 2: Initialize or Retrieve Conversation
        conv = await ConversationManager.get_or_create_conversation(
            session=self.session,
            conversation_id=request.conversation_id,
            user_id=request.user_id,
            title=clean_query[:50],
            language=request.language,
        )

        # Step 3: Persist User Message
        user_msg = await ConversationManager.save_message(
            session=self.session,
            conversation_id=conv.id,
            role="user",
            content=clean_query,
        )

        # Step 4: Phase 3 Hybrid Retrieval Execution
        t_ret_start = time.perf_counter()
        std_num_filter = request.filters.standard_number if request.filters else None
        cls_num_filter = request.filters.clause_number if request.filters else None
        status_filter = request.filters.status if request.filters else "active"

        ret_req = RetrievalRequest(
            query=clean_query,
            top_k=settings.GENERATION_MAX_CONTEXT_CHUNKS,
            candidate_k=settings.VECTOR_TOP_K,
            method=RetrievalMethod.HYBRID,
            standard_number=std_num_filter,
            clause_number=cls_num_filter,
            status=status_filter,
            debug=True,
        )

        try:
            retrieval_resp = await self.retrieval_service.retrieve(ret_req)
        except Exception as exc:
            logger.error(f"Retrieval service failed: {exc}", exc_info=True)
            # Create minimal empty retrieval response
            retrieval_resp = RetrievalResponse(
                query=clean_query,
                normalized_query=clean_query,
                warnings=[f"Retrieval service encountered error: {exc}"],
            )

        timings.retrieval_ms = round((time.perf_counter() - t_ret_start) * 1000, 2)
        retrieval_debug = retrieval_resp.debug_info or {}
        timings.query_validation_ms = float(retrieval_debug.get("query_validation_ms", 0.0))
        timings.embedding_ms = float(retrieval_debug.get("embedding_ms", 0.0))
        timings.vector_search_ms = float(retrieval_debug.get("vector_search_ms", 0.0))
        timings.keyword_search_ms = float(retrieval_debug.get("keyword_search_ms", 0.0))
        timings.hybrid_fusion_ms = float(retrieval_debug.get("hybrid_fusion_ms", 0.0))
        timings.reranking_ms = float(retrieval_debug.get("reranking_ms", 0.0))

        # Step 5: Construct Delimited Evidence Context
        t_ctx_start = time.perf_counter()
        context: EvidenceContext = EvidenceContextBuilder.build_context(
            retrieval_response=retrieval_resp,
            max_chunks=settings.GENERATION_MAX_CONTEXT_CHUNKS,
            min_score=settings.GENERATION_MIN_RELEVANCE_SCORE,
        )
        timings.context_ms = round((time.perf_counter() - t_ctx_start) * 1000, 2)

        # Step 6: Evidence Sufficiency Check
        if context.quality == "INSUFFICIENT" and settings.REFUSE_ON_INSUFFICIENT_EVIDENCE:
            fallback_payload = self.answer_generator.create_fallback_payload(
                context,
                language=request.language,
                reason="No authoritative evidence met relevance criteria in the standards database.",
            )
            return await self._finalize_response(
                conv_id=conv.id,
                payload=fallback_payload,
                citations=[],
                grounding_score=1.0,
                confidence=0.10,
                conf_level=ConfidenceLevel.INSUFFICIENT,
                timings=timings,
                t_start=t_start,
                context=context,
            )

        # Step 7: Answer Generation via LLM Provider
        t_gen_start = time.perf_counter()
        payload, llm_resp = await self.answer_generator.generate_answer(
            context=context,
            language=request.language,
        )
        timings.generation_ms = round((time.perf_counter() - t_gen_start) * 1000, 2)

        # Step 8: Citation & Grounding Verification
        t_val_start = time.perf_counter()
        citation_check = CitationValidator.validate_citations(payload.citations, context)
        grounding_check = GroundingValidator.check_grounding(payload.answer, context)

        # Step 9: Controlled Regeneration if Grounding/Citation check fails
        if (not grounding_check.is_grounded or not citation_check.is_valid) and not payload.insufficient_evidence:
            violations = grounding_check.violations + citation_check.warnings
            logger.warning(f"Generation failed verification: {violations}. Attempting single controlled regeneration.")

            t_regen_start = time.perf_counter()
            payload, llm_resp = await self.answer_generator.generate_answer(
                context=context,
                language=request.language,
                regeneration_violations=violations,
            )
            timings.generation_ms += round((time.perf_counter() - t_regen_start) * 1000, 2)

            # Re-evaluate post-regeneration
            citation_check = CitationValidator.validate_citations(payload.citations, context)
            grounding_check = GroundingValidator.check_grounding(payload.answer, context)

            # If still failing, deploy deterministic evidence-based fallback
            if not grounding_check.is_grounded:
                logger.warning("Regeneration still ungrounded. Deploying deterministic safe fallback.")
                payload = self.answer_generator.create_fallback_payload(
                    context,
                    language=request.language,
                    reason="Grounding verification failure after regeneration.",
                )
                citation_check = CitationValidator.validate_citations(payload.citations, context)
                grounding_check = GroundingValidator.check_grounding(payload.answer, context)

        timings.validation_ms = round((time.perf_counter() - t_val_start) * 1000, 2)
        timings.citation_validation_ms = timings.validation_ms

        # Step 10: Multi-Factor Confidence Scoring
        confidence_score, confidence_level = ConfidenceEngine.calculate_confidence(
            context=context,
            grounding=grounding_check,
            citations=citation_check,
            insufficient_evidence=payload.insufficient_evidence,
        )

        # Step 11: Transform citations to public output format
        final_citations = CitationValidator.to_answer_citations(citation_check.valid_citations)

        # Step 12: Finalize Database Persistence and Return Response
        return await self._finalize_response(
            conv_id=conv.id,
            payload=payload,
            citations=final_citations,
            grounding_score=grounding_check.grounding_score,
            confidence=confidence_score,
            conf_level=confidence_level,
            timings=timings,
            t_start=t_start,
            context=context,
        )

    async def _finalize_response(
        self,
        conv_id: UUID,
        payload: Any,
        citations: List[AnswerCitation],
        grounding_score: float,
        confidence: float,
        conf_level: ConfidenceLevel,
        timings: ProcessingTimings,
        t_start: float,
        context: EvidenceContext,
    ) -> AnswerResponse:
        """Persist assistant message, save citations, and return structured response."""
        t_persist_start = time.perf_counter()

        # Sanitize answer text before persisting
        safe_answer = SafetyChecker.sanitize_output(payload.answer)

        # Save Assistant Message
        assistant_msg = await ConversationManager.save_message(
            session=self.session,
            conversation_id=conv_id,
            role="assistant",
            content=safe_answer,
            intent=payload.intent or context.intent,
            confidence=confidence,
            response_time_ms=int((time.perf_counter() - t_start) * 1000),
        )

        # Save Citations
        if citations:
            await ConversationManager.save_citations(
                session=self.session,
                message_id=assistant_msg.id,
                citations=citations,
            )

        timings.persistence_ms = round((time.perf_counter() - t_persist_start) * 1000, 2)
        timings.total_ms = round((time.perf_counter() - t_start) * 1000, 2)
        timings.total_pipeline_ms = timings.total_ms

        # Audit Logging
        GenerationLogger.log_turn(
            query=context.query,
            intent=payload.intent or context.intent,
            evidence_count=len(context.items),
            provider=settings.LLM_PROVIDER,
            model=settings.LLM_MODEL,
            grounding_score=grounding_score,
            confidence=confidence,
            total_ms=timings.total_ms,
            insufficient_evidence=payload.insufficient_evidence,
            warnings=context.warnings,
        )

        return AnswerResponse(
            conversation_id=conv_id,
            message_id=assistant_msg.id,
            answer=safe_answer,
            confidence=confidence,
            confidence_level=conf_level.value,
            citations=citations,
            intent=payload.intent or context.intent,
            insufficient_evidence=payload.insufficient_evidence,
            caveats=payload.caveats,
            follow_up_questions=payload.follow_up_questions,
            processing=timings,
            provider=settings.LLM_PROVIDER,
            model=settings.LLM_MODEL,
        )
