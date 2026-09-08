"""Frequently Asked Questions (FAQ) Data Model."""

import uuid
from typing import Optional
from sqlalchemy import String, Text, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin


class FAQ(Base, UUIDMixin, TimestampMixin):
    """Categorized BIS questions and authoritative answers."""

    __tablename__ = "faqs"

    question: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    related_standard: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<FAQ(id={self.id}, question='{self.question[:40]}...')>"
