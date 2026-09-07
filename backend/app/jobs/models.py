"""Models representing background ingestion tasks."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
import uuid
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class IngestionJob(BaseModel):
    """Tracks state and progress of an asynchronous document ingestion workflow."""
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: Optional[uuid.UUID] = None
    file_path: Optional[str] = None
    status: JobStatus = JobStatus.QUEUED
    progress: int = 0  # 0 to 100 percentage
    message: str = "Job queued"
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error: Optional[str] = None

    def start(self, message: str = "Processing started"):
        self.status = JobStatus.PROCESSING
        self.started_at = datetime.now(timezone.utc).isoformat()
        self.message = message
        self.progress = 10

    def update_progress(self, progress: int, message: str):
        self.progress = max(0, min(100, progress))
        self.message = message

    def complete(self, document_id: Optional[uuid.UUID] = None, message: str = "Ingestion completed successfully"):
        self.status = JobStatus.COMPLETED
        self.progress = 100
        self.message = message
        if document_id:
            self.document_id = document_id
        self.completed_at = datetime.now(timezone.utc).isoformat()

    def fail(self, error: str):
        self.status = JobStatus.FAILED
        self.error = error
        self.message = f"Failed: {error}"
        self.completed_at = datetime.now(timezone.utc).isoformat()
