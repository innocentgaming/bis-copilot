"""Schemas for document management and ingestion jobs."""

import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class DocumentSummary(BaseModel):
    id: uuid.UUID
    title: str
    document_type: str
    source_name: str
    version: str
    status: str
    publication_date: Optional[str] = None
    created_at: Optional[str] = None


class DocumentDetail(DocumentSummary):
    source_url: Optional[str] = None
    storage_url: Optional[str] = None
    effective_date: Optional[str] = None
    checksum: Optional[str] = None
    standards_count: int = 0
    chunks_count: int = 0


class DocumentPatchRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive|superseded|draft)$")
    version: Optional[str] = None


class IngestionJobResponse(BaseModel):
    job_id: str
    status: str  # queued, processing, completed, failed, cancelled
    progress: int = 0  # 0 - 100
    document_id: Optional[uuid.UUID] = None
    message: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error: Optional[str] = None


class DocumentIngestDirectoryRequest(BaseModel):
    directory_path: str = Field(..., description="Server filesystem directory to scan and ingest")
    recursive: bool = True
    force: bool = False
