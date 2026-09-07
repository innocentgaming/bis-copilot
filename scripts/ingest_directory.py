"""Directory-level document ingestion CLI script for batch processing."""

import os
import sys
import argparse
from typing import List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.ingestion.discovery import discover_documents
from backend.app.ingestion.pipeline import DocumentIngestionPipeline
from backend.app.ingestion.models import IngestionOptions, IngestionResult


def main():
    parser = argparse.ArgumentParser(description="Batch ingest documents from a directory into PostgreSQL")
    parser.add_argument("directory_path", help="Path to directory containing PDF source documents")
    parser.add_argument("--force", action="store_true", help="Force reprocessing of existing documents")
    parser.add_argument("--dry-run", action="store_true", help="Perform extraction and chunking without persisting to database")
    parser.add_argument("--continue-on-error", action="store_true", default=True, help="Continue batch after individual document failure")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose debug logging")

    args = parser.parse_args()

    if not os.path.exists(args.directory_path):
        print(f"Error: Directory '{args.directory_path}' does not exist.")
        sys.exit(1)

    discovered_files = discover_documents(args.directory_path)
    if not discovered_files:
        print(f"No supported PDF documents found in '{args.directory_path}'.")
        sys.exit(0)

    print(f"Discovered {len(discovered_files)} PDF documents in '{args.directory_path}'...\n")

    pipeline = DocumentIngestionPipeline(verbose=args.verbose)
    options = IngestionOptions(
        force=args.force,
        dry_run=args.dry_run,
    )

    results: List[IngestionResult] = []
    successful = 0
    skipped = 0
    failed = 0

    for idx, file_info in enumerate(discovered_files, 1):
        print(f"[{idx}/{len(discovered_files)}] Processing: {file_info.filename} ({file_info.size_bytes} bytes)")
        try:
            result = pipeline.ingest_file(file_info.path, options=options)
            results.append(result)

            if result.success:
                if result.is_duplicate:
                    skipped += 1
                    print("   -> SKIPPED (Duplicate checksum)")
                else:
                    successful += 1
                    print(f"   -> SUCCESS ({result.chunks} chunks, {result.clauses} clauses in {result.duration_seconds:.2f}s)")
            else:
                failed += 1
                print(f"   -> FAILED: {result.errors}")
                if not args.continue_on_error:
                    print("Terminating batch due to error.")
                    break
        except Exception as exc:
            failed += 1
            print(f"   -> UNEXPECTED FAILURE: {exc}")
            if not args.continue_on_error:
                break

    print("\n" + "=" * 45)
    print("INGESTION SUMMARY")
    print("=" * 45)
    print(f"Total:      {len(discovered_files)}")
    print(f"Successful: {successful}")
    print(f"Skipped:    {skipped}")
    print(f"Failed:     {failed}")
    print("\nDocuments:")
    print(f"  {successful} completed")
    print(f"  {skipped} duplicates/skipped")
    print(f"  {failed} failed")
    print("=" * 45 + "\n")

    sys.exit(1 if failed > 0 else 0)


if __name__ == "__main__":
    main()
