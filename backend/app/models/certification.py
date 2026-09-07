import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Boolean, ForeignKey, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, CreatedTimestampMixin

if TYPE_CHECKING:
    from backend.app.models.document import Document
    from backend.app.models.standard import Standard
    from backend.app.models.clause import Clause


class CertificationScheme(Base, UUIDMixin, CreatedTimestampMixin):
    """BIS Certification Schemes (e.g. ISI Scheme-I, CRS Scheme-II, Tatkall)."""

    __tablename__ = "certification_schemes"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scope: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        nullable=False,
    )

    # Relationships
    document: Mapped[Optional["Document"]] = relationship(
        "Document",
        back_populates="certification_schemes",
    )
    standards: Mapped[List["StandardCertificationScheme"]] = relationship(
        "StandardCertificationScheme",
        back_populates="scheme",
        cascade="all, delete-orphan",
    )
    requirements: Mapped[List["CertificationRequirement"]] = relationship(
        "CertificationRequirement",
        back_populates="scheme",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<CertificationScheme(id={self.id}, code='{self.code}', name='{self.name}')>"


class StandardCertificationScheme(Base):
    """Many-to-many relationship between Indian Standards and Certification Schemes."""

    __tablename__ = "standard_certification_schemes"

    standard_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("standards.id", ondelete="CASCADE"),
        primary_key=True,
    )
    scheme_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("certification_schemes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    applicability: Mapped[str] = mapped_column(
        String(50),
        default="mandatory",
        nullable=False,
    )

    # Relationships
    standard: Mapped["Standard"] = relationship(
        "Standard",
        back_populates="certification_schemes",
    )
    scheme: Mapped["CertificationScheme"] = relationship(
        "CertificationScheme",
        back_populates="standards",
    )

    def __repr__(self) -> str:
        return f"<StandardCertificationScheme(standard_id={self.standard_id}, scheme_id={self.scheme_id})>"


class CertificationRequirement(Base, UUIDMixin, CreatedTimestampMixin):
    """Step-by-step or documentary requirement for a certification scheme."""

    __tablename__ = "certification_requirements"
    __table_args__ = (
        CheckConstraint(
            "requirement_type IN ('application', 'document', 'testing', 'inspection', 'assessment', 'fee', 'license', 'other')",
            name="ck_certification_requirements_type",
        ),
        Index("ix_certification_requirements_scheme_id", "scheme_id"),
    )

    scheme_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("certification_schemes.id", ondelete="CASCADE"),
        nullable=False,
    )
    requirement_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    source_clause_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clauses.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    # Relationships
    scheme: Mapped["CertificationScheme"] = relationship(
        "CertificationScheme",
        back_populates="requirements",
    )
    source_clause: Mapped[Optional["Clause"]] = relationship("Clause")

    def __repr__(self) -> str:
        return f"<CertificationRequirement(id={self.id}, scheme_id={self.scheme_id}, title='{self.title}')>"
