"""Cryptographic checksum utilities for deduplication and content hashing."""

import hashlib
from typing import Optional


def compute_file_sha256(file_path: str, chunk_size: int = 65536) -> str:
    """Calculate SHA-256 hexadecimal digest of a file in streaming chunks.

    Args:
        file_path: Path to the target file.
        chunk_size: Block size in bytes for reading (default: 64KB).

    Returns:
        64-character lowercase hexadecimal SHA-256 hash.
    """
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while True:
            data = f.read(chunk_size)
            if not data:
                break
            hasher.update(data)
    return hasher.hexdigest()


def compute_text_sha256(text: str) -> str:
    """Calculate SHA-256 digest of normalized text content.

    Args:
        text: Input string.

    Returns:
        64-character lowercase hexadecimal hash.
    """
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
