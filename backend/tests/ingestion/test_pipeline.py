"""End-to-end integration tests for DocumentIngestionPipeline."""

import os
import pytest

from backend.app.ingestion.pipeline import DocumentIngestionPipeline
from backend.app.ingestion.models import IngestionOptions
from scripts.generate_sample_pdf import generate_sample_standard_pdf


@pytest.fixture(scope="module")
def sample_pdf():
    path = "data/samples/sample_standard.pdf"
    if not os.path.exists(path):
        generate_sample_standard_pdf(path)
    return path


def test_pipeline_dry_run(sample_pdf):
    """Verify complete pipeline dry-run executes all stages in-memory without error."""
    pipeline = DocumentIngestionPipeline(verbose=False)
    options = IngestionOptions(dry_run=True)

    result = pipeline.ingest_file(sample_pdf, options=options)

    assert result.success is True
    assert result.pages == 3
    assert result.standard_number == "IS 99999:2025"
    assert result.clauses > 0
    assert result.chunks > 0
    assert result.embedding_count == result.chunks
    assert result.metrics is not None
    assert result.metrics.characters_extracted > 200
    assert result.duration_seconds > 0


def test_pipeline_fails_on_missing_file():
    """Verify pipeline returns structured failure on missing file."""
    pipeline = DocumentIngestionPipeline()
    result = pipeline.ingest_file("does_not_exist_file.pdf")

    assert result.success is False
    assert len(result.errors) > 0
    assert any("does not exist" in e for e in result.errors)
