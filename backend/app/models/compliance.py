"""Compliance Checklist and Evaluation Models."""

import uuid
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Float, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin


class ComplianceRecord(Base, UUIDMixin, TimestampMixin):
    """User product compliance tracking sheet."""

    __tablename__ = "compliance_records"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    standard_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    scheme_name: Mapped[str] = mapped_column(String(100), default="ISI Mark Scheme-I")
    compliance_score: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="ACTION_REQUIRED")  # COMPLIANT, PARTIALLY_COMPLIANT, ACTION_REQUIRED
    checklist_items: Mapped[List[dict]] = mapped_column(JSON, default=list)
    missing_requirements: Mapped[List[str]] = mapped_column(JSON, default=list)
    expiry_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<ComplianceRecord(id={self.id}, product='{self.product_name}', score={self.compliance_score})>"
