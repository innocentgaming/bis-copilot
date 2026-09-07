"""Full-text keyword search using PostgreSQL search_vector and ts_rank_cd."""

import logging
import re
from typing import Any, Dict, List
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.clause import Clause
from backend.app.models.document_chunk import DocumentChunk
from backend.app.models.standard import Standard
from backend.app.retrieval.exceptions import KeywordSearchError
from backend.app.retrieval.filters import FilterBuilder
from backend.app.retrieval.models import RetrievalRequest
from backend.app.retrieval.query import QueryNormalizer
from backend.app.retrieval.scoring import ScoreNormalizer

logger = logging.getLogger(__name__)


class KeywordSearcher:
    """Executes full-text keyword search and technical identifier matching."""

    @staticmethod
    async def search(
        session: AsyncSession,
        query: str,
        request: RetrievalRequest,
        limit: int = None,
    ) -> List[Dict[str, Any]]:
        """Search document chunks using PostgreSQL full-text search and ts_rank_cd.
        
        Args:
            session: Active asynchronous database session.
            query: Clean user query string.
            request: Search parameters and filters.
            limit: Maximum candidate count (defaults to request.candidate_k).
            
        Returns:
            List of candidate dictionaries ordered by keyword relevance descending.
            
        Raises:
            KeywordSearchError: If database execution fails.
        """
        k = limit or request.candidate_k
        normalized_q = QueryNormalizer.normalize(query)
        intent, entities = QueryNormalizer.classify_intent(normalized_q)

        try:
            # Generate tsquery using PostgreSQL websearch_to_tsquery for natural parsing
            ts_query = func.websearch_to_tsquery("english", normalized_q)

            # ts_rank_cd (cover density ranking) rewards query terms appearing in close proximity
            raw_rank = func.ts_rank_cd(DocumentChunk.search_vector, ts_query).label("kw_rank")

            # Base condition: chunk search_vector matches tsquery
            fts_condition = DocumentChunk.search_vector.op("@@")(ts_query)

            # Supplement for technical identifiers: if query has an IS number or clause,
            # allow exact matches in standard_number or clause_number even if FTS stemmed them
            exact_conditions = []
            if entities.get("standard_number"):
                std_term = entities["standard_number"]
                exact_conditions.append(Standard.standard_number.ilike(f"%{std_term}%"))
            if entities.get("clause_number"):
                cls_term = entities["clause_number"]
                exact_conditions.append(Clause.clause_number == cls_term)

            if exact_conditions:
                match_condition = or_(fts_condition, *exact_conditions)
            else:
                match_condition = fts_condition

            stmt = (
                select(
                    DocumentChunk,
                    raw_rank,
                    Standard.standard_number.label("standard_number"),
                    Clause.clause_number.label("clause_number"),
                    Clause.heading.label("clause_heading"),
                )
                .outerjoin(Standard, DocumentChunk.standard_id == Standard.id)
                .outerjoin(Clause, DocumentChunk.clause_id == Clause.id)
                .where(DocumentChunk.search_vector.isnot(None))
                .where(match_condition)
            )

            # Apply relational filters
            stmt = FilterBuilder.apply_filters(
                stmt=stmt,
                request=request,
                joined_standard=True,
                joined_clause=True,
                joined_document=False,
            )

            # Order by rank descending
            stmt = stmt.order_by(raw_rank.desc()).limit(k)

            result = await session.execute(stmt)
            rows = result.all()

            if not rows:
                return []

            # Extract raw scores for min-max normalization
            raw_scores: Dict[Any, float] = {}
            row_map: Dict[Any, tuple] = {}
            for row in rows:
                chunk: DocumentChunk = row[0]
                rank_score: float = float(row[1]) if row[1] is not None else 0.0

                # Deterministic exact-match boosting for technical identifiers
                boost = 0.0
                std_num = row[2] or ""
                cls_num = row[3] or ""
                if entities.get("standard_number") and entities["standard_number"].lower() in std_num.lower():
                    boost += 0.25
                if entities.get("clause_number") and entities["clause_number"] == cls_num:
                    boost += 0.25

                final_raw = rank_score + boost
                raw_scores[chunk.id] = final_raw
                row_map[chunk.id] = row

            # Normalize keyword scores across retrieved candidates to [0, 1]
            normalized_scores = ScoreNormalizer.min_max_normalize(raw_scores)

            candidates: List[Dict[str, Any]] = []
            for chunk_id, norm_score in normalized_scores.items():
                row = row_map[chunk_id]
                chunk: DocumentChunk = row[0]
                std_num: str = row[2]
                cls_num: str = row[3]
                cls_heading: str = row[4]

                candidates.append({
                    "chunk_id": chunk.id,
                    "content": chunk.content,
                    "chunk_index": chunk.chunk_index,
                    "keyword_score": norm_score,
                    "score": norm_score,  # Base score for keyword-only retrieval
                    "document_id": chunk.document_id,
                    "standard_id": chunk.standard_id,
                    "clause_id": chunk.clause_id,
                    "standard_number": std_num,
                    "clause_number": cls_num,
                    "heading": cls_heading,
                    "page_start": chunk.page_start,
                    "page_end": chunk.page_end,
                    "metadata": chunk.metadata_json or {},
                    "retrieval_source": "keyword",
                })

            # Sort descending by normalized keyword score
            candidates.sort(key=lambda c: -c["keyword_score"])
            return candidates

        except Exception as exc:
            logger.error(f"Keyword search failed: {exc}", exc_info=True)
            raise KeywordSearchError(f"Keyword search database error: {exc}") from exc
