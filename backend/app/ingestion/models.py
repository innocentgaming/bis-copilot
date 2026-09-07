"""Data contracts and schemas for the BIS Copilot document ingestion pipeline."""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class DocumentValidationResult(BaseModel):
    """Result of file validation prior to extraction."""
    valid: bool
    file_path: str
    file_type: str = "pdf"
    file_size_bytes: int = 0
    page_count: int = 0
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class ExtractedPage(BaseModel):
    """Page-level extracted text and layout metadata."""
    page_number: int  # 1-indexed
    text: str
    char_count: int = 0
    width: float = 0.0
    height: float = 0.0
    is_ocr: bool = False
    warnings: List[str] = Field(default_factory=list)


class StandardCandidate(BaseModel):
    """Candidate standard identifier detected from document text."""
    standard_number: str
    confidence: float
    source_page: int
    pattern_matched: str


class ParsedClause(BaseModel):
    """Structured clause or annex extracted from document content."""
    clause_number: str  # e.g. "5", "5.1", "5.1.2", "Annex A", "A.1"
    heading: Optional[str] = None
    content: str
    page_start: int
    page_end: int
    parent_clause_number: Optional[str] = None
    is_annex: bool = False


class DocumentChunkData(BaseModel):
    """Processed text chunk prepared for embedding and PostgreSQL storage."""
    chunk_index: int
    content: str
    page_start: int
    page_end: int
    clause_number: Optional[str] = None
    heading: Optional[str] = None
    standard_number: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    embedding: Optional[List[float]] = None


class IngestionQualityMetrics(BaseModel):
    """Operational and data quality metrics gathered during ingestion."""
    page_count: int = 0
    characters_extracted: int = 0
    average_chars_per_page: float = 0.0
    empty_pages: int = 0
    ocr_pages: int = 0
    clauses_detected: int = 0
    chunks_generated: int = 0
    duration_seconds: float = 0.0


class IngestionOptions(BaseModel):
    """Runtime options controlling ingestion behavior."""
    force: bool = False
    dry_run: bool = False
    ocr_enabled: bool = True
    embedding_batch_size: int = 32
    # Manual CLI overrides
    standard_number_override: Optional[str] = None
    document_type_override: Optional[str] = None
    source_name_override: Optional[str] = None
    source_url_override: Optional[str] = None


class IngestionResult(BaseModel):
    """Final result returned by the document ingestion pipeline."""
    success: bool
    file_path: str
    document_id: Optional[str] = None
    standard_id: Optional[str] = None
    standard_number: Optional[str] = None
    pages: int = 0
    clauses: int = 0
    chunks: int = 0
    embedding_count: int = 0
    extraction_method: str = "native_pdf"
    duration_seconds: float = 0.0
    metrics: Optional[IngestionQualityMetrics] = None
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    is_duplicate: bool = False
