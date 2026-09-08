"""BIS Application Tracking and Status History Models."""

import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin


class Application(Base, UUIDMixin, TimestampMixin):
    """BIS Certificate / Licence Application record."""

    __tablename__ = "applications"

    application_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    service_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bis_services.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    standard_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    applicant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    current_status: Mapped[str] = mapped_column(String(100), default="Application Submitted", index=True)
    current_step_index: Mapped[int] = mapped_column(Integer, default=1)
    assigned_department: Mapped[str] = mapped_column(String(255), default="Bureau of Indian Standards Central Scrutiny")
    expected_completion_date: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    status_history: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="ApplicationStatusHistory.created_at.asc()"
    )


class ApplicationStatusHistory(Base, UUIDMixin, TimestampMixin):
    """Immutable status transition log for an application timeline."""

    __tablename__ = "application_status_history"

    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    step_name: Mapped[str] = mapped_column(String(100), nullable=False)
    step_status: Mapped[str] = mapped_column(String(50), default="COMPLETED")  # COMPLETED, IN_PROGRESS, PENDING, REJECTED
    description: Mapped[str] = mapped_column(Text, nullable=False)
    performed_by: Mapped[str] = mapped_column(String(255), default="BIS Officer / Automated Workflow")

    # Relationship
    application: Mapped["Application"] = relationship(
        "Application",
        back_populates="status_history"
    )
