"""Single document ingestion CLI script for BIS Copilot.

Usage:
    python scripts/ingest_document.py path/to/document.pdf [--force] [--dry-run] [--verbose]
"""

import os
import sys
import argparse

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.ingestion.pipeline import DocumentIngestionPipeline
from backend.app.ingestion.models import IngestionOptions


def print_dry_run_preview(result):
    """Print formatted dry-run preview summary."""
    print("\n" + "=" * 45)
    print("DOCUMENT INGESTION PREVIEW (DRY RUN)")
    print("=" * 45)
    print(f"File:       {os.path.basename(result.file_path)}")
    print(f"Pages:      {result.pages}")
    print(f"Standard:   {result.standard_number or 'Not detected'}")
    print(f"Extraction: {result.extraction_method}")
    print(f"Clauses:    {result.clauses}")
    print(f"Chunks:     {result.chunks}")
    print(f"Embeddings: {result.embedding_count} (computed in-memory)")
    print(f"Duration:   {result.duration_seconds:.2f}s")
    if result.warnings:
        print("\nWarnings:")
        for w in result.warnings:
            print(f"  - {w}")
    print("\nDry run completed: No database changes made.")
    print("=" * 45 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Ingest a single BIS source document into PostgreSQL")
    parser.add_argument("file_path", help="Path to the source PDF document")
    parser.add_argument("--force", action="store_true", help="Force reprocessing even if checksum matches")
    parser.add_argument("--dry-run", action="store_true", help="Extract and chunk without persisting to database")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose debug logging")
    parser.add_argument("--standard-number", help="Manual override for Indian Standard number (e.g. 'IS 1293:2019')")
    parser.add_argument("--document-type", help="Manual override for document type (e.g. 'standard', 'guideline')")
    parser.add_argument("--source-name", help="Manual override for source name")
    parser.add_argument("--source-url", help="Manual override for source URL")

    args = parser.parse_args()

    options = IngestionOptions(
        force=args.force,
        dry_run=args.dry_run,
        standard_number_override=args.standard_number,
        document_type_override=args.document_type,
        source_name_override=args.source_name,
        source_url_override=args.source_url,
    )

    pipeline = DocumentIngestionPipeline(verbose=args.verbose)
    result = pipeline.ingest_file(args.file_path, options=options)

    if args.dry_run and result.success:
        print_dry_run_preview(result)
        sys.exit(0)

    if result.success:
        print("\n" + "=" * 45)
        print("DOCUMENT INGESTION SUCCESSFUL")
        print("=" * 45)
        print(f"File:        {os.path.basename(result.file_path)}")
        print(f"Document ID: {result.document_id}")
        print(f"Standard ID: {result.standard_id or 'None'}")
        print(f"Standard:    {result.standard_number or 'Unknown'}")
        print(f"Clauses:     {result.clauses}")
        print(f"Chunks:      {result.chunks}")
        print(f"Duration:    {result.duration_seconds:.2f}s")
        if result.is_duplicate:
            print("Status:      Skipped (Duplicate checksum)")
        print("=" * 45 + "\n")
        sys.exit(0)
    else:
        print("\n" + "=" * 45)
        print("DOCUMENT INGESTION FAILED")
        print("=" * 45)
        print(f"File:   {args.file_path}")
        print("Errors:")
        for err in result.errors:
            print(f"  - {err}")
        print("=" * 45 + "\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
