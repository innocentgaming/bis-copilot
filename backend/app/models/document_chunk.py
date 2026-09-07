import uuid
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey, Index, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, CreatedTimestampMixin
from backend.app.config import get_settings

if TYPE_CHECKING:
    from backend.app.models.document import Document
    from backend.app.models.standard import Standard
    from backend.app.models.clause import Clause

settings = get_settings()


class DocumentChunk(Base, UUIDMixin, CreatedTimestampMixin):
    """Text chunks derived from clauses or documents for hybrid RAG search."""

    __tablename__ = "document_chunks"
    __table_args__ = (
        Index("ix_document_chunks_document_id", "document_id"),
        Index("ix_document_chunks_standard_id", "standard_id"),
        Index("ix_document_chunks_clause_id", "clause_id"),
        Index("ix_document_chunks_clause_chunk_idx", "clause_id", "chunk_index"),
        Index(
            "ix_document_chunks_embedding_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        Index(
            "ix_document_chunks_search_vector_gin",
            "search_vector",
            postgresql_using="gin",
        ),
        CheckConstraint(
            "page_start IS NULL OR page_end IS NULL OR page_end >= page_start",
            name="ck_chunks_page_range",
        ),
    )

    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="RESTRICT"),
        nullable=True,
    )
    standard_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("standards.id", ondelete="CASCADE"),
        nullable=True,
    )
    clause_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clauses.id", ondelete="CASCADE"),
        nullable=True,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    page_start: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    page_end: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Named 'metadata' in PostgreSQL column, accessed as metadata_json in Python
    # to avoid conflict with SQLAlchemy Base.metadata
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
    )

    # Vector embedding column for semantic search
    embedding: Mapped[Optional[List[float]]] = mapped_column(
        Vector(settings.EMBEDDING_DIMENSION),
        nullable=True,
    )

    # Full-text search vector for keyword search
    search_vector: Mapped[Optional[Any]] = mapped_column(
        TSVECTOR,
        nullable=True,
    )

    # Relationships
    document: Mapped[Optional["Document"]] = relationship(
        "Document",
        back_populates="chunks",
    )
    standard: Mapped[Optional["Standard"]] = relationship("Standard")
    clause: Mapped[Optional["Clause"]] = relationship(
        "Clause",
        back_populates="chunks",
    )

    def __repr__(self) -> str:
        return f"<DocumentChunk(id={self.id}, clause_id={self.clause_id}, chunk_index={self.chunk_index})>"
