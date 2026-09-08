"""Notification Data Model."""

import uuid
from typing import Optional
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin


class Notification(Base, UUIDMixin, TimestampMixin):
    """System and compliance notification for users."""

    __tablename__ = "notifications"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="INFO", index=True)  # APPLICATION, CERTIFICATE, COMPLIANCE, ANNOUNCEMENT, STANDARD
    link_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    priority: Mapped[str] = mapped_column(String(20), default="NORMAL")  # HIGH, NORMAL, LOW

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, title='{self.title}', is_read={self.is_read})>"
