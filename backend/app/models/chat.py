import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float, Boolean, ForeignKey, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, TimestampMixin, CreatedTimestampMixin

if TYPE_CHECKING:
    from backend.app.models.user import User
    from backend.app.models.document import Document
    from backend.app.models.standard import Standard
    from backend.app.models.clause import Clause
    from backend.app.models.document_chunk import DocumentChunk


class Conversation(Base, UUIDMixin, TimestampMixin):
    """User chat session history."""

    __tablename__ = "conversations"
    __table_args__ = (
        Index("ix_conversations_user_id", "user_id"),
    )

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        default="New Conversation",
        nullable=False,
    )
    language: Mapped[str] = mapped_column(
        String(10),
        default="en",
        nullable=False,
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="conversations",
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Conversation(id={self.id}, user_id={self.user_id}, title='{self.title}')>"


class Message(Base, UUIDMixin, CreatedTimestampMixin):
    """Individual user or assistant message within a conversation."""

    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_conversation_id", "conversation_id"),
        CheckConstraint(
            "role IN ('user', 'assistant', 'system')",
            name="ck_messages_role",
        ),
        CheckConstraint(
            "confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)",
            name="ck_messages_confidence",
        ),
    )

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    intent: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Relationships
    conversation: Mapped["Conversation"] = relationship(
        "Conversation",
        back_populates="messages",
    )
    citations: Mapped[List["Citation"]] = relationship(
        "Citation",
        back_populates="message",
        cascade="all, delete-orphan",
    )
    feedbacks: Mapped[List["Feedback"]] = relationship(
        "Feedback",
        back_populates="message",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Message(id={self.id}, conversation_id={self.conversation_id}, role='{self.role}')>"


class Citation(Base, UUIDMixin, CreatedTimestampMixin):
    """Traceable evidence citation linking an assistant response to source knowledge."""

    __tablename__ = "citations"
    __table_args__ = (
        Index("ix_citations_message_id", "message_id"),
        Index("ix_citations_document_id", "document_id"),
        Index("ix_citations_standard_id", "standard_id"),
        Index("ix_citations_clause_id", "clause_id"),
        Index("ix_citations_chunk_id", "chunk_id"),
        CheckConstraint(
            "relevance_score IS NULL OR (relevance_score >= 0.0 AND relevance_score <= 1.0)",
            name="ck_citations_relevance_score",
        ),
    )

    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
    )
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True,
    )
    standard_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("standards.id", ondelete="SET NULL"),
        nullable=True,
    )
    clause_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clauses.id", ondelete="SET NULL"),
        nullable=True,
    )
    chunk_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("document_chunks.id", ondelete="SET NULL"),
        nullable=True,
    )
    citation_text: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    relevance_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Relationships
    message: Mapped["Message"] = relationship("Message", back_populates="citations")
    document: Mapped[Optional["Document"]] = relationship("Document")
    standard: Mapped[Optional["Standard"]] = relationship("Standard")
    clause: Mapped[Optional["Clause"]] = relationship("Clause")
    chunk: Mapped[Optional["DocumentChunk"]] = relationship("DocumentChunk")

    def __repr__(self) -> str:
        return f"<Citation(id={self.id}, message_id={self.message_id}, standard_id={self.standard_id})>"


class Feedback(Base, UUIDMixin, CreatedTimestampMixin):
    """User feedback and rating on assistant message answers."""

    __tablename__ = "feedback"
    __table_args__ = (
        Index("ix_feedback_message_id", "message_id"),
        Index("ix_feedback_user_id", "user_id"),
        CheckConstraint(
            "rating IN (-1, 1)",
            name="ck_feedback_rating",
        ),
    )

    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    # Controlled rating: 1 (positive/thumbs up), -1 (negative/thumbs down)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    message: Mapped["Message"] = relationship("Message", back_populates="feedbacks")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="feedbacks")

    def __repr__(self) -> str:
        return f"<Feedback(id={self.id}, message_id={self.message_id}, rating={self.rating})>"
