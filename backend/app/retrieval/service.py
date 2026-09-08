import logging
import time
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import get_settings
from backend.app.ingestion.embeddings import EmbeddingProvider, get_embedding_provider
from backend.app.services.is_lookup_service import ISLookupService
from backend.app.retrieval.citations import CitationBuilder
from backend.app.retrieval.diversification import Diversifier
from backend.app.retrieval.evidence import EvidencePackager
from backend.app.retrieval.exceptions import (
    EmbeddingQueryError,
    KeywordSearchError,
    QueryValidationError,
    RetrievalError,
    VectorSearchError,
)
from backend.app.retrieval.hybrid import HybridFusion
from backend.app.retrieval.keyword_search import KeywordSearcher
from backend.app.retrieval.models import (
    RetrievalMethod,
    RetrievalRequest,
    RetrievalResponse,
    RetrievalStatus,
)
from backend.app.retrieval.query import QueryNormalizer
from backend.app.retrieval.reranker import Reranker, get_reranker
from backend.app.retrieval.vector_search import VectorSearcher

logger = logging.getLogger(__name__)
settings = get_settings()


class RetrievalService:
    """Master orchestrator for the BIS Copilot RAG Retrieval Foundation."""

    def __init__(
        self,
        session: AsyncSession,
        embedding_provider: Optional[EmbeddingProvider] = None,
        reranker: Optional[Reranker] = None,
    ):
        self.session = session
        self.embedding_provider = embedding_provider or get_embedding_provider(
            "sentence_transformers" if settings.ENVIRONMENT == "production" else "deterministic"
        )
        self.reranker = reranker or get_reranker(enabled=settings.RERANKER_ENABLED)

    async def retrieve(self, request: RetrievalRequest) -> RetrievalResponse:
        """Execute complete retrieval workflow for a structured search request.
        
        Orchestration pipeline:
            Query Validation & Normalization
                    ↓
            Query Embedding Generation
                    ↓
            Vector Search (pgvector) + Keyword Search (PostgreSQL FTS)
                    ↓
            Partial-failure Fallback Handling
                    ↓
            Candidate Score Normalization & Fusion (Weighted / RRF)
                    ↓
            Deduplication & Reranking
                    ↓
            Clause-level Diversification
                    ↓
            Authoritative Evidence & Citation Packaging
        """
        start_time = time.perf_counter()
        warnings: List[str] = []
        debug_data: Dict[str, Any] = {}

        # 1. Query normalization and validation
        t_val_start = time.perf_counter()
        normalized_query = QueryNormalizer.validate(request.query)
        intent, detected_entities = QueryNormalizer.classify_intent(normalized_query)
        debug_data["query_validation_ms"] = round((time.perf_counter() - t_val_start) * 1000, 2)

        if request.debug:
            debug_data["normalized_query"] = normalized_query
            debug_data["detected_intent"] = intent
            debug_data["detected_entities"] = detected_entities

        vector_candidates: List[Dict[str, Any]] = []
        keyword_candidates: List[Dict[str, Any]] = []
        method_executed = request.method.value
        embedding_ms = 0.0
        vector_search_ms = 0.0
        keyword_search_ms = 0.0

        # 2. Vector search execution (if requested by method)
        if request.method in (RetrievalMethod.HYBRID, RetrievalMethod.VECTOR) and request.use_vector:
            try:
                t_emb_start = time.perf_counter()
                query_vector = self.embedding_provider.embed_query(normalized_query)
                embedding_ms = round((time.perf_counter() - t_emb_start) * 1000, 2)

                t_vec_start = time.perf_counter()
                vector_candidates = await VectorSearcher.search(
                    session=self.session,
                    query_embedding=query_vector,
                    request=request,
                    limit=request.candidate_k,
                )
                vector_search_ms = round((time.perf_counter() - t_vec_start) * 1000, 2)
            except Exception as exc:
                logger.warning(f"Vector search failed: {exc}")
                warnings.append(f"Vector retrieval unavailable: {exc}")
                if request.method == RetrievalMethod.VECTOR:
                    raise VectorSearchError(f"Vector retrieval failed: {exc}") from exc

        # 3. Keyword search execution (if requested by method)
        if request.method in (RetrievalMethod.HYBRID, RetrievalMethod.KEYWORD) and request.use_keyword:
            try:
                t_kw_start = time.perf_counter()
                keyword_candidates = await KeywordSearcher.search(
                    session=self.session,
                    query=normalized_query,
                    request=request,
                    limit=request.candidate_k,
                )
                keyword_search_ms = round((time.perf_counter() - t_kw_start) * 1000, 2)
            except Exception as exc:
                logger.warning(f"Keyword search failed: {exc}")
                warnings.append(f"Keyword retrieval unavailable: {exc}")
                if request.method == RetrievalMethod.KEYWORD:
                    raise KeywordSearchError(f"Keyword retrieval failed: {exc}") from exc

        debug_data["embedding_ms"] = embedding_ms
        debug_data["vector_search_ms"] = vector_search_ms
        debug_data["keyword_search_ms"] = keyword_search_ms

        if request.debug:
            debug_data["vector_candidate_count"] = len(vector_candidates)
            debug_data["keyword_candidate_count"] = len(keyword_candidates)

        # 3.5 Standard Catalog Retrieval (7,000+ BIS Standards Dataset)
        catalog_candidates: List[Dict[str, Any]] = []
        try:
            lookup_query = detected_entities.get("standard_number") or normalized_query
            lookup_res = ISLookupService.lookup(lookup_query)
            if lookup_res and lookup_res.exact_match:
                rec = lookup_res.exact_match
                cid = uuid.uuid5(uuid.NAMESPACE_DNS, f"std-{rec.is_number}")
                content = (
                    f"Indian Standard: {rec.is_number}\n"
                    f"Title: {rec.title}\n"
                    f"Sectional Division: {rec.section}\n"
                    f"Year Notified: {rec.year_notified or 'N/A'}\n"
                    f"Status: {rec.status or 'Active'}\n"
                    f"Applicable To: {rec.applicable_to or 'General Industrial / Commercial'}\n"
                    f"ICS Code: {rec.ics_code or 'N/A'}\n"
                    f"Scope & Description: {rec.scope_description or rec.title}"
                )
                catalog_candidates.append({
                    "chunk_id": cid,
                    "content": content,
                    "standard_number": rec.is_number,
                    "clause_number": "Scope & Specification",
                    "heading": f"{rec.is_number} — {rec.title}",
                    "score": 0.98,
                    "vector_score": 0.98,
                    "keyword_score": 0.98,
                    "page_start": 1,
                    "page_end": 1,
                })
            elif lookup_res and lookup_res.close_matches:
                for cm in lookup_res.close_matches[:3]:
                    rec = cm.record
                    cid = uuid.uuid5(uuid.NAMESPACE_DNS, f"std-{rec.is_number}")
                    content = (
                        f"Indian Standard: {rec.is_number}\n"
                        f"Title: {rec.title}\n"
                        f"Sectional Division: {rec.section}\n"
                        f"Year Notified: {rec.year_notified or 'N/A'}\n"
                        f"Status: {rec.status or 'Active'}\n"
                        f"Scope & Description: {rec.scope_description or rec.title}"
                    )
                    catalog_candidates.append({
                        "chunk_id": cid,
                        "content": content,
                        "standard_number": rec.is_number,
                        "clause_number": "Scope & Specification",
                        "heading": f"{rec.is_number} — {rec.title}",
                        "score": 0.85,
                        "vector_score": 0.85,
                        "keyword_score": 0.85,
                        "page_start": 1,
                        "page_end": 1,
                    })
        except Exception as exc:
            logger.debug(f"Catalog lookup skipped: {exc}")

        # 4. Handle partial failures or combine candidates
        t_fusion_start = time.perf_counter()
        status = RetrievalStatus.SUCCESS
        if request.method == RetrievalMethod.HYBRID:
            if not vector_candidates and not keyword_candidates and not catalog_candidates and warnings:
                raise RetrievalError(f"Both retrieval modalities failed: {'; '.join(warnings)}")
            elif not vector_candidates and keyword_candidates:
                method_executed = "keyword_fallback"
                status = RetrievalStatus.PARTIAL_FALLBACK
                fused_candidates = catalog_candidates + keyword_candidates
            elif vector_candidates and not keyword_candidates:
                method_executed = "vector_fallback"
                status = RetrievalStatus.PARTIAL_FALLBACK
                fused_candidates = catalog_candidates + vector_candidates
            elif not vector_candidates and not keyword_candidates and catalog_candidates:
                method_executed = "catalog_lookup"
                status = RetrievalStatus.SUCCESS
                fused_candidates = catalog_candidates
            else:
                # Both modalities succeeded: execute Weighted Score Fusion
                fused_candidates = HybridFusion.weighted_score_fusion(
                    vector_candidates=vector_candidates,
                    keyword_candidates=keyword_candidates,
                    vector_weight=settings.VECTOR_WEIGHT,
                    keyword_weight=settings.KEYWORD_WEIGHT,
                )
                if catalog_candidates:
                    fused_candidates = catalog_candidates + fused_candidates
        elif request.method == RetrievalMethod.VECTOR:
            fused_candidates = catalog_candidates + vector_candidates
        else:
            fused_candidates = catalog_candidates + keyword_candidates

        debug_data["hybrid_fusion_ms"] = round((time.perf_counter() - t_fusion_start) * 1000, 2)

        # 5. Deduplicate candidates across modalities
        deduped = Diversifier.deduplicate(fused_candidates)

        # 6. Rerank top candidates with cross-encoder (if enabled)
        t_rerank_start = time.perf_counter()
        if request.rerank and settings.RERANKER_ENABLED and deduped:
            try:
                reranked = self.reranker.rerank(
                    query=normalized_query,
                    candidates=deduped,
                    top_k=settings.RERANKER_TOP_K,
                )
                # If reranker returned subset, append remaining un-reranked candidates
                reranked_ids = {c["chunk_id"] for c in reranked}
                remaining = [c for c in deduped if c["chunk_id"] not in reranked_ids]
                candidates_to_diversify = reranked + remaining
            except Exception as exc:
                logger.warning(f"Reranking failed: {exc}, falling back to fused scores")
                warnings.append(f"Reranker unavailable: {exc}")
                candidates_to_diversify = deduped
        else:
            candidates_to_diversify = deduped

        debug_data["reranking_ms"] = round((time.perf_counter() - t_rerank_start) * 1000, 2)

        # 7. Diversify results to avoid clause flooding
        final_candidates = Diversifier.diversify_by_clause(
            candidates=candidates_to_diversify,
            top_k=request.top_k,
            max_per_clause=settings.MAX_CHUNKS_PER_CLAUSE,
        )

        # 8. Package results, evidence, and citations
        evidence_list = EvidencePackager.package_evidence(final_candidates)
        results_list = EvidencePackager.package_results(final_candidates)
        citations_list = [CitationBuilder.from_candidate(c) for c in final_candidates]

        # 9. Evaluate final outcome status
        if not results_list:
            status = RetrievalStatus.NO_RESULTS
        elif results_list[0].score < settings.LOW_CONFIDENCE_THRESHOLD:
            status = RetrievalStatus.LOW_CONFIDENCE

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return RetrievalResponse(
            query=request.query,
            normalized_query=normalized_query,
            status=status,
            results=results_list,
            evidence=evidence_list,
            citations=citations_list,
            total_candidates=len(deduped),
            retrieval_method=method_executed,
            duration_ms=duration_ms,
            warnings=warnings,
            debug_info=debug_data if request.debug else None,
        )
