"""Tests for document management and ingestion endpoints (Admin only)."""

import io
import uuid
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import get_db_session, require_admin
from backend.app.api.schemas.documents import (
    DocumentDetail,
    DocumentSummary,
    IngestionJobResponse,
)
from backend.app.main import app
from backend.app.models.user import User


@pytest.mark.asyncio
async def test_document_ingest_admin_success(mock_session, admin_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_admin] = lambda: admin_user

    job_resp = IngestionJobResponse(
        job_id="test-job-uuid-1234",
        status="processing",
        progress=10,
        message="Validating document and extracting pages",
    )

    with patch("backend.app.services.document_service.DocumentService.process_upload", return_value=job_resp):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            files = {"file": ("standard.pdf", io.BytesIO(b"%PDF-1.4 test content"), "application/pdf")}
            res = await ac.post("/api/v1/documents/ingest", files=files, data={"force": "true"})
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert data["data"]["job_id"] == "test-job-uuid-1234"
            assert data["data"]["status"] == "processing"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_document_ingest_non_admin_forbidden(mock_session, standard_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        files = {"file": ("standard.pdf", io.BytesIO(b"%PDF-1.4 test"), "application/pdf")}
        # Without admin token, require_admin fails
        res = await ac.post("/api/v1/documents/ingest", files=files)
        assert res.status_code in (401, 403)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_document_job_status_poll(mock_session, admin_user):
    app.dependency_overrides[get_db_session] = lambda: mock_session
    app.dependency_overrides[require_admin] = lambda: admin_user

    job_resp = IngestionJobResponse(
        job_id="test-job-uuid-1234",
        status="completed",
        progress=100,
        message="Ingestion completed successfully",
    )

    with patch("backend.app.services.document_service.DocumentService.get_job_status", return_value=job_resp):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            res = await ac.get("/api/v1/documents/jobs/test-job-uuid-1234")
            assert res.status_code == 200
            data = res.json()
            assert data["data"]["status"] == "completed"
            assert data["data"]["progress"] == 100

    app.dependency_overrides.clear()
