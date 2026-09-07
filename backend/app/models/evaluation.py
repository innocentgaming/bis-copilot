import uuid
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float, ForeignKey, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, CreatedTimestampMixin

if TYPE_CHECKING:
    from backend.app.models.standard import Standard
    from backend.app.models.clause import Clause


class EvaluationQuestion(Base, UUIDMixin, CreatedTimestampMixin):
    """Ground truth benchmark questions for continuous RAG and copilot evaluation."""

    __tablename__ = "evaluation_questions"
    __table_args__ = (
        Index("ix_eval_questions_expected_std", "expected_standard_id"),
        Index("ix_eval_questions_expected_cls", "expected_clause_id"),
    )

    question: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(
        String(10),
        default="en",
        nullable=False,
    )
    expected_intent: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    expected_standard_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("standards.id", ondelete="SET NULL"),
        nullable=True,
    )
    expected_clause_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clauses.id", ondelete="SET NULL"),
        nullable=True,
    )
    expected_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    expected_standard: Mapped[Optional["Standard"]] = relationship("Standard")
    expected_clause: Mapped[Optional["Clause"]] = relationship("Clause")
    evaluation_runs: Mapped[List["EvaluationRun"]] = relationship(
        "EvaluationRun",
        back_populates="question",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<EvaluationQuestion(id={self.id}, question='{self.question[:30]}...')>"


class EvaluationRun(Base, UUIDMixin, CreatedTimestampMixin):
    """Test execution results measuring retrieval, citation accuracy, and hallucination."""

    __tablename__ = "evaluation_runs"
    __table_args__ = (
        Index("ix_evaluation_runs_question_id", "question_id"),
        CheckConstraint(
            "citation_accuracy IS NULL OR (citation_accuracy >= 0.0 AND citation_accuracy <= 1.0)",
            name="ck_eval_runs_citation_accuracy",
        ),
        CheckConstraint(
            "retrieval_score IS NULL OR (retrieval_score >= 0.0 AND retrieval_score <= 1.0)",
            name="ck_eval_runs_retrieval_score",
        ),
        CheckConstraint(
            "answer_score IS NULL OR (answer_score >= 0.0 AND answer_score <= 1.0)",
            name="ck_eval_runs_answer_score",
        ),
        CheckConstraint(
            "hallucination_score IS NULL OR (hallucination_score >= 0.0 AND hallucination_score <= 1.0)",
            name="ck_eval_runs_hallucination_score",
        ),
    )

    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evaluation_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    generated_answer: Mapped[str] = mapped_column(Text, nullable=False)
    retrieved_chunks: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    citation_accuracy: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    retrieval_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    answer_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    hallucination_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Relationships
    question: Mapped["EvaluationQuestion"] = relationship(
        "EvaluationQuestion",
        back_populates="evaluation_runs",
    )

    def __repr__(self) -> str:
        return f"<EvaluationRun(id={self.id}, question_id={self.question_id}, citation_accuracy={self.citation_accuracy})>"
