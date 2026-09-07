from datetime import date
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Date, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.standard import Standard
    from backend.app.models.clause import Clause
    from backend.app.models.document_chunk import DocumentChunk
    from backend.app.models.certification import CertificationScheme
    from backend.app.models.hallmarking import HallmarkingInfo


class Document(Base, UUIDMixin, TimestampMixin):
    """Authoritative source documents from which knowledge is derived."""

    __tablename__ = "documents"
    __table_args__ = (
        CheckConstraint(
            "document_type IN ('standard', 'certification', 'hallmarking', 'laboratory', 'consumer', 'regulation', 'guideline', 'other')",
            name="ck_documents_document_type",
        ),
        CheckConstraint(
            "status IN ('active', 'inactive', 'superseded', 'draft')",
            name="ck_documents_status",
        ),
    )

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    document_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )
    source_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )
    source_url: Mapped[Optional[str]] = mapped_column(
        Text,
        index=True,
        nullable=True,
    )
    storage_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    version: Mapped[str] = mapped_column(
        String(50),
        default="1.0",
        nullable=False,
    )
    publication_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    effective_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        index=True,
        nullable=False,
    )
    checksum: Mapped[Optional[str]] = mapped_column(
        String(64),
        index=True,
        nullable=True,
    )

    # Relationships (Restrictive deletion to preserve authoritative history)
    standards: Mapped[List["Standard"]] = relationship(
        "Standard",
        back_populates="document",
        passive_deletes=True,
    )
    clauses: Mapped[List["Clause"]] = relationship(
        "Clause",
        back_populates="document",
        passive_deletes=True,
    )
    chunks: Mapped[List["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="document",
        passive_deletes=True,
    )
    certification_schemes: Mapped[List["CertificationScheme"]] = relationship(
        "CertificationScheme",
        back_populates="document",
        passive_deletes=True,
    )
    hallmarking_infos: Mapped[List["HallmarkingInfo"]] = relationship(
        "HallmarkingInfo",
        back_populates="source_document",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Document(id={self.id}, title='{self.title[:30]}', version='{self.version}', status='{self.status}')>"
