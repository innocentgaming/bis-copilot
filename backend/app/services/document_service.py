"""Document management service interfacing with Phase 2 ingestion."""

import os
from pathlib import Path
from typing import List, Optional, Tuple
import uuid
from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.errors import (
    BaseApiException,
    ConflictException,
    ErrorCodes,
    NotFoundException,
)
from backend.app.api.schemas.documents import (
    DocumentDetail,
    DocumentPatchRequest,
    DocumentSummary,
    IngestionJobResponse,
)
from backend.app.config import get_settings
from backend.app.ingestion.checksum import compute_file_sha256
from backend.app.ingestion.models import IngestionOptions
from backend.app.ingestion.validation import validate_document
from backend.app.jobs.models import IngestionJob
from backend.app.jobs.runner import job_manager
from backend.app.models.clause import Clause
from backend.app.models.document import Document
from backend.app.models.document_chunk import DocumentChunk
from backend.app.models.standard import Standard

settings = get_settings()


class DocumentService:
    """Handles document records, security-hardened uploads, and ingestion jobs."""

    @staticmethod
    async def list_documents(
        session: AsyncSession,
        document_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[DocumentSummary], int]:
        """List documents with optional type and status filtering."""
        query = select(Document)
        count_query = select(func.count(Document.id))

        if document_type:
            query = query.where(Document.document_type == document_type)
            count_query = count_query.where(Document.document_type == document_type)
        if status_filter:
            query = query.where(Document.status == status_filter)
            count_query = count_query.where(Document.status == status_filter)

        query = query.order_by(Document.created_at.desc()).limit(limit).offset(offset)

        total_res = await session.execute(count_query)
        total = total_res.scalar_one()

        res = await session.execute(query)
        docs = res.scalars().all()

        summaries = [
            DocumentSummary(
                id=d.id,
                title=d.title,
                document_type=d.document_type,
                source_name=d.source_name,
                version=d.version,
                status=d.status,
                publication_date=d.publication_date.isoformat() if d.publication_date else None,
                created_at=d.created_at.isoformat() if d.created_at else None,
            )
            for d in docs
        ]
        return summaries, total

    @staticmethod
    async def get_document(
        session: AsyncSession,
        document_id: uuid.UUID,
    ) -> Optional[DocumentDetail]:
        """Fetch detailed document record including associated entity counts."""
        doc = await session.get(Document, document_id)
        if not doc:
            return None

        # Count standards
        std_count_res = await session.execute(
            select(func.count(Standard.id)).where(Standard.document_id == doc.id)
        )
        std_count = std_count_res.scalar_one()

        # Count chunks
        chunk_count_res = await session.execute(
            select(func.count(DocumentChunk.id)).where(DocumentChunk.document_id == doc.id)
        )
        chunk_count = chunk_count_res.scalar_one()

        return DocumentDetail(
            id=doc.id,
            title=doc.title,
            document_type=doc.document_type,
            source_name=doc.source_name,
            source_url=doc.source_url,
            storage_url=doc.storage_url,
            version=doc.version,
            status=doc.status,
            checksum=doc.checksum,
            publication_date=doc.publication_date.isoformat() if doc.publication_date else None,
            effective_date=doc.effective_date.isoformat() if doc.effective_date else None,
            created_at=doc.created_at.isoformat() if doc.created_at else None,
            standards_count=std_count,
            chunks_count=chunk_count,
        )

    @staticmethod
    async def patch_document(
        session: AsyncSession,
        document_id: uuid.UUID,
        patch_req: DocumentPatchRequest,
    ) -> Optional[DocumentDetail]:
        """Update mutable fields of a document record."""
        doc = await session.get(Document, document_id)
        if not doc:
            return None

        if patch_req.title is not None:
            doc.title = patch_req.title
        if patch_req.status is not None:
            doc.status = patch_req.status
        if patch_req.version is not None:
            doc.version = patch_req.version

        session.add(doc)
        await session.flush()
        return await DocumentService.get_document(session, document_id)

    @staticmethod
    async def supersede_document(
        session: AsyncSession,
        document_id: uuid.UUID,
    ) -> Optional[DocumentDetail]:
        """Mark document and its associated standards as superseded."""
        doc = await session.get(Document, document_id)
        if not doc:
            return None

        doc.status = "superseded"
        session.add(doc)

        # Update standards
        stmt = select(Standard).where(Standard.document_id == doc.id)
        stds = (await session.execute(stmt)).scalars().all()
        for s in stds:
            s.status = "superseded"
            session.add(s)

        await session.flush()
        return await DocumentService.get_document(session, document_id)

    @staticmethod
    async def process_upload(
        session: AsyncSession,
        file: UploadFile,
        force: bool = False,
    ) -> IngestionJobResponse:
        """Handle secure file upload, structural PDF verification, and dispatch ingestion."""
        # 1. Validate file extension and MIME type
        ext = Path(file.filename or "").suffix.lower()
        if ext != ".pdf":
            raise BaseApiException(
                code=ErrorCodes.FILE_INVALID,
                message=f"Only PDF files are supported. Received extension '{ext}'.",
            )

        if file.content_type and file.content_type.lower() not in (
            "application/pdf",
            "application/x-pdf",
            "application/octet-stream",
        ):
            raise BaseApiException(
                code=ErrorCodes.FILE_INVALID,
                message=f"Invalid MIME type '{file.content_type}'. Must be application/pdf.",
            )

        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise BaseApiException(
                code=ErrorCodes.FILE_TOO_LARGE,
                message=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB.",
            )

        # Validate PDF magic bytes header (%PDF-)
        if not content.startswith(b"%PDF-"):
            raise BaseApiException(
                code=ErrorCodes.FILE_INVALID,
                message="File content does not match authentic PDF specification header (%PDF-).",
            )

        # 2. Save file to secure directory with generated UUID to prevent path traversal
        upload_dir = Path(settings.UPLOAD_TEMP_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        safe_filename = f"{uuid.uuid4()}.pdf"
        target_path = upload_dir / safe_filename

        with open(target_path, "wb") as f:
            f.write(content)

        # 3. Structural validation via Phase 2
        val_res = validate_document(str(target_path))
        if not val_res.is_valid:
            if target_path.exists():
                os.remove(target_path)
            raise BaseApiException(
                code=ErrorCodes.FILE_INVALID,
                message=f"Invalid or corrupt PDF document: {'; '.join(val_res.errors)}",
            )

        # 4. Checksum deduplication
        checksum = compute_file_sha256(str(target_path))
        stmt = select(Document).where(Document.checksum == checksum)
        existing_doc = (await session.execute(stmt)).scalar_one_or_none()
        if existing_doc and not force:
            if target_path.exists():
                os.remove(target_path)
            raise ConflictException(
                message=f"Document with identical checksum already ingested (ID: {existing_doc.id}). Use force=true to re-ingest.",
                details={"document_id": str(existing_doc.id), "checksum": checksum},
            )

        # 5. Dispatch background ingestion job
        opts = IngestionOptions(force=force)
        job: IngestionJob = job_manager.submit_job(file_path=str(target_path), options=opts)

        return IngestionJobResponse(
            job_id=job.job_id,
            status=job.status.value,
            progress=job.progress,
            message=job.message,
            started_at=job.started_at,
        )

    @staticmethod
    def get_job_status(job_id: str) -> Optional[IngestionJobResponse]:
        """Fetch real-time ingestion job execution progress."""
        job = job_manager.get_job(job_id)
        if not job:
            return None
        return IngestionJobResponse(
            job_id=job.job_id,
            status=job.status.value,
            progress=job.progress,
            document_id=job.document_id,
            message=job.message,
            started_at=job.started_at,
            completed_at=job.completed_at,
            error=job.error,
        )
