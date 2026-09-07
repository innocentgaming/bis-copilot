"""SQLAlchemy filter construction for database-level retrieval filtering."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import Select, and_
from sqlalchemy.sql.elements import BinaryExpression

from backend.app.models.clause import Clause
from backend.app.models.document import Document
from backend.app.models.document_chunk import DocumentChunk
from backend.app.models.standard import Standard
from backend.app.retrieval.models import RetrievalRequest


class FilterBuilder:
    """Builds composable SQL WHERE clauses from RetrievalRequest parameters."""

    @staticmethod
    def apply_filters(
        stmt: Select,
        request: RetrievalRequest,
        joined_standard: bool = False,
        joined_clause: bool = False,
        joined_document: bool = False,
    ) -> Select:
        """Apply requested metadata filters directly to a SQLAlchemy query statement.
        
        Args:
            stmt: Base SQLAlchemy Select statement targeting DocumentChunk.
            request: The retrieval request containing filter parameters.
            joined_standard: Whether Standard table is already joined.
            joined_clause: Whether Clause table is already joined.
            joined_document: Whether Document table is already joined.
            
        Returns:
            Updated Select statement with applied WHERE conditions and any necessary joins.
        """
        # 1. Chunk-level foreign key filters (no join needed)
        if request.chunk_id if hasattr(request, "chunk_id") else None:
            stmt = stmt.where(DocumentChunk.id == request.chunk_id)

        if request.document_id:
            stmt = stmt.where(DocumentChunk.document_id == request.document_id)

        if request.standard_id:
            stmt = stmt.where(DocumentChunk.standard_id == request.standard_id)

        if request.clause_id:
            stmt = stmt.where(DocumentChunk.clause_id == request.clause_id)

        # 2. Standard number filter (requires joining Standard if not already joined)
        if request.standard_number:
            if not joined_standard:
                stmt = stmt.join(Standard, DocumentChunk.standard_id == Standard.id)
                joined_standard = True
            # Case-insensitive match on standard_number (e.g. 'IS 1293:2019')
            stmt = stmt.where(Standard.standard_number.ilike(f"%{request.standard_number.strip()}%"))

        # 3. Clause number filter (requires joining Clause if not already joined)
        if request.clause_number:
            if not joined_clause:
                stmt = stmt.join(Clause, DocumentChunk.clause_id == Clause.id)
                joined_clause = True
            stmt = stmt.where(Clause.clause_number == request.clause_number.strip())

        # 4. Document Status filter (e.g., 'active' default)
        if request.status:
            if not joined_document:
                stmt = stmt.join(Document, DocumentChunk.document_id == Document.id)
                joined_document = True
            stmt = stmt.where(Document.status == request.status)

        return stmt
