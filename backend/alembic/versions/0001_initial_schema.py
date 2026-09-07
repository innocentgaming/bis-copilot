"""Initial database schema with pgvector, full-text search, and core entities

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-07 10:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    from backend.app.config import get_settings
    embedding_dim = get_settings().EMBEDDING_DIMENSION
except Exception:
    embedding_dim = int(os.getenv("EMBEDDING_DIMENSION", "1536"))

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2. Users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="user"),
        sa.Column("preferred_language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("role IN ('user', 'admin')", name="ck_users_role"),
        sa.CheckConstraint("preferred_language IN ('en', 'hi', 'mr')", name="ck_users_preferred_language"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 3. Documents table
    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("document_type", sa.String(length=50), nullable=False),
        sa.Column("source_name", sa.String(length=255), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("storage_url", sa.Text(), nullable=True),
        sa.Column("version", sa.String(length=50), nullable=False, server_default="1.0"),
        sa.Column("publication_date", sa.Date(), nullable=True),
        sa.Column("effective_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("checksum", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "document_type IN ('standard', 'certification', 'hallmarking', 'laboratory', 'consumer', 'regulation', 'guideline', 'other')",
            name="ck_documents_document_type",
        ),
        sa.CheckConstraint(
            "status IN ('active', 'inactive', 'superseded', 'draft')",
            name="ck_documents_status",
        ),
    )
    op.create_index("ix_documents_document_type", "documents", ["document_type"])
    op.create_index("ix_documents_source_name", "documents", ["source_name"])
    op.create_index("ix_documents_source_url", "documents", ["source_url"])
    op.create_index("ix_documents_status", "documents", ["status"])
    op.create_index("ix_documents_checksum", "documents", ["checksum"])

    # 4. Standards table
    op.create_table(
        "standards",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("standard_number", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("short_title", sa.String(length=255), nullable=True),
        sa.Column("scope", sa.Text(), nullable=True),
        sa.Column("edition", sa.String(length=50), nullable=True),
        sa.Column("publication_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "status IN ('active', 'withdrawn', 'superseded', 'draft')",
            name="ck_standards_status",
        ),
    )
    op.create_index("ix_standards_standard_number", "standards", ["standard_number"], unique=True)
    op.create_index("ix_standards_status", "standards", ["status"])
    op.create_index("ix_standards_document_id", "standards", ["document_id"])

    # 5. Clauses table
    op.create_table(
        "clauses",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("standard_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("clause_number", sa.String(length=50), nullable=False),
        sa.Column("heading", sa.String(length=500), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("page_start", sa.Integer(), nullable=True),
        sa.Column("page_end", sa.Integer(), nullable=True),
        sa.Column("parent_clause_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["standard_id"], ["standards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["parent_clause_id"], ["clauses.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "page_start IS NULL OR page_end IS NULL OR page_end >= page_start",
            name="ck_clauses_page_range",
        ),
    )
    op.create_index("ix_clauses_standard_id", "clauses", ["standard_id"])
    op.create_index("ix_clauses_clause_number", "clauses", ["clause_number"])
    op.create_index("ix_clauses_document_id", "clauses", ["document_id"])
    op.create_index("ix_clauses_parent_clause_id", "clauses", ["parent_clause_id"])
    op.create_index("ix_clauses_standard_clause", "clauses", ["standard_id", "clause_number"])

    # 6. Document Chunks table
    op.create_table(
        "document_chunks",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("standard_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("clause_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("chunk_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("page_start", sa.Integer(), nullable=True),
        sa.Column("page_end", sa.Integer(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("embedding", Vector(embedding_dim), nullable=True),
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["standard_id"], ["standards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["clause_id"], ["clauses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "page_start IS NULL OR page_end IS NULL OR page_end >= page_start",
            name="ck_chunks_page_range",
        ),
    )
    op.create_index("ix_document_chunks_document_id", "document_chunks", ["document_id"])
    op.create_index("ix_document_chunks_standard_id", "document_chunks", ["standard_id"])
    op.create_index("ix_document_chunks_clause_id", "document_chunks", ["clause_id"])
    op.create_index("ix_document_chunks_clause_chunk_idx", "document_chunks", ["clause_id", "chunk_index"])
    op.create_index(
        "ix_document_chunks_embedding_hnsw",
        "document_chunks",
        ["embedding"],
        postgresql_using="hnsw",
        postgresql_with={"m": 16, "ef_construction": 64},
        postgresql_ops={"embedding": "vector_cosine_ops"},
    )
    op.create_index(
        "ix_document_chunks_search_vector_gin",
        "document_chunks",
        ["search_vector"],
        postgresql_using="gin",
    )

    # 7. Products table
    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("attributes", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("embedding", Vector(embedding_dim), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_products_name", "products", ["name"])
    op.create_index("ix_products_category", "products", ["category"])

    # 8. Product-Standard Relationship table
    op.create_table(
        "product_standards",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("standard_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("applicability", sa.String(length=50), nullable=False, server_default="applicable"),
        sa.Column("reasoning", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("source_clause_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["standard_id"], ["standards.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["source_clause_id"], ["clauses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id", "standard_id", name="uq_product_standards"),
        sa.CheckConstraint(
            "applicability IN ('applicable', 'potentially_applicable', 'not_applicable', 'unknown')",
            name="ck_product_standards_applicability",
        ),
        sa.CheckConstraint(
            "confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)",
            name="ck_product_standards_confidence",
        ),
    )
    op.create_index("ix_product_standards_product_id", "product_standards", ["product_id"])
    op.create_index("ix_product_standards_standard_id", "product_standards", ["standard_id"])
    op.create_index("ix_product_standards_source_clause_id", "product_standards", ["source_clause_id"])

    # 9. Certification Schemes table
    op.create_table(
        "certification_schemes",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("scope", sa.Text(), nullable=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_certification_schemes_code", "certification_schemes", ["code"], unique=True)
    op.create_index("ix_certification_schemes_document_id", "certification_schemes", ["document_id"])

    # 10. Standard-Certification Schemes table (Many-to-many)
    op.create_table(
        "standard_certification_schemes",
        sa.Column("standard_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("scheme_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("applicability", sa.String(length=50), nullable=False, server_default="mandatory"),
        sa.ForeignKeyConstraint(["standard_id"], ["standards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["scheme_id"], ["certification_schemes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("standard_id", "scheme_id"),
    )

    # 11. Certification Requirements table
    op.create_table(
        "certification_requirements",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("scheme_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("requirement_type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sequence_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mandatory", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("source_clause_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["scheme_id"], ["certification_schemes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_clause_id"], ["clauses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "requirement_type IN ('application', 'document', 'testing', 'inspection', 'assessment', 'fee', 'license', 'other')",
            name="ck_certification_requirements_type",
        ),
    )
    op.create_index("ix_certification_requirements_scheme_id", "certification_requirements", ["scheme_id"])
    op.create_index("ix_certification_requirements_source_clause_id", "certification_requirements", ["source_clause_id"])

    # 12. Laboratories table
    op.create_table(
        "laboratories",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("pincode", sa.String(length=20), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("source_document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["source_document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)",
            name="ck_laboratories_latitude",
        ),
        sa.CheckConstraint(
            "longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)",
            name="ck_laboratories_longitude",
        ),
    )
    op.create_index("ix_laboratories_city", "laboratories", ["city"])
    op.create_index("ix_laboratories_state", "laboratories", ["state"])
    op.create_index("ix_laboratories_pincode", "laboratories", ["pincode"])
    op.create_index("ix_laboratories_status", "laboratories", ["status"])
    op.create_index("ix_laboratories_source_document_id", "laboratories", ["source_document_id"])

    # 13. Test Requirements table
    op.create_table(
        "test_requirements",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("standard_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("test_name", sa.String(length=255), nullable=False),
        sa.Column("test_description", sa.Text(), nullable=True),
        sa.Column("test_method", sa.String(length=255), nullable=True),
        sa.Column("mandatory", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("source_clause_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["standard_id"], ["standards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_clause_id"], ["clauses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_test_requirements_standard_id", "test_requirements", ["standard_id"])
    op.create_index("ix_test_requirements_source_clause_id", "test_requirements", ["source_clause_id"])

    # 14. Laboratory Capabilities table
    op.create_table(
        "laboratory_capabilities",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("laboratory_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("standard_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("test_requirement_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("capability_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("source_document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["laboratory_id"], ["laboratories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["standard_id"], ["standards.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["test_requirement_id"], ["test_requirements.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["source_document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_lab_caps_laboratory_id", "laboratory_capabilities", ["laboratory_id"])
    op.create_index("ix_lab_caps_standard_id", "laboratory_capabilities", ["standard_id"])
    op.create_index("ix_lab_caps_test_req_id", "laboratory_capabilities", ["test_requirement_id"])
    op.create_index("ix_lab_caps_source_doc_id", "laboratory_capabilities", ["source_document_id"])

    # 15. Conversations table
    op.create_table(
        "conversations",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False, server_default="New Conversation"),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_conversations_user_id", "conversations", ["user_id"])

    # 16. Messages table
    op.create_table(
        "messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("intent", sa.String(length=100), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("response_time_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("role IN ('user', 'assistant', 'system')", name="ck_messages_role"),
        sa.CheckConstraint(
            "confidence IS NULL OR (confidence >= 0.0 AND confidence <= 1.0)",
            name="ck_messages_confidence",
        ),
    )
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])

    # 17. Citations table
    op.create_table(
        "citations",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("message_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("standard_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("clause_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("chunk_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("citation_text", sa.Text(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("relevance_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["message_id"], ["messages.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["standard_id"], ["standards.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["clause_id"], ["clauses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["chunk_id"], ["document_chunks.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "relevance_score IS NULL OR (relevance_score >= 0.0 AND relevance_score <= 1.0)",
            name="ck_citations_relevance_score",
        ),
    )
    op.create_index("ix_citations_message_id", "citations", ["message_id"])
    op.create_index("ix_citations_document_id", "citations", ["document_id"])
    op.create_index("ix_citations_standard_id", "citations", ["standard_id"])
    op.create_index("ix_citations_clause_id", "citations", ["clause_id"])
    op.create_index("ix_citations_chunk_id", "citations", ["chunk_id"])

    # 18. Feedback table
    op.create_table(
        "feedback",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("message_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["message_id"], ["messages.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("rating IN (-1, 1)", name="ck_feedback_rating"),
    )
    op.create_index("ix_feedback_message_id", "feedback", ["message_id"])
    op.create_index("ix_feedback_user_id", "feedback", ["user_id"])

    # 19. Hallmarking Info table
    op.create_table(
        "hallmarking_info",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("source_clause_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["source_document_id"], ["documents.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["source_clause_id"], ["clauses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hallmarking_info_category", "hallmarking_info", ["category"])
    op.create_index("ix_hallmarking_info_status", "hallmarking_info", ["status"])
    op.create_index("ix_hallmarking_info_source_doc_id", "hallmarking_info", ["source_document_id"])
    op.create_index("ix_hallmarking_info_source_cls_id", "hallmarking_info", ["source_clause_id"])

    # 20. Evaluation Questions table
    op.create_table(
        "evaluation_questions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("expected_intent", sa.String(length=100), nullable=True),
        sa.Column("expected_standard_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("expected_clause_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("expected_answer", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["expected_standard_id"], ["standards.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["expected_clause_id"], ["clauses.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_eval_questions_expected_std", "evaluation_questions", ["expected_standard_id"])
    op.create_index("ix_eval_questions_expected_cls", "evaluation_questions", ["expected_clause_id"])

    # 21. Evaluation Runs table
    op.create_table(
        "evaluation_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("question_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("generated_answer", sa.Text(), nullable=False),
        sa.Column("retrieved_chunks", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("citation_accuracy", sa.Float(), nullable=True),
        sa.Column("retrieval_score", sa.Float(), nullable=True),
        sa.Column("answer_score", sa.Float(), nullable=True),
        sa.Column("hallucination_score", sa.Float(), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["evaluation_questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "citation_accuracy IS NULL OR (citation_accuracy >= 0.0 AND citation_accuracy <= 1.0)",
            name="ck_eval_runs_citation_accuracy",
        ),
        sa.CheckConstraint(
            "retrieval_score IS NULL OR (retrieval_score >= 0.0 AND retrieval_score <= 1.0)",
            name="ck_eval_runs_retrieval_score",
        ),
        sa.CheckConstraint(
            "answer_score IS NULL OR (answer_score >= 0.0 AND answer_score <= 1.0)",
            name="ck_eval_runs_answer_score",
        ),
        sa.CheckConstraint(
            "hallucination_score IS NULL OR (hallucination_score >= 0.0 AND hallucination_score <= 1.0)",
            name="ck_eval_runs_hallucination_score",
        ),
    )
    op.create_index("ix_evaluation_runs_question_id", "evaluation_runs", ["question_id"])


def downgrade() -> None:
    # Drop tables in reverse dependency order
    op.drop_table("evaluation_runs")
    op.drop_table("evaluation_questions")
    op.drop_table("hallmarking_info")
    op.drop_table("feedback")
    op.drop_table("citations")
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("laboratory_capabilities")
    op.drop_table("test_requirements")
    op.drop_table("laboratories")
    op.drop_table("certification_requirements")
    op.drop_table("standard_certification_schemes")
    op.drop_table("certification_schemes")
    op.drop_table("product_standards")
    op.drop_table("products")
    op.drop_table("document_chunks")
    op.drop_table("clauses")
    op.drop_table("standards")
    op.drop_table("documents")
    op.drop_table("users")

    # Drop extension
    op.execute("DROP EXTENSION IF EXISTS vector;")
