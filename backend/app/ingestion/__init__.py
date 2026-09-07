"""BIS Copilot Document Ingestion Package."""

from backend.app.ingestion.models import (
    DocumentValidationResult,
    ExtractedPage,
    StandardCandidate,
    ParsedClause,
    DocumentChunkData,
    IngestionOptions,
    IngestionResult,
    IngestionQualityMetrics,
)
from backend.app.ingestion.exceptions import (
    IngestionError,
    FileValidationError,
    PDFExtractionError,
    OCRExtractionError,
    MetadataParsingError,
    ClauseParsingError,
    EmbeddingError,
    DatabasePersistenceError,
)
from backend.app.ingestion.discovery import discover_documents
from backend.app.ingestion.validation import validate_document
from backend.app.ingestion.checksum import compute_file_sha256, compute_text_sha256
from backend.app.ingestion.pdf_extractor import extract_pdf_pages, normalize_extracted_text
from backend.app.ingestion.metadata import extract_document_metadata
from backend.app.ingestion.standard_parser import detect_standard_candidates, resolve_primary_standard
from backend.app.ingestion.clause_parser import parse_clauses_from_pages, get_parent_clause_number
from backend.app.ingestion.chunker import chunk_parsed_clauses
from backend.app.ingestion.embeddings import (
    EmbeddingProvider,
    DeterministicEmbeddingProvider,
    SentenceTransformerEmbeddingProvider,
    get_embedding_provider,
)
from backend.app.ingestion.persistence import check_existing_document, persist_ingested_document
from backend.app.ingestion.pipeline import DocumentIngestionPipeline

__all__ = [
    "DocumentValidationResult",
    "ExtractedPage",
    "StandardCandidate",
    "ParsedClause",
    "DocumentChunkData",
    "IngestionOptions",
    "IngestionResult",
    "IngestionQualityMetrics",
    "IngestionError",
    "FileValidationError",
    "PDFExtractionError",
    "OCRExtractionError",
    "MetadataParsingError",
    "ClauseParsingError",
    "EmbeddingError",
    "DatabasePersistenceError",
    "discover_documents",
    "validate_document",
    "compute_file_sha256",
    "compute_text_sha256",
    "extract_pdf_pages",
    "normalize_extracted_text",
    "extract_document_metadata",
    "detect_standard_candidates",
    "resolve_primary_standard",
    "parse_clauses_from_pages",
    "get_parent_clause_number",
    "chunk_parsed_clauses",
    "EmbeddingProvider",
    "DeterministicEmbeddingProvider",
    "SentenceTransformerEmbeddingProvider",
    "get_embedding_provider",
    "check_existing_document",
    "persist_ingested_document",
    "DocumentIngestionPipeline",
]
