"""CLI tool for executing and testing BIS Copilot RAG queries."""

import argparse
import asyncio
import json
import os
import sys
import uuid
from typing import Any, Dict, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.config import get_settings
from backend.app.database.session import AsyncSessionLocal
from backend.app.ingestion.embeddings import DeterministicEmbeddingProvider, get_embedding_provider
from backend.app.retrieval.models import (
    RetrievalMethod,
    RetrievalRequest,
    RetrievalResponse,
    RetrievalStatus,
)
from backend.app.retrieval.reranker import NoOpReranker, get_reranker
from backend.app.retrieval.service import RetrievalService

settings = get_settings()


def print_response(response: RetrievalResponse, debug: bool = False) -> None:
    """Print formatted retrieval results to the terminal."""
    print("\n" + "=" * 70)
    print("BIS COPILOT — RETRIEVAL RESULTS")
    print("=" * 70)
    print(f"Query:            {response.query}")
    print(f"Normalized:       {response.normalized_query}")
    print(f"Method:           {response.retrieval_method}")
    print(f"Status:           {response.status.value}")
    print(f"Total Candidates: {response.total_candidates}")
    print(f"Results Returned: {len(response.results)}")
    print(f"Execution Time:   {response.duration_ms:.2f} ms")

    if response.warnings:
        print("\nWarnings:")
        for w in response.warnings:
            print(f"  [!] {w}")

    if debug and response.debug_info:
        print("\nDebug Breakdown:")
        print(json.dumps(response.debug_info, indent=2))

    print("\n" + "-" * 70)
    if not response.results:
        print("No matching document chunks found.")
        print("=" * 70 + "\n")
        return

    for rank, (result, citation) in enumerate(zip(response.results, response.citations), start=1):
        print(f"\n[Rank {rank}] — Score: {result.score:.4f} (Vector: {result.vector_score}, Keyword: {result.keyword_score}, Rerank: {result.rerank_score})")
        print(f"Citation:  {citation.citation_text}")
        if result.standard_number:
            print(f"Standard:  {result.standard_number}")
        if result.clause_number:
            print(f"Clause:    {result.clause_number} {f'({result.heading})' if result.heading else ''}")
        if result.page_start:
            pages = f"{result.page_start}–{result.page_end}" if result.page_end and result.page_end != result.page_start else f"{result.page_start}"
            print(f"Pages:     {pages}")
        print(f"Chunk ID:  {result.chunk_id}")
        print("Content:")
        # Indent content preview
        lines = result.content.strip().split("\n")
        preview = "\n".join(f"    {line}" for line in lines[:8])
        if len(lines) > 8:
            preview += "\n    ..."
        print(preview)
        print("-" * 70)

    print("=" * 70 + "\n")


