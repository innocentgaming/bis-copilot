"""SQLAlchemy model for Consumer and Industry Complaints."""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID

from backend.app.database.session import Base


class Complaint(Base):
    """Consumer and Industry Complaint / Grievance model."""

    __tablename__ = "complaints"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    tracking_id = Column(
        String(32),
        unique=True,
        nullable=False,
        index=True,
        doc="Human-friendly tracking ID like BIS-CMP-2026-001234",
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    category = Column(
        String(64),
        nullable=False,
        index=True,
        doc="e.g. fake_isi, defective_product, hallmark_issue, misleading_claim, standard_violation",
    )
    product_name = Column(String(255), nullable=False)
    brand_name = Column(String(255), nullable=True)
    batch_number = Column(String(128), nullable=True)
    seller_name = Column(String(255), nullable=True)
    seller_address = Column(Text, nullable=True)
    is_number = Column(String(64), nullable=True, index=True)
    huid_number = Column(String(32), nullable=True, index=True)
    license_number = Column(String(64), nullable=True)
    description = Column(Text, nullable=False)
    evidence_urls = Column(JSON, default=list, nullable=False)
    complainant_name = Column(String(255), nullable=False)
    complainant_email = Column(String(255), nullable=False)
    complainant_phone = Column(String(32), nullable=True)
    status = Column(
        String(32),
        default="submitted",
        nullable=False,
        index=True,
        doc="submitted | under_investigation | evidence_requested | action_taken | resolved | rejected",
    )
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        Index("ix_complaints_category_status", "category", "status"),
        Index("ix_complaints_created_at", "created_at"),
    )
