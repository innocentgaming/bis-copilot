"""Tests for checksum calculation and deduplication hashing."""

import os
import tempfile
from backend.app.ingestion.checksum import compute_file_sha256, compute_text_sha256


def test_file_checksum_consistency():
    """Verify compute_file_sha256 produces identical hash for identical bytes."""
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"Bureau of Indian Standards Test Data")
        path1 = tf.name

    with tempfile.NamedTemporaryFile(delete=False) as tf2:
        tf2.write(b"Bureau of Indian Standards Test Data")
        path2 = tf2.name

    try:
        hash1 = compute_file_sha256(path1)
        hash2 = compute_file_sha256(path2)
        assert hash1 == hash2
        assert len(hash1) == 64
    finally:
        if os.path.exists(path1):
            os.remove(path1)
        if os.path.exists(path2):
            os.remove(path2)


def test_file_checksum_differs_on_modification():
    """Verify changing a single byte alters the checksum."""
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"Initial Content")
        path = tf.name

    try:
        hash_initial = compute_file_sha256(path)
        with open(path, "wb") as f:
            f.write(b"Initial Content Modified")
        hash_modified = compute_file_sha256(path)
        assert hash_initial != hash_modified
    finally:
        if os.path.exists(path):
            os.remove(path)


def test_text_checksum():
    """Verify text hash generation."""
    t1 = "IS 1293:2019 Clause 5.1"
    t2 = "IS 1293:2019 Clause 5.1"
    t3 = "IS 1293:2019 Clause 5.2"

    assert compute_text_sha256(t1) == compute_text_sha256(t2)
    assert compute_text_sha256(t1) != compute_text_sha256(t3)