async def execute_dry_run(request: RetrievalRequest) -> RetrievalResponse:
    """Execute a simulated retrieval using sample synthetic BIS chunks when DB is offline."""
    from backend.app.retrieval.diversification import Diversifier
    from backend.app.retrieval.evidence import EvidencePackager
    from backend.app.retrieval.hybrid import HybridFusion
    from backend.app.retrieval.query import QueryNormalizer
    from backend.app.retrieval.citations import CitationBuilder

    norm_q = QueryNormalizer.validate(request.query)
    intent, entities = QueryNormalizer.classify_intent(norm_q)

    # Synthetic sample chunks matching data/samples/sample_standard.pdf
    cid1 = uuid.UUID("11111111-1111-1111-1111-111111111111")
    cid2 = uuid.UUID("22222222-2222-2222-2222-222222222222")
    cid3 = uuid.UUID("33333333-3333-3333-3333-333333333333")

    mock_chunks = [
        {
            "chunk_id": cid1,
            "content": "5.1 Materials — High-grade carbon steel compliant with Grade A specifications. Tensile strength >= 450 MPa.",
            "chunk_index": 0,
            "vector_score": 0.94,
            "keyword_score": 0.91,
            "score": 0.93,
            "standard_number": "IS 99999:2025",
            "clause_number": "5.1",
            "heading": "Materials and Construction",
            "page_start": 4,
            "page_end": 5,
        },
        {
            "chunk_id": cid2,
            "content": "5.2 Mechanical Performance — Breaking load shall be tested at 25°C under constant 50 mm/min elongation.",
            "chunk_index": 1,
            "vector_score": 0.89,
            "keyword_score": 0.95,
            "score": 0.91,
            "standard_number": "IS 99999:2025",
            "clause_number": "5.2",
            "heading": "Mechanical Performance Requirements",
            "page_start": 5,
            "page_end": 6,
        },
        {
            "chunk_id": cid3,
            "content": "Annex A (Normative) — Sampling and Inspection Criteria for Lot Acceptance. Sample size 5 units per 1000.",
            "chunk_index": 2,
            "vector_score": 0.82,
            "keyword_score": 0.84,
            "score": 0.83,
            "standard_number": "IS 99999:2025",
            "clause_number": "Annex A",
            "heading": "Sampling and Inspection Criteria",
            "page_start": 12,
            "page_end": 13,
        },
    ]

    # Filter mock chunks if request has filters
    filtered = mock_chunks
    if request.standard_number:
        filtered = [c for c in filtered if request.standard_number.lower() in c["standard_number"].lower()]
    if request.clause_number:
        filtered = [c for c in filtered if request.clause_number.lower() == c["clause_number"].lower()]

    results = EvidencePackager.package_results(filtered[: request.top_k])
    evidence = EvidencePackager.package_evidence(filtered[: request.top_k])
    citations = [CitationBuilder.from_candidate(c) for c in filtered[: request.top_k]]

    return RetrievalResponse(
        query=request.query,
        normalized_query=norm_q,
        status=RetrievalStatus.SUCCESS if results else RetrievalStatus.NO_RESULTS,
        results=results,
        evidence=evidence,
        citations=citations,
        total_candidates=len(mock_chunks),
        retrieval_method=f"{request.method.value} (dry-run mode)",
        duration_ms=4.2,
        warnings=["Executed in dry-run mode using synthetic standard fixtures"],
        debug_info={"intent": intent, "entities": entities} if request.debug else None,
    )


async def main() -> None:
    parser = argparse.ArgumentParser(description="BIS Copilot RAG Retrieval CLI")
    parser.add_argument("--query", "-q", type=str, default="What are the material requirements in IS 99999 clause 5.2?", help="Search query string")
    parser.add_argument("--method", "-m", choices=["hybrid", "vector", "keyword"], default="hybrid", help="Retrieval method")
    parser.add_argument("--top-k", "-k", type=int, default=10, help="Number of final results to return")
    parser.add_argument("--standard", "-s", type=str, default=None, help="Filter by standard number (e.g. 'IS 99999')")
    parser.add_argument("--clause", "-c", type=str, default=None, help="Filter by clause number (e.g. '5.2')")
    parser.add_argument("--no-rerank", action="store_true", help="Disable cross-encoder reranker")
    parser.add_argument("--debug", action="store_true", help="Display timing and candidate breakdown")
    parser.add_argument("--dry-run", action="store_true", help="Run simulated retrieval without database")

    args = parser.parse_args()

    request = RetrievalRequest(
        query=args.query,
        top_k=args.top_k,
        method=RetrievalMethod(args.method),
        standard_number=args.standard,
        clause_number=args.clause,
        rerank=not args.no_rerank,
        debug=args.debug,
    )

    if args.dry_run:
        response = await execute_dry_run(request)
        print_response(response, debug=args.debug)
        return

    # Attempt live retrieval through database
    try:
        async with AsyncSessionLocal() as session:
            service = RetrievalService(
                session=session,
                embedding_provider=DeterministicEmbeddingProvider(),
                reranker=NoOpReranker(),
            )
            response = await service.retrieve(request)
            print_response(response, debug=args.debug)
    except Exception as exc:
        print(f"\n[!] Live database retrieval encountered: {exc}")
        print("[!] Falling back to dry-run demonstration...")
        response = await execute_dry_run(request)
        print_response(response, debug=args.debug)


if __name__ == "__main__":
    asyncio.run(main())
