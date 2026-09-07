import uuid
from datetime import date
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Date, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.document import Document
    from backend.app.models.clause import Clause
    from backend.app.models.certification import StandardCertificationScheme
    from backend.app.models.laboratory import TestRequirement, LaboratoryCapability
    from backend.app.models.product import ProductStandard


class Standard(Base, UUIDMixin, TimestampMixin):
    """Indian Standard specification (e.g., IS 1293:2019)."""

    __tablename__ = "standards"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'withdrawn', 'superseded', 'draft')",
            name="ck_standards_status",
        ),
    )

    standard_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    short_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    scope: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    edition: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    publication_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        index=True,
        nullable=False,
    )
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    # Relationships
    document: Mapped[Optional["Document"]] = relationship(
        "Document",
        back_populates="standards",
    )
    clauses: Mapped[List["Clause"]] = relationship(
        "Clause",
        back_populates="standard",
        cascade="all, delete-orphan",
    )
    test_requirements: Mapped[List["TestRequirement"]] = relationship(
        "TestRequirement",
        back_populates="standard",
        cascade="all, delete-orphan",
    )
    product_standards: Mapped[List["ProductStandard"]] = relationship(
        "ProductStandard",
        back_populates="standard",
        cascade="all, delete-orphan",
    )
    certification_schemes: Mapped[List["StandardCertificationScheme"]] = relationship(
        "StandardCertificationScheme",
        back_populates="standard",
        cascade="all, delete-orphan",
    )
    laboratory_capabilities: Mapped[List["LaboratoryCapability"]] = relationship(
        "LaboratoryCapability",
        back_populates="standard",
    )

    def __repr__(self) -> str:
        return f"<Standard(id={self.id}, standard_number='{self.standard_number}', status='{self.status}')>"
