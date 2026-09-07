"""Unit tests for relational retrieval filter construction."""

import uuid
from sqlalchemy import select
from sqlalchemy.dialects import postgresql

from backend.app.models.document_chunk import DocumentChunk
from backend.app.retrieval.filters import FilterBuilder
from backend.app.retrieval.models import RetrievalRequest


def test_filter_by_standard_id():
    std_id = uuid.uuid4()
    req = RetrievalRequest(query="test", standard_id=std_id)
    stmt = select(DocumentChunk)
    filtered = FilterBuilder.apply_filters(stmt, req)

    compiled = str(filtered.compile(dialect=postgresql.dialect()))
    assert "document_chunks.standard_id =" in compiled


def test_filter_by_clause_number():
    req = RetrievalRequest(query="test", clause_number="5.2")
    stmt = select(DocumentChunk)
    filtered = FilterBuilder.apply_filters(stmt, req)

    compiled = str(filtered.compile(dialect=postgresql.dialect()))
    assert "JOIN clauses" in compiled
    assert "clauses.clause_number =" in compiled


def test_filter_by_standard_number():
    req = RetrievalRequest(query="test", standard_number="IS 1293")
    stmt = select(DocumentChunk)
    filtered = FilterBuilder.apply_filters(stmt, req)

    compiled = str(filtered.compile(dialect=postgresql.dialect()))
    assert "JOIN standards" in compiled
    assert "standards.standard_number ILIKE" in compiled


def test_filter_by_document_status_active():
    req = RetrievalRequest(query="test", status="active")
    stmt = select(DocumentChunk)
    filtered = FilterBuilder.apply_filters(stmt, req)

    compiled = str(filtered.compile(dialect=postgresql.dialect()))
    assert "JOIN documents" in compiled
    assert "documents.status =" in compiled
