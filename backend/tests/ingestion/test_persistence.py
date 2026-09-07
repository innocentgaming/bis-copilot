"""Tests for database persistence, deduplication, and atomic rollback."""

import uuid
import pytest
from sqlalchemy import text

from backend.app.database.connection import check_sync_connection
from backend.app.database.session import SyncSessionLocal
from backend.app.ingestion.persistence import persist_ingested_document, check_existing_document
from backend.app.ingestion.models import ParsedClause, DocumentChunkData
from backend.app.models import Document, Standard, Clause, DocumentChunk


@pytest.fixture(scope="module")
def db_session():
    if not check_sync_connection():
        pytest.skip("Live PostgreSQL database required for persistence test. Start with docker compose up -d postgres")
    session = SyncSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_live_document_persistence_and_deduplication(db_session):
    """Verify document, standard, clauses, and chunks persist and respect deduplication."""
    test_checksum = f"test_sha256_{uuid.uuid4().hex}"
    meta = {
        "title": "[TEST] Synthetic Safety Standard",
        "standard_number": f"IS-TEST-{uuid.uuid4().hex[:6]}",
        "document_type": "standard",
        "source_name": "Test BIS Bureau",
    }
    clauses = [
        ParsedClause(clause_number="1", heading="Scope", content="Test scope", page_start=1, page_end=1),
        ParsedClause(clause_number="1.1", heading="Voltage", content="230V rating", page_start=1, page_end=1, parent_clause_number="1"),
    ]
    chunks = [
        DocumentChunkData(chunk_index=0, content="Test chunk 0", page_start=1, page_end=1, clause_number="1.1", embedding=[0.01]*1536),
    ]

    # First ingestion
    doc, std, p_clauses, p_chunks = persist_ingested_document(
        session=db_session,
        checksum=test_checksum,
        metadata=meta,
        clauses=clauses,
        chunks=chunks,
        force=False,
    )
    assert doc is not None
    assert std is not None
    assert len(p_clauses) == 2
    assert len(p_chunks) == 1

    # Second ingestion without force -> must deduplicate and return existing without creating extra rows
    doc2, std2, p_clauses2, p_chunks2 = persist_ingested_document(
        session=db_session,
        checksum=test_checksum,
        metadata=meta,
        clauses=clauses,
        chunks=chunks,
        force=False,
    )
    assert doc2.id == doc.id
    assert p_chunks2 == []  # No extra chunks created
