import uuid
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Float, ForeignKey, UniqueConstraint, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from backend.app.database.session import Base
from backend.app.models.base import UUIDMixin, CreatedTimestampMixin
from backend.app.config import get_settings

if TYPE_CHECKING:
    from backend.app.models.standard import Standard
    from backend.app.models.clause import Clause

settings = get_settings()


class Product(Base, UUIDMixin, CreatedTimestampMixin):
    """Consumer or industrial products evaluated against Indian Standards."""

    __tablename__ = "products"
    __table_args__ = (
        Index("ix_products_category", "category"),
    )

    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attributes: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # Vector embedding for product-to-standard semantic matching
    embedding: Mapped[Optional[List[float]]] = mapped_column(
        Vector(settings.EMBEDDING_DIMENSION),
        nullable=True,
    )

    # Relationships
    standards: Mapped[List["ProductStandard"]] = relationship(
        "ProductStandard",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name='{self.name}', category='{self.category}')>"


class ProductStandard(Base, UUIDMixin, CreatedTimestampMixin):
    """Mapping between a product and an applicable Indian Standard."""

    __tablename__ = "product_standards"
    __table_args__ = (
        UniqueConstraint("product_id", "standard_id", name="uq_product_standards"),
        CheckConstraint(
            "applicability IN ('applicable', 'potentially_applicable', 'not_applicable', 'unknown')",
            name="ck_product_standards_applicability",
        ),
        CheckConstraint(
            "confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)",
            name="ck_product_standards_confidence",
        ),
        Index("ix_product_standards_product_id", "product_id"),
        Index("ix_product_standards_standard_id", "standard_id"),
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    standard_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("standards.id", ondelete="RESTRICT"),
        nullable=False,
    )
    applicability: Mapped[str] = mapped_column(
        String(50),
        default="applicable",
        nullable=False,
    )
    reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    source_clause_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("clauses.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="standards")
    standard: Mapped["Standard"] = relationship("Standard", back_populates="product_standards")
    source_clause: Mapped[Optional["Clause"]] = relationship("Clause")

    def __repr__(self) -> str:
        return f"<ProductStandard(product_id={self.product_id}, standard_id={self.standard_id}, applicability='{self.applicability}')>"
