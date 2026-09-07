"""Tests for document file validation routines."""

import os
import tempfile
import pytest

from backend.app.ingestion.validation import validate_document
from scripts.generate_sample_pdf import generate_sample_standard_pdf


@pytest.fixture(scope="module")
def sample_pdf_path():
    path = "data/samples/sample_standard.pdf"
    if not os.path.exists(path):
        generate_sample_standard_pdf(path)
    return path


def test_validation_success_on_valid_pdf(sample_pdf_path):
    """Verify validation passes for an authentic non-corrupt multi-page PDF."""
    res = validate_document(sample_pdf_path)
    assert res.valid is True
    assert res.page_count == 3
    assert res.file_size_bytes > 0
    assert len(res.errors) == 0


def test_validation_fails_non_existent_file():
    """Verify validation fails when target file does not exist."""
    res = validate_document("non_existent_file_12345.pdf")
    assert res.valid is False
    assert any("does not exist" in e for e in res.errors)


def test_validation_fails_unsupported_extension():
    """Verify validation rejects unsupported file extensions."""
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tf:
        tf.write(b"Dummy docx content")
        tf_path = tf.name

    try:
        res = validate_document(tf_path)
        assert res.valid is False
        assert any("Unsupported file format" in e for e in res.errors)
    finally:
        if os.path.exists(tf_path):
            os.remove(tf_path)


def test_validation_fails_empty_file():
    """Verify validation rejects 0-byte files."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
        tf_path = tf.name

    try:
        res = validate_document(tf_path)
        assert res.valid is False
        assert any("empty" in e.lower() for e in res.errors)
    finally:
        if os.path.exists(tf_path):
            os.remove(tf_path)


def test_validation_fails_corrupt_pdf():
    """Verify validation fails when file has PDF extension but invalid header bytes."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
        tf.write(b"GARBAGE NON-PDF BINARY DATA 1234567890")
        tf_path = tf.name

    try:
        res = validate_document(tf_path)
        assert res.valid is False
        assert any("corrupt" in e.lower() or "unreadable" in e.lower() for e in res.errors)
    finally:
        if os.path.exists(tf_path):
            os.remove(tf_path)
