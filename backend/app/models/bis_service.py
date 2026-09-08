"""BIS Service and Scheme Data Models."""

import uuid
from typing import Optional, List
from sqlalchemy import String, Text, Integer, Float, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin


class BISService(Base, UUIDMixin, TimestampMixin):
    """Bureau of Indian Standards service catalogue entry."""

    __tablename__ = "bis_services"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    eligibility: Mapped[str] = mapped_column(Text, nullable=False)
    documents_required: Mapped[List[str]] = mapped_column(JSON, default=list)
    fee_structure: Mapped[str] = mapped_column(Text, nullable=False)
    processing_time_days: Mapped[int] = mapped_column(Integer, default=30)
    how_to_apply: Mapped[str] = mapped_column(Text, nullable=False)
    portal_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<BISService(id={self.id}, name='{self.name}', category='{self.category}')>"
