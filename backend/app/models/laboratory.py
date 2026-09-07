import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Float, Boolean, ForeignKey, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin, CreatedTimestampMixin

if TYPE_CHECKING:
    from backend.app.models.document import Document
    from backend.app.models.standard import Standard
    from backend.app.models.clause import Clause


class Laboratory(Base, UUIDMixin, TimestampMixin):
    """Testing laboratories accredited or recognized by BIS."""

    __tablename__ = "laboratories"
    __table_args__ = (
        Index("ix_laboratories_city", "city"),
        Index("ix_laboratories_state", "state"),
        Index("ix_laboratories_pincode", "pincode"),
        Index("ix_laboratories_status", "status"),
        CheckConstraint(
            "latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)",
            name="ck_laboratories_latitude",
        ),
        CheckConstraint(
            "longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)",
            name="ck_laboratories_longitude",
        ),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(20), nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        nullable=False,
    )
    source_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    # Relationships
    capabilities: Mapped[List["LaboratoryCapability"]] = relationship(
        "LaboratoryCapability",
        back_populates="laboratory",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Laboratory(id={self.id}, name='{self.name}', city='{self.city}', state='{self.state}')>"


class TestRequirement(Base, UUIDMixin, CreatedTimestampMixin):
    """Specific test requirements defined in an Indian Standard."""

    __test__ = False
    __tablename__ = "test_requirements"
    __table_args__ = (
        Index("ix_test_requirements_standard_id", "standard_id"),
    )

    standard_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("standards.id", ondelete="CASCADE"),
        nullable=False,
    )
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    test_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    test_method: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    source_clause_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clauses.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    # Relationships
    standard: Mapped["Standard"] = relationship(
        "Standard",
        back_populates="test_requirements",
    )
    source_clause: Mapped[Optional["Clause"]] = relationship("Clause")
    laboratory_capabilities: Mapped[List["LaboratoryCapability"]] = relationship(
        "LaboratoryCapability",
        back_populates="test_requirement",
    )

    def __repr__(self) -> str:
        return f"<TestRequirement(id={self.id}, standard_id={self.standard_id}, test_name='{self.test_name}')>"


class LaboratoryCapability(Base, UUIDMixin):
    """Specific standard or test capability certified for a laboratory."""

    __tablename__ = "laboratory_capabilities"
    __table_args__ = (
        Index("ix_lab_caps_laboratory_id", "laboratory_id"),
        Index("ix_lab_caps_standard_id", "standard_id"),
        Index("ix_lab_caps_test_req_id", "test_requirement_id"),
    )

    laboratory_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("laboratories.id", ondelete="CASCADE"),
        nullable=False,
    )
    standard_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("standards.id", ondelete="RESTRICT"),
        nullable=True,
    )
    test_requirement_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("test_requirements.id", ondelete="RESTRICT"),
        nullable=True,
    )
    capability_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="RESTRICT"),
        index=True,
        nullable=True,
    )

    # Relationships
    laboratory: Mapped["Laboratory"] = relationship(
        "Laboratory",
        back_populates="capabilities",
    )
    standard: Mapped[Optional["Standard"]] = relationship(
        "Standard",
        back_populates="laboratory_capabilities",
    )
    test_requirement: Mapped[Optional["TestRequirement"]] = relationship(
        "TestRequirement",
        back_populates="laboratory_capabilities",
    )

    def __repr__(self) -> str:
        return f"<LaboratoryCapability(id={self.id}, lab_id={self.laboratory_id}, capability='{self.capability_name}')>"
