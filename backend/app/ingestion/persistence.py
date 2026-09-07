"""Transactional persistence layer for saving parsed documents, standards, clauses, and chunks."""

import uuid
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session

from backend.app.models import Document, Standard, Clause, DocumentChunk
from backend.app.ingestion.models import ParsedClause, DocumentChunkData
from backend.app.ingestion.search_index import update_search_vectors_for_document
from backend.app.ingestion.exceptions import DatabasePersistenceError


def check_existing_document(session: Session, checksum: str) -> Optional[Document]:
    """Check if a document with the exact same checksum already exists."""
    return session.query(Document).filter_by(checksum=checksum).first()


def persist_ingested_document(
    session: Session,
    checksum: str,
    metadata: Dict[str, Any],
    clauses: List[ParsedClause],
    chunks: List[DocumentChunkData],
    force: bool = False,
) -> Tuple[Document, Optional[Standard], List[Clause], List[DocumentChunk]]:
    """Persist document, standard, clauses, and chunks into PostgreSQL inside an atomic transaction.

    Args:
        session: Active SQLAlchemy session.
        checksum: SHA-256 digest of source file.
        metadata: Extracted document and standard metadata dictionary.
        clauses: List of parsed clauses.
        chunks: List of prepared chunk models (with embeddings attached).
        force: If True, reconcile/overwrite existing document of same checksum.

    Returns:
        Tuple of (Document, Standard, List[Clause], List[DocumentChunk]).
    """
    try:
        # 1. Deduplication check
        existing_doc = check_existing_document(session, checksum)
        if existing_doc and not force:
            return existing_doc, None, [], []

        if existing_doc and force:
            # Cleanly remove existing dependent entities to allow fresh ingestion
            session.query(DocumentChunk).filter_by(document_id=existing_doc.id).delete()
            session.query(Clause).filter_by(document_id=existing_doc.id).delete()
            session.query(Standard).filter_by(document_id=existing_doc.id).delete()
            doc = existing_doc
            doc.title = metadata.get("title") or doc.title
            doc.status = "active"
        else:
            # Create new Document record
            doc = Document(
                id=uuid.uuid4(),
                title=metadata.get("title") or "Untitled Document",
                document_type=metadata.get("document_type") or "standard",
                source_name=metadata.get("source_name") or "Bureau of Indian Standards",
                source_url=metadata.get("source_url"),
                version=metadata.get("version") or "1.0",
                publication_date=metadata.get("publication_date"),
                effective_date=metadata.get("effective_date"),
                status="active",
                checksum=checksum,
            )
            session.add(doc)

        session.flush()

        # 2. Standard creation (if standard number detected)
        std_record: Optional[Standard] = None
        std_number = metadata.get("standard_number")
        if std_number:
            # Check if standard number exists
            std_record = session.query(Standard).filter_by(standard_number=std_number).first()
            if not std_record:
                std_record = Standard(
                    id=uuid.uuid4(),
                    standard_number=std_number,
                    title=metadata.get("title") or std_number,
                    short_title=metadata.get("short_title"),
                    scope=metadata.get("scope"),
                    edition=metadata.get("edition"),
                    publication_date=metadata.get("publication_date"),
                    status="active",
                    document_id=doc.id,
                )
                session.add(std_record)
            else:
                std_record.document_id = doc.id
            session.flush()

        # 3. Clause creation with parent-child linkage
        clause_map: Dict[str, Clause] = {}
        persisted_clauses: List[Clause] = []

        # First pass: create all clause records
        for c in clauses:
            clause_obj = Clause(
                id=uuid.uuid4(),
                standard_id=std_record.id if std_record else None,
                document_id=doc.id,
                clause_number=c.clause_number,
                heading=c.heading,
                content=c.content or f"Clause {c.clause_number}",
                page_start=c.page_start,
                page_end=c.page_end,
                parent_clause_id=None,
            )
            # If standard_id is non-nullable in schema and no standard exists, create a default standard
            if not clause_obj.standard_id:
                if not std_record:
                    std_record = Standard(
                        id=uuid.uuid4(),
                        standard_number=f"DOC-{doc.id.hex[:8]}",
                        title=doc.title,
                        document_id=doc.id,
                    )
                    session.add(std_record)
                    session.flush()
                clause_obj.standard_id = std_record.id

            session.add(clause_obj)
            clause_map[c.clause_number] = clause_obj
            persisted_clauses.append(clause_obj)

        session.flush()

        # Second pass: wire parent_clause_id relationships
        for c in clauses:
            if c.parent_clause_number and c.parent_clause_number in clause_map:
                parent_obj = clause_map[c.parent_clause_number]
                child_obj = clause_map[c.clause_number]
                child_obj.parent_clause_id = parent_obj.id

        session.flush()

        # 4. DocumentChunk creation
        persisted_chunks: List[DocumentChunk] = []
        for ch in chunks:
            associated_clause = clause_map.get(ch.clause_number) if ch.clause_number else None
            chunk_obj = DocumentChunk(
                id=uuid.uuid4(),
                document_id=doc.id,
                standard_id=std_record.id if std_record else None,
                clause_id=associated_clause.id if associated_clause else None,
                chunk_index=ch.chunk_index,
                content=ch.content,
                page_start=ch.page_start,
                page_end=ch.page_end,
                metadata_json=ch.metadata,
                embedding=ch.embedding,
            )
            session.add(chunk_obj)
            persisted_chunks.append(chunk_obj)

        session.flush()

        # 5. Populate full-text search vectors
        update_search_vectors_for_document(session, str(doc.id))

        # Commit transaction
        session.commit()
        return doc, std_record, persisted_clauses, persisted_chunks

    except Exception as exc:
        session.rollback()
        raise DatabasePersistenceError(f"Failed to persist document transaction: {exc}")
