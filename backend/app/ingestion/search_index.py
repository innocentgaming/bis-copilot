"""PostgreSQL full-text search vector utilities for document chunks."""

import logging
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def update_search_vectors_for_document(session: Session, document_id: str) -> int:
    """Populate search_vector for all chunks belonging to a document using PostgreSQL to_tsvector.

    Args:
        session: Active SQLAlchemy sync session.
        document_id: UUID of target document.

    Returns:
        Number of chunk rows updated.
    """
    sql = text(
        """
        UPDATE document_chunks
        SET search_vector = to_tsvector('english', content)
        WHERE document_id = :doc_id;
        """
    )
    try:
        result = session.execute(sql, {"doc_id": document_id})
        return result.rowcount
    except Exception as exc:
        logger.warning(f"Could not update search_vector (may not be PostgreSQL): {exc}")
        return 0


def execute_fts_query(
    session: Session,
    query_string: str,
    limit: int = 10,
):
    """Execute keyword search using PostgreSQL full-text search against document chunks."""
    sql = text(
        """
        SELECT id, document_id, standard_id, clause_id, chunk_index, content,
               ts_rank(search_vector, to_tsquery('english', :q)) AS rank
        FROM document_chunks
        WHERE search_vector @@ to_tsquery('english', :q)
        ORDER BY rank DESC
        LIMIT :limit;
        """
    )
    return session.execute(sql, {"q": query_string, "limit": limit}).fetchall()
