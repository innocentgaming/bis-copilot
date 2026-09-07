"""Search service exposing Phase 3 hybrid retrieval without LLM answer generation."""

from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.ingestion.embeddings import get_embedding_provider
from backend.app.retrieval.models import RetrievalRequest, RetrievalResponse
from backend.app.retrieval.reranker import get_reranker
from backend.app.retrieval.service import RetrievalService


class SearchHit(BaseModel):
    chunk_id: uuid.UUID
    content: str
    standard_number: Optional[str] = None
    clause_number: Optional[str] = None
    heading: Optional[str] = None
    pages: Optional[str] = None
    score: float
    citation_text: Optional[str] = None


class SearchResponseData(BaseModel):
    query: str
    normalized_query: str
    total_results: int
    duration_ms: float
    hits: List[SearchHit]


class SearchService:
    """Provides pure factual retrieval over standard chunks."""

    @staticmethod
    async def search(
        session: AsyncSession,
        query: str,
        standard_number: Optional[str] = None,
        clause_number: Optional[str] = None,
        limit: int = 10,
    ) -> SearchResponseData:
        """Execute Phase 3 hybrid vector + keyword retrieval."""
        service = RetrievalService(
            session=session,
            embedding_provider=get_embedding_provider(),
            reranker=get_reranker(),
        )

        filters: Dict[str, Any] = {}
        if standard_number:
            filters["standard_number"] = standard_number
        if clause_number:
            filters["clause_number"] = clause_number

        req = RetrievalRequest(
            query=query,
            filters=filters,
            top_k=min(limit, 50),
        )

        resp: RetrievalResponse = await service.retrieve(req)

        hits = []
        for res, cit in zip(resp.results, resp.citations):
            pages = (
                f"{res.page_start}–{res.page_end}"
                if res.page_start and res.page_end and res.page_start != res.page_end
                else (str(res.page_start) if res.page_start else None)
            )
            hits.append(
                SearchHit(
                    chunk_id=res.chunk_id,
                    content=res.content,
                    standard_number=res.standard_number,
                    clause_number=res.clause_number,
                    heading=res.heading,
                    pages=pages,
                    score=res.score,
                    citation_text=cit.citation_text if cit else None,
                )
            )

        return SearchResponseData(
            query=resp.query,
            normalized_query=resp.normalized_query,
            total_results=len(hits),
            duration_ms=resp.duration_ms,
            hits=hits,
        )
