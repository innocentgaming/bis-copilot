# Document Ingestion Pipeline Documentation — BIS Copilot (Phase 2)

## 1. Overview & Pipeline Architecture

**Project**: BIS Copilot — AI-powered Intelligent Assistant for Indian Standards and BIS Services  
**Problem Statement**: SIH 26107  
**Objective**: Transform authoritative PDF source documents into structured, traceable, RAG-ready knowledge with clause-level citations and pgvector embeddings.

The ingestion pipeline preserves an unbroken chain of evidence from raw PDF to retrieval:
```text
SOURCE DOCUMENT (PDF)
      ↓
FILE VALIDATION (Existence, Integrity, Page Count)
      ↓
SHA-256 CHECKSUM (Deduplication / Idempotency)
      ↓
PDF TEXT EXTRACTION (Page-by-Page with PyMuPDF)
      +---- (Low text density heuristic -> OCR Fallback)
      ↓
PAGE-AWARE NORMALIZATION & HEADER/FOOTER STRIPPING
      ↓
METADATA RESOLUTION (CLI Overrides > PDF Metadata > Filename > Text Patterns)
      ↓
STANDARD IDENTIFICATION (IS Number Detection & Scoring)
      ↓
SECTION & CLAUSE PARSING (Hierarchical 5 -> 5.1 -> 5.1.1 & Annexes)
      ↓
CLAUSE-AWARE CHUNKING (Configurable Budget & Overlap + Context Header)
      ↓
VECTOR EMBEDDINGS (Batch Generation, Normalized Unit Vectors)
      ↓
POSTGRESQL TRANSACTIONAL PERSISTENCE
      +---- PostgreSQL FTS (to_tsvector GIN Index)
      +---- pgvector (HNSW Cosine Similarity Index)
      ↓
RAG-READY KNOWLEDGE BASE
```

---

## 2. Ingestion Workflow Diagram

```mermaid
flowchart TD
    A[PDF Document] --> B[File Validation]
    B --> C[SHA-256 Checksum]
    C --> D{Existing Checksum?}

    D -->|Yes & No --force| E[Skip Ingestion (Idempotent)]
    D -->|No or --force| F[PDF Page Extraction]

    F --> G{Text Density Adequate?}
    G -->|No| H[Tesseract OCR Fallback]
    G -->|Yes| I[Normalize Page Text]
    H --> I

    I --> J[Metadata & Standard Number Detection]
    J --> K[Hierarchical Clause & Annex Parser]
    K --> L[Clause-Aware Chunking + Context Prefix]
    L --> M[Embedding Generation (Batch & L2 Norm)]

    M --> N{Dry Run?}
    N -->|Yes| O[Print Preview & Metrics (No DB Changes)]
    N -->|No| P[(PostgreSQL Transaction)]

    P --> Q[Persist Document, Standard, Clauses, Chunks]
    Q --> R[Populate TSVECTOR (GIN Index)]
    Q --> S[Persist Embeddings (HNSW Index)]
```

---

## 3. Directory Layout

The repository uses the following standardized data directory structure:
```text
data/
├── raw/         # User-provided raw BIS PDFs (git-ignored)
├── processed/   # Successfully ingested archives
├── failed/      # Problematic or corrupt PDFs requiring review
└── samples/     # Synthetic non-copyrighted test standards for CI/CD
```

---

## 4. Configuration & Environment Variables

Key parameters are configured in `.env` and loaded via Pydantic Settings in `backend/app/config.py`:

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `INGESTION_DATA_DIR` | `data` | Base directory for document staging |
| `RAW_DOCUMENT_DIR` | `data/raw` | Input directory for batch ingestion |
| `CHUNK_SIZE` | `1200` | Target character budget per chunk |
| `CHUNK_OVERLAP` | `150` | Overlap between consecutive chunks within a clause |
| `EMBEDDING_MODEL` | `BAAI/bge-m3` | Embedding model target |
| `EMBEDDING_DIMENSION` | `1536` | Vector dimensions (must match pgvector schema) |
| `EMBEDDING_BATCH_SIZE`| `32` | Batch size for embedding model inference |
| `OCR_ENABLED` | `true` | Enable OCR fallback when text density is low |
| `OCR_LANGUAGE` | `eng` | Tesseract OCR language |
| `MIN_TEXT_DENSITY` | `0.05` | Character density threshold triggering OCR |

---

## 5. CLI Usage Guide

### 5.1 Single Document Ingestion (`scripts/ingest_document.py`)

