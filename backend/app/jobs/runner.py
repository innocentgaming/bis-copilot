"""In-process asynchronous job runner for document ingestion workflows."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Optional
import uuid

from backend.app.ingestion.models import IngestionOptions, IngestionResult
from backend.app.ingestion.pipeline import DocumentIngestionPipeline
from backend.app.jobs.models import IngestionJob, JobStatus

_executor = ThreadPoolExecutor(max_workers=4)


class JobManager:
    """Manages tracking, lifecycle, and background execution of ingestion jobs."""

    def __init__(self):
        self._jobs: Dict[str, IngestionJob] = {}

    def get_job(self, job_id: str) -> Optional[IngestionJob]:
        return self._jobs.get(job_id)

    def list_jobs(self) -> List[IngestionJob]:
        return list(self._jobs.values())

    def create_job(self, file_path: str) -> IngestionJob:
        job = IngestionJob(
            job_id=str(uuid.uuid4()),
            file_path=file_path,
            status=JobStatus.QUEUED,
            progress=0,
            message="Document ingestion queued",
        )
        self._jobs[job.job_id] = job
        return job

    def run_sync_ingest(self, job_id: str, file_path: str, options: IngestionOptions) -> None:
        """Executed in background worker thread to prevent event loop blocking."""
        job = self.get_job(job_id)
        if not job:
            return

        job.start("Validating document and extracting pages")
        try:
            pipeline = DocumentIngestionPipeline()
            job.update_progress(30, "Parsing clauses and chunking text")
            result: IngestionResult = pipeline.ingest_file(file_path=file_path, options=options)

            if result.success:
                job.complete(
                    document_id=result.document_id,
                    message=f"Ingestion successful: {result.total_clauses} clauses, {result.total_chunks} chunks.",
                )
            else:
                err_msg = "; ".join(result.errors) if result.errors else "Ingestion failed"
                job.fail(err_msg)
        except Exception as exc:
            job.fail(str(exc))

    def submit_job(self, file_path: str, options: Optional[IngestionOptions] = None) -> IngestionJob:
        """Queue and dispatch ingestion job."""
        opts = options or IngestionOptions()
        job = self.create_job(file_path)
        loop = asyncio.get_event_loop()
        loop.run_in_executor(_executor, self.run_sync_ingest, job.job_id, file_path, opts)
        return job


job_manager = JobManager()
