import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, CreatedTimestampMixin

if TYPE_CHECKING:
    from backend.app.models.document import Document
    from backend.app.models.clause import Clause


class HallmarkingInfo(Base, UUIDMixin, CreatedTimestampMixin):
    """Authoritative guidance and specifications regarding BIS hallmarking."""

    __tablename__ = "hallmarking_info"
    __table_args__ = (
        Index("ix_hallmarking_info_category", "category"),
        Index("ix_hallmarking_info_status", "status"),
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )
    source_clause_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clauses.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        nullable=False,
    )

    # Relationships
    source_document: Mapped[Optional["Document"]] = relationship(
        "Document",
        back_populates="hallmarking_infos",
    )
    source_clause: Mapped[Optional["Clause"]] = relationship("Clause")

    def __repr__(self) -> str:
        return f"<HallmarkingInfo(id={self.id}, title='{self.title}', category='{self.category}')>"
