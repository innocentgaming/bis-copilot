"""Document management, ingestion, and job tracking routes (Admin only)."""

from typing import Optional
import uuid
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    get_db_session,
    get_pagination,
    get_request_id,
    require_admin,
)
from backend.app.api.errors import BaseApiException, ErrorCodes, NotFoundException
from backend.app.api.schemas.common import (
    PaginatedResponse,
    PaginationParams,
    ResponseEnvelope,
    ResponseMeta,
)
from backend.app.api.schemas.documents import (
    DocumentDetail,
    DocumentIngestDirectoryRequest,
    DocumentPatchRequest,
    DocumentSummary,
    IngestionJobResponse,
)
from backend.app.models.user import User
from backend.app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents (Admin)"])


@router.post(
    "/ingest",
    response_model=ResponseEnvelope[IngestionJobResponse],
    summary="Upload and ingest a new PDF standard (Admin only)",
)
async def ingest_document(
    file: UploadFile = File(..., description="PDF document file to ingest"),
    force: bool = Form(False, description="Force re-ingestion if checksum exists"),
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Upload a PDF, perform security validation, and dispatch background ingestion job."""
    job_resp = await DocumentService.process_upload(session=session, file=file, force=force)
    return ResponseEnvelope(
        success=True,
        data=job_resp,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/jobs/{job_id}",
    response_model=ResponseEnvelope[IngestionJobResponse],
    summary="Check status and progress of an ingestion job (Admin only)",
)
async def get_job_status(
    job_id: str,
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Poll progress (0-100%) and terminal state of an ingestion job."""
    job_resp = DocumentService.get_job_status(job_id)
    if not job_resp:
        raise NotFoundException("Ingestion Job", job_id)

    return ResponseEnvelope(
        success=True,
        data=job_resp,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "",
    response_model=ResponseEnvelope[PaginatedResponse[DocumentSummary]],
    summary="List ingested documents (Admin only)",
)
async def list_documents(
    document_type: Optional[str] = Query(None, description="Filter by document type"),
    status: Optional[str] = Query(None, description="Filter by status ('active', etc.)"),
    pagination: PaginationParams = Depends(get_pagination),
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Retrieve paginated collection of all ingested source documents."""
    items, total = await DocumentService.list_documents(
        session=session,
        document_type=document_type,
        status_filter=status,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    paginated = PaginatedResponse(
        items=items,
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
        has_more=(pagination.offset + len(items)) < total,
    )
    return ResponseEnvelope(
        success=True,
        data=paginated,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{document_id}",
    response_model=ResponseEnvelope[DocumentDetail],
    summary="Get document details and entity counts (Admin only)",
)
async def get_document(
    document_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Fetch complete metadata for a document."""
    doc = await DocumentService.get_document(session, document_id)
    if not doc:
        raise NotFoundException("Document", document_id)

    return ResponseEnvelope(
        success=True,
        data=doc,
        meta=ResponseMeta(request_id=req_id),
    )


@router.patch(
    "/{document_id}",
    response_model=ResponseEnvelope[DocumentDetail],
    summary="Update mutable document metadata (Admin only)",
)
async def patch_document(
    document_id: uuid.UUID,
    patch_req: DocumentPatchRequest,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Modify document title, version, or active status."""
    doc = await DocumentService.patch_document(session, document_id, patch_req)
    if not doc:
        raise NotFoundException("Document", document_id)

    return ResponseEnvelope(
        success=True,
        data=doc,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/{document_id}/supersede",
    response_model=ResponseEnvelope[DocumentDetail],
    summary="Mark document and standards as superseded (Admin only)",
)
async def supersede_document(
    document_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Transition document and linked standards to superseded status."""
    doc = await DocumentService.supersede_document(session, document_id)
    if not doc:
        raise NotFoundException("Document", document_id)

    return ResponseEnvelope(
        success=True,
        data=doc,
        meta=ResponseMeta(request_id=req_id),
    )
