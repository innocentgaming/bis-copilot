import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey, Index, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, CreatedTimestampMixin

if TYPE_CHECKING:
    from backend.app.models.standard import Standard
    from backend.app.models.document import Document
    from backend.app.models.document_chunk import DocumentChunk


class Clause(Base, UUIDMixin, CreatedTimestampMixin):
    """Hierarchical clause within a standard (e.g., Clause 5, 5.1, 5.1.2)."""

    __tablename__ = "clauses"
    __table_args__ = (
        Index("ix_clauses_standard_clause", "standard_id", "clause_number"),
        CheckConstraint(
            "page_start IS NULL OR page_end IS NULL OR page_end >= page_start",
            name="ck_clauses_page_range",
        ),
    )

    standard_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("standards.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )
    clause_number: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )
    heading: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    page_start: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    page_end: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    parent_clause_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clauses.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    # Relationships
    standard: Mapped["Standard"] = relationship(
        "Standard",
        back_populates="clauses",
    )
    document: Mapped[Optional["Document"]] = relationship(
        "Document",
        back_populates="clauses",
    )
    # Hierarchical tree representation
    parent_clause: Mapped[Optional["Clause"]] = relationship(
        "Clause",
        remote_side="Clause.id",
        back_populates="sub_clauses",
    )
    sub_clauses: Mapped[List["Clause"]] = relationship(
        "Clause",
        back_populates="parent_clause",
        cascade="all, delete-orphan",
    )
    chunks: Mapped[List["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="clause",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Clause(id={self.id}, clause_number='{self.clause_number}', heading='{self.heading}')>"
