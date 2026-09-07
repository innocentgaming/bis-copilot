"""Exception hierarchy for the BIS Copilot document ingestion pipeline."""


class IngestionError(Exception):
    """Base exception for all document ingestion pipeline errors."""

    def __init__(self, message: str, stage: str = "unknown", file_path: str = ""):
        super().__init__(message)
        self.message = message
        self.stage = stage
        self.file_path = file_path

    def __str__(self) -> str:
        prefix = f"[{self.stage.upper()}] " if self.stage != "unknown" else ""
        file_info = f" (file: {self.file_path})" if self.file_path else ""
        return f"{prefix}{self.message}{file_info}"


class FileValidationError(IngestionError):
    """Raised when an input document fails basic existence, format, or readability checks."""

    def __init__(self, message: str, file_path: str = ""):
        super().__init__(message, stage="validation", file_path=file_path)


class PDFExtractionError(IngestionError):
    """Raised when text cannot be extracted from a PDF document."""

    def __init__(self, message: str, file_path: str = ""):
        super().__init__(message, stage="pdf_extraction", file_path=file_path)


class OCRExtractionError(IngestionError):
    """Raised when OCR fallback processing fails."""

    def __init__(self, message: str, file_path: str = ""):
        super().__init__(message, stage="ocr", file_path=file_path)


class MetadataParsingError(IngestionError):
    """Raised when standard or document metadata cannot be resolved."""

    def __init__(self, message: str, file_path: str = ""):
        super().__init__(message, stage="metadata_parsing", file_path=file_path)


class ClauseParsingError(IngestionError):
    """Raised when structural clause detection or hierarchy building fails."""

    def __init__(self, message: str, file_path: str = ""):
        super().__init__(message, stage="clause_parsing", file_path=file_path)


class EmbeddingError(IngestionError):
    """Raised when embedding generation fails."""

    def __init__(self, message: str, file_path: str = ""):
        super().__init__(message, stage="embedding", file_path=file_path)


class DatabasePersistenceError(IngestionError):
    """Raised when saving entities, chunks, or vectors to PostgreSQL fails."""

    def __init__(self, message: str, file_path: str = ""):
        super().__init__(message, stage="persistence", file_path=file_path)