#### Basic Dry-Run (Preview only, no DB changes):
```bash
python scripts/ingest_document.py data/samples/sample_standard.pdf --dry-run
```
Output:
```text
=============================================
DOCUMENT INGESTION PREVIEW (DRY RUN)
=============================================
File:       sample_standard.pdf
Pages:      3
Standard:   IS 99999:2025
Extraction: native_pdf
Clauses:    13
Chunks:     13
Embeddings: 13 (computed in-memory)
Duration:   0.12s

Dry run completed: No database changes made.
=============================================
```

#### Persisting to Live PostgreSQL Database:
```bash
python scripts/ingest_document.py data/samples/sample_standard.pdf
```

#### Force Reprocessing:
```bash
python scripts/ingest_document.py data/samples/sample_standard.pdf --force
```

#### Manual Metadata Overrides:
```bash
python scripts/ingest_document.py data/raw/custom_spec.pdf \
  --standard-number "IS 1293:2019" \
  --document-type "standard" \
  --source-name "Bureau of Indian Standards"
```

### 5.2 Directory Ingestion (`scripts/ingest_directory.py`)

Recursively scans directories and ingests all supported PDF files in deterministic alphabetical order:
```bash
python scripts/ingest_directory.py data/raw/
```
Output:
```text
Discovered 20 PDF documents in 'data/raw/'...
[1/20] Processing: IS_1293_2019.pdf (142050 bytes)
   -> SUCCESS (48 chunks, 22 clauses in 0.45s)
...
=============================================
INGESTION SUMMARY
=============================================
Total:      20
Successful: 19
Skipped:     1
Failed:      0
=============================================
```

---

## 6. Structural Parsing Strategy

### 6.1 Clause Hierarchy
The parser extracts multi-level numbering patterns without losing text:
```text
1 Scope
  ├── 1.1 Applicable Products
2 General Requirements
  ├── 2.1 Mechanical Safety
  │     ├── 2.1.1 Impact Resistance
  │     └── 2.1.2 Enclosure Rigidity
  └── 2.2 Thermal Safety
Annex A (Normative)
  └── A.1 Sampling Lot Size
```
Each clause record retains:
- `clause_number` (e.g. `2.1.1`)
- `heading` (e.g. `Impact Resistance`)
- `content` (Full substantive text)
- `page_start`, `page_end` (Human-readable 1-indexed pages)
- `parent_clause_id` (Foreign key pointing to `2.1`)

### 6.2 Clause-Aware Chunking
Chunks strictly preserve clause boundaries and prefix each chunk with full contextual metadata:
```text
Standard: IS 99999:2025
Clause: 4.2
Heading: Temperature Rise Limits

When tested at rated voltage for 5 consecutive toasting cycles,
accessible surface temperatures shall not exceed the following limits...
```

---

## 7. Deduplication & Idempotency

1. Before processing, the pipeline computes the file's **SHA-256** checksum.
2. The pipeline queries `documents.checksum = :checksum`.
3. If a match is found:
   - Without `--force`: The ingestion skips gracefully, returning `is_duplicate=True` and preventing duplicate rows.
   - With `--force`: The existing document's dependent chunks and clauses are reconciled cleanly within an atomic database transaction.

---

## 8. Embedding Provider Architecture

An abstract interface (`EmbeddingProvider`) decouples the pipeline from specific vector models:
1. **`DeterministicEmbeddingProvider`**:
   - Computes deterministic unit-length vectors (L2-normalized) directly from SHA-512 hashes.
   - Matches `EMBEDDING_DIMENSION` (default: 1536) exactly.
   - Enables fast offline CI/CD, dry-run previews, and unit testing with zero weight downloads.
2. **`SentenceTransformerEmbeddingProvider`**:
   - Production provider supporting models such as `BAAI/bge-m3` or `all-MiniLM-L6-v2`.
   - Supports GPU/CPU batching (`EMBEDDING_BATCH_SIZE=32`) and automatic L2 normalization for pgvector cosine distance (`<=>`).

---

## 9. Verification & Testing

Run all Phase 1 regression tests and Phase 2 ingestion tests:
```bash
pytest backend/tests/ -v
```
Result:
- **39 Passed**: Schema integrity, constraints, validation, checksums, PDF extraction, normalization, metadata resolution, clause hierarchies, chunking reconstruction, embeddings, dry-runs, and API health checks.
- **3 Skipped**: Live PostgreSQL/pgvector tests (run automatically when Docker container is started).
