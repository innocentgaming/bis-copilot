"""Central pipeline orchestrator for document ingestion."""

import time
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.database.session import SyncSessionLocal
from backend.app.database.connection import check_sync_connection
from backend.app.ingestion.models import (
    IngestionOptions,
    IngestionResult,
    IngestionQualityMetrics,
)
from backend.app.ingestion.validation import validate_document
from backend.app.ingestion.checksum import compute_file_sha256
from backend.app.ingestion.pdf_extractor import extract_pdf_pages
from backend.app.ingestion.metadata import extract_document_metadata
from backend.app.ingestion.clause_parser import parse_clauses_from_pages
from backend.app.ingestion.chunker import chunk_parsed_clauses
from backend.app.ingestion.embeddings import get_embedding_provider, EmbeddingProvider
from backend.app.ingestion.persistence import check_existing_document, persist_ingested_document
from backend.app.ingestion.logging import get_ingestion_logger, log_stage, log_warning, log_error
from backend.app.ingestion.exceptions import IngestionError


class DocumentIngestionPipeline:
    """End-to-end document ingestion pipeline."""

    def __init__(
        self,
        embedding_provider: Optional[EmbeddingProvider] = None,
        verbose: bool = False,
    ):
        self.logger = get_ingestion_logger(verbose=verbose)
        self.embedding_provider = embedding_provider or get_embedding_provider("deterministic")

    def ingest_file(
        self,
        file_path: str,
        options: Optional[IngestionOptions] = None,
        session: Optional[Session] = None,
    ) -> IngestionResult:
        """Execute full ingestion workflow for a single document.

        Args:
            file_path: Path to the target PDF document.
            options: Runtime ingestion options (force, dry_run, overrides).
            session: Optional existing SQLAlchemy sync session (for tests or custom transactions).

        Returns:
            IngestionResult with comprehensive execution statistics and entity IDs.
        """
        opts = options or IngestionOptions()
        start_time = time.time()
        warnings = []

        log_stage(self.logger, "ingest", f"Starting ingestion for: {file_path}")

        # 1. Validation
        val_result = validate_document(file_path)
        if not val_result.valid:
            log_error(self.logger, "validate", f"Validation failed: {val_result.errors}")
            return IngestionResult(
                success=False,
                file_path=file_path,
                errors=val_result.errors,
                warnings=val_result.warnings,
                duration_seconds=time.time() - start_time,
            )

        log_stage(self.logger, "validate", f"PDF valid — {val_result.page_count} pages ({val_result.file_size_bytes} bytes)")

        # 2. Checksum calculation
        checksum = compute_file_sha256(file_path)
        log_stage(self.logger, "checksum", f"SHA256: {checksum[:16]}...")

        # 3. Deduplication check (unless dry_run or force)
        owns_session = False
        if session is None and not opts.dry_run:
            if check_sync_connection():
                session = SyncSessionLocal()
                owns_session = True

        if session and not opts.force and not opts.dry_run:
            existing = check_existing_document(session, checksum)
            if existing:
                log_stage(self.logger, "dedup", f"Document with checksum {checksum[:8]} already ingested. Skipping (use --force to reprocess).")
                if owns_session:
                    session.close()
                return IngestionResult(
                    success=True,
                    file_path=file_path,
                    document_id=str(existing.id),
                    is_duplicate=True,
                    warnings=["Document already exists in database; skipped."],
                    duration_seconds=time.time() - start_time,
                )

        # 4. Text Extraction (Page-aware with OCR fallback)
        try:
            pages, extraction_method = extract_pdf_pages(
                file_path,
                ocr_enabled=opts.ocr_enabled,
            )
            log_stage(self.logger, "extract", f"Extracted {len(pages)} pages via {extraction_method}")
            for p in pages:
                if p.warnings:
                    warnings.extend(p.warnings)
        except Exception as exc:
            log_error(self.logger, "extract", f"Extraction failed: {exc}")
            if owns_session and session:
                session.close()
            return IngestionResult(
                success=False,
                file_path=file_path,
                errors=[f"Extraction error: {exc}"],
                duration_seconds=time.time() - start_time,
            )

        # 5. Metadata Extraction
        metadata = extract_document_metadata(file_path, pages, opts)
        std_num = metadata.get("standard_number")
        log_stage(self.logger, "metadata", f"Standard: {std_num or 'Unknown'} | Title: {metadata.get('title')[:40]}...")

        if not std_num:
            warnings.append("No authoritative standard number detected; document ingested as general specification.")

        # 6. Clause Detection & Hierarchy
        clauses = parse_clauses_from_pages(pages)
        log_stage(self.logger, "clauses", f"Detected {len(clauses)} structural clauses/annexes")

        # 7. Clause-aware Chunking
        chunks = chunk_parsed_clauses(
            clauses,
            standard_number=std_num,
            extraction_method=extraction_method,
        )
        log_stage(self.logger, "chunks", f"Generated {len(chunks)} contextual chunks")

        # 8. Embedding Generation
        log_stage(self.logger, "embed", f"Computing embeddings for {len(chunks)} chunks (batch size: {opts.embedding_batch_size})...")
        chunk_texts = [c.content for c in chunks]
        embeddings = self.embedding_provider.embed_documents(chunk_texts)

        # Attach embeddings to chunks
        for idx, emb in enumerate(embeddings):
            chunks[idx].embedding = emb

        # 9. Database Persistence (or Dry-Run Preview)
        doc_id = None
        std_id = None

        if opts.dry_run:
            log_stage(self.logger, "dry_run", "Dry run enabled — skipping database persistence.")
        elif session:
            try:
                log_stage(self.logger, "db", "Persisting document, standard, clauses, and chunks in atomic transaction...")
                doc, std, p_clauses, p_chunks = persist_ingested_document(
                    session=session,
                    checksum=checksum,
                    metadata=metadata,
                    clauses=clauses,
                    chunks=chunks,
                    force=opts.force,
                )
                doc_id = str(doc.id)
                std_id = str(std.id) if std else None
                log_stage(self.logger, "verify", "Integrity check passed — all entities persisted and indexed.")
            except Exception as exc:
                log_error(self.logger, "db", f"Persistence failed: {exc}")
                if owns_session:
                    session.close()
                return IngestionResult(
                    success=False,
                    file_path=file_path,
                    errors=[f"Database persistence error: {exc}"],
                    duration_seconds=time.time() - start_time,
                )
            finally:
                if owns_session:
                    session.close()
        else:
            warnings.append("No active database session available; chunks generated in memory only.")

        # 10. Quality Metrics & Summary
        duration = time.time() - start_time
        total_chars = sum(p.char_count for p in pages)
        empty_pages = sum(1 for p in pages if p.char_count < 10)
        ocr_pages = sum(1 for p in pages if p.is_ocr)

        metrics = IngestionQualityMetrics(
            page_count=len(pages),
            characters_extracted=total_chars,
            average_chars_per_page=total_chars / len(pages) if pages else 0.0,
            empty_pages=empty_pages,
            ocr_pages=ocr_pages,
            clauses_detected=len(clauses),
            chunks_generated=len(chunks),
            duration_seconds=duration,
        )

        log_stage(self.logger, "ingest", f"COMPLETE in {duration:.2f}s ({len(chunks)} chunks, {len(clauses)} clauses)")

        return IngestionResult(
            success=True,
            file_path=file_path,
            document_id=doc_id,
            standard_id=std_id,
            standard_number=std_num,
            pages=len(pages),
            clauses=len(clauses),
            chunks=len(chunks),
            embedding_count=len(embeddings),
            extraction_method=extraction_method,
            duration_seconds=duration,
            metrics=metrics,
            warnings=warnings,
        )
