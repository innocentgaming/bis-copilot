"""File validation routines for input documents."""

import os
from backend.app.ingestion.models import DocumentValidationResult

SUPPORTED_EXTENSIONS = {".pdf"}


def validate_document(file_path: str) -> DocumentValidationResult:
    """Validate document existence, file format, readability, and basic PDF integrity.

    Args:
        file_path: Path to document file to validate.

    Returns:
        DocumentValidationResult with detailed validation status, page count, and warnings/errors.
    """
    errors = []
    warnings = []
    page_count = 0
    file_size = 0

    # 1. Existence check
    if not os.path.exists(file_path):
        return DocumentValidationResult(
            valid=False,
            file_path=file_path,
            errors=["File does not exist."],
        )

    # 2. File type and readability check
    if not os.path.isfile(file_path):
        return DocumentValidationResult(
            valid=False,
            file_path=file_path,
            errors=["Path is not a regular file."],
        )

    ext = os.path.splitext(file_path)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return DocumentValidationResult(
            valid=False,
            file_path=file_path,
            file_type=ext.lstrip("."),
            errors=[f"Unsupported file format '{ext}'. Supported formats: {list(SUPPORTED_EXTENSIONS)}"],
        )

    try:
        file_size = os.path.getsize(file_path)
    except OSError as exc:
        return DocumentValidationResult(
            valid=False,
            file_path=file_path,
            errors=[f"Could not read file size: {exc}"],
        )

    if file_size == 0:
        return DocumentValidationResult(
            valid=False,
            file_path=file_path,
            file_size_bytes=0,
            errors=["File is empty (0 bytes)."],
        )

    # 3. PDF Structure validation using PyMuPDF / pypdf
    try:
        import pymupdf as fitz
        doc = fitz.open(file_path)
        page_count = len(doc)
        if doc.is_encrypted:
            errors.append("PDF is encrypted / password protected.")
        if page_count == 0:
            errors.append("PDF contains 0 pages.")
        doc.close()
    except Exception as exc:
        # Fallback to pypdf check if fitz has an issue
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            page_count = len(reader.pages)
            if reader.is_encrypted:
                errors.append("PDF is encrypted / password protected.")
            if page_count == 0:
                errors.append("PDF contains 0 pages.")
        except Exception as inner_exc:
            errors.append(f"Corrupt or unreadable PDF: {inner_exc}")

    is_valid = len(errors) == 0
    return DocumentValidationResult(
        valid=is_valid,
        file_path=file_path,
        file_type="pdf",
        file_size_bytes=file_size,
        page_count=page_count,
        errors=errors,
        warnings=warnings,
    )
