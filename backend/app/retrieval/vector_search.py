"""Vector similarity search using PostgreSQL and pgvector."""

import logging
from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.clause import Clause
from backend.app.models.document import Document
from backend.app.models.document_chunk import DocumentChunk
from backend.app.models.standard import Standard
from backend.app.retrieval.exceptions import VectorSearchError
from backend.app.retrieval.filters import FilterBuilder
from backend.app.retrieval.models import RetrievalRequest
from backend.app.retrieval.scoring import ScoreNormalizer

logger = logging.getLogger(__name__)


class VectorSearcher:
    """Executes semantic nearest-neighbor search using pgvector cosine distance."""

    @staticmethod
    async def search(
        session: AsyncSession,
        query_embedding: List[float],
        request: RetrievalRequest,
        limit: int = None,
    ) -> List[Dict[str, Any]]:
        """Search nearest document chunks by cosine distance to query embedding.
        
        Args:
            session: Active asynchronous database session.
            query_embedding: Float vector matching EMBEDDING_DIMENSION.
            request: Search parameters and filters.
            limit: Maximum candidate count (defaults to request.candidate_k).
            
        Returns:
            List of candidate dictionaries ordered by cosine distance ascending.
            
        Raises:
            VectorSearchError: If database execution fails.
        """
        k = limit or request.candidate_k

        try:
            # Cosine distance expression using pgvector operator <=>
            cosine_dist = DocumentChunk.embedding.cosine_distance(query_embedding).label("distance")

            # Base query: select chunk and calculated distance
            stmt = (
                select(
                    DocumentChunk,
                    cosine_dist,
                    Standard.standard_number.label("standard_number"),
                    Clause.clause_number.label("clause_number"),
                    Clause.heading.label("clause_heading"),
                )
                .outerjoin(Standard, DocumentChunk.standard_id == Standard.id)
                .outerjoin(Clause, DocumentChunk.clause_id == Clause.id)
                .where(DocumentChunk.embedding.isnot(None))
            )

            # Apply relational filters (standard, clause, document, status)
            stmt = FilterBuilder.apply_filters(
                stmt=stmt,
                request=request,
                joined_standard=True,
                joined_clause=True,
                joined_document=False,
            )

            # Order by cosine distance ascending (closest first)
            stmt = stmt.order_by(cosine_dist.asc()).limit(k)

            result = await session.execute(stmt)
            rows = result.all()

            candidates: List[Dict[str, Any]] = []
            for row in rows:
                chunk: DocumentChunk = row[0]
                dist: float = float(row[1]) if row[1] is not None else 1.0
                std_num: str = row[2]
                cls_num: str = row[3]
                cls_heading: str = row[4]

                similarity = ScoreNormalizer.cosine_distance_to_similarity(dist)

                candidates.append({
                    "chunk_id": chunk.id,
                    "content": chunk.content,
                    "chunk_index": chunk.chunk_index,
                    "distance": dist,
                    "vector_score": similarity,
                    "score": similarity,  # Base score for vector-only retrieval
                    "document_id": chunk.document_id,
                    "standard_id": chunk.standard_id,
                    "clause_id": chunk.clause_id,
                    "standard_number": std_num,
                    "clause_number": cls_num,
                    "heading": cls_heading,
                    "page_start": chunk.page_start,
                    "page_end": chunk.page_end,
                    "metadata": chunk.metadata_json or {},
                    "retrieval_source": "vector",
                })

            return candidates

        except Exception as exc:
            logger.error(f"Vector search failed: {exc}", exc_info=True)
            raise VectorSearchError(f"Vector search database error: {exc}") from exc
