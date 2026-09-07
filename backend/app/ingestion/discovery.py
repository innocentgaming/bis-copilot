"""Directory scanner for discovering ingestible documents."""

import os
from typing import List, Dict, Set, Optional
from pydantic import BaseModel

SUPPORTED_EXTENSIONS: Set[str] = {".pdf"}


class DiscoveredFile(BaseModel):
    """Metadata describing a file discovered during directory scanning."""
    path: str
    filename: str
    extension: str
    size_bytes: int


def discover_documents(
    directory_path: str,
    supported_extensions: Optional[Set[str]] = None,
) -> List[DiscoveredFile]:
    """Recursively scan directory for supported documents with deterministic sorting.

    Args:
        directory_path: Directory path to scan recursively.
        supported_extensions: Optional set of allowed extensions (defaults to {'.pdf'}).

    Returns:
        List of DiscoveredFile objects sorted deterministically by path.
    """
    if supported_extensions is None:
        supported_extensions = SUPPORTED_EXTENSIONS

    if not os.path.exists(directory_path):
        return []

    discovered: List[DiscoveredFile] = []

    for root, _, files in os.walk(directory_path):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in supported_extensions:
                full_path = os.path.normpath(os.path.join(root, file))
                try:
                    size = os.path.getsize(full_path)
                except OSError:
                    size = 0
                discovered.append(
                    DiscoveredFile(
                        path=full_path,
                        filename=file,
                        extension=ext,
                        size_bytes=size,
                    )
                )

    # Sort deterministically by path
    discovered.sort(key=lambda f: f.path.lower())
    return discovered
