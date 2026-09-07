"""CLI tool for executing and testing BIS Copilot RAG Answer Generation & Orchestration (Phase 4)."""

import argparse
import asyncio
import json
import os
import sys
import uuid
from typing import Optional
from unittest.mock import AsyncMock, MagicMock

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.app.config import get_settings
from backend.app.generation.deterministic_provider import DeterministicLLMProvider
from backend.app.generation.llm_provider import OpenAICompatibleProvider
from backend.app.generation.models import AnswerRequest, AnswerResponse
from backend.app.generation.orchestration import GenerationOrchestrator
from backend.app.generation.provider import LLMProvider
from backend.app.retrieval.models import (
    CitationReference,
    RetrievalResponse,
    RetrievalResult,
)
from backend.app.retrieval.service import RetrievalService

settings = get_settings()

BENCHMARK_CHUNKS = [
    RetrievalResult(
        chunk_id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
        content=(
            "Standard: IS 99999:2025 Clause: 5.2 Heading: Mechanical Performance\n"
            "Under IS 99999:2025 Clause 5.2, breaking load for all high-grade structural components "
            "shall withstand a minimum force of 450 N when tested at 25°C. Deformation under load "
            "shall not exceed 1.5 mm."
        ),
        score=0.96,
        vector_score=0.95,
        keyword_score=0.97,
        standard_number="IS 99999:2025",
        clause_number="5.2",
        heading="Mechanical Performance",
        page_start=5,
        page_end=6,
    ),
    RetrievalResult(
        chunk_id=uuid.UUID("22222222-2222-2222-2222-222222222222"),
        content=(
            "Standard: IS 99999:2025 Clause: 6.1 Heading: Electrical Safety & Insulation Resistance\n"
            "Insulation resistance shall be not less than 50 MΩ when tested with a DC voltage "
            "of 500 V applied for 60 seconds across primary conductors."
        ),
        score=0.91,
        vector_score=0.90,
        keyword_score=0.92,
        standard_number="IS 99999:2025",
        clause_number="6.1",
        heading="Electrical Safety & Insulation Resistance",
        page_start=8,
        page_end=8,
    ),
    RetrievalResult(
        chunk_id=uuid.UUID("33333333-3333-3333-3333-333333333333"),
        content=(
            "Standard: IS 99999:2025 Clause: Annex A Heading: Sampling Guidelines\n"
            "Annex A specifies that for lot sizes greater than 5000 units, a sample of 32 units "
            "shall be drawn at random for destructive testing."
        ),
        score=0.88,
        vector_score=0.86,
        keyword_score=0.90,
        standard_number="IS 99999:2025",
        clause_number="Annex A",
        heading="Sampling Guidelines",
        page_start=14,
        page_end=15,
    ),
]


def create_simulated_retrieval(query: str) -> RetrievalResponse:
    """Create a simulated Phase 3 retrieval response for dry-run offline testing."""
    q_lower = query.lower()
    matched = []

    if "breaking" in q_lower or "mechanical" in q_lower or "450" in q_lower or "load" in q_lower or "5.2" in q_lower:
        matched.append(BENCHMARK_CHUNKS[0])
    if "insulation" in q_lower or "electrical" in q_lower or "voltage" in q_lower or "6.1" in q_lower:
        matched.append(BENCHMARK_CHUNKS[1])
    if "sampling" in q_lower or "annex a" in q_lower or "lot" in q_lower:
        matched.append(BENCHMARK_CHUNKS[2])

    citations = [
        CitationReference(
            chunk_id=c.chunk_id,
            standard_number=c.standard_number,
            clause_number=c.clause_number,
            page_start=c.page_start,
            page_end=c.page_end,
            citation_text=f"[{c.standard_number}, Clause {c.clause_number}, pp. {c.page_start}–{c.page_end}]",
        )
        for c in matched
    ]

    return RetrievalResponse(
        query=query,
        normalized_query=query.strip(),
        results=matched,
        citations=citations,
        total_candidates=len(matched),
    )


def print_answer_response(resp: AnswerResponse, language: str = "en") -> None:
    """Format and print an AnswerResponse."""
    print("\n" + "=" * 76)
    print("                      BIS COPILOT - PHASE 4 ANSWER OUTPUT")
    print("=" * 76)
    print(f"Conversation ID : {resp.conversation_id}")
    print(f"Message ID      : {resp.message_id}")
    print(f"Language        : {language}")
    print(f"Intent          : {resp.intent}")
    print(f"Confidence      : {resp.confidence:.2f} ({resp.confidence_level})")
    print(f"Insufficient Ev.: {resp.insufficient_evidence}")
    print(f"Timing Breakdown: Retrieval={resp.processing.retrieval_ms:.1f}ms | LLM={resp.processing.generation_ms:.1f}ms | Total={resp.processing.total_ms:.1f}ms")

    print("\n" + "-" * 76)
    print("ANSWER:")
    print("-" * 76)
    print(resp.answer.strip())

    if resp.citations:
        print("\n" + "-" * 76)
        print(f"AUTHENTIC CITATIONS ({len(resp.citations)} verified):")
        print("-" * 76)
        for i, cit in enumerate(resp.citations, 1):
            clause = f"Clause {cit.clause}" if cit.clause else ""
            pages = f"Pages {cit.pages}" if cit.pages else ""
            print(f" [{i}] {cit.citation_text}")
            print(f"     Standard: {cit.standard} | {clause} | {pages} | Score: {cit.relevance_score:.2f}")

    if resp.caveats:
        print("\n" + "-" * 76)
        print("CAVEATS & WARNINGS:")
        print("-" * 76)
        for c in resp.caveats:
            print(f"  * {c}")

    print("=" * 76 + "\n")


async def run_query(query: str, language: str = "en", dry_run: bool = True) -> None:
    """Execute a query through the Phase 4 GenerationOrchestrator."""
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()

    if dry_run:
        mock_retrieval = AsyncMock()
        async def _mock_retrieve(retrieval_req):
            return create_simulated_retrieval(retrieval_req.query)
        mock_retrieval.retrieve.side_effect = _mock_retrieve
        retrieval_service = mock_retrieval
    else:
        from backend.app.database.session import AsyncSessionLocal
        from backend.app.ingestion.embeddings import get_embedding_provider
        from backend.app.retrieval.reranker import get_reranker
        retrieval_service = RetrievalService(
            session=session,
            embedding_provider=get_embedding_provider(),
            reranker=get_reranker(),
        )

    provider: LLMProvider
    if settings.LLM_PROVIDER.lower() == "openai" and settings.LLM_API_KEY:
        provider = OpenAICompatibleProvider(
            api_key=settings.LLM_API_KEY,
            model=settings.LLM_MODEL,
            base_url=settings.LLM_BASE_URL,
        )
    else:
        provider = DeterministicLLMProvider()

    orchestrator = GenerationOrchestrator(
        session=session,
        retrieval_service=retrieval_service,
        llm_provider=provider,
    )

    req = AnswerRequest(query=query, language=language)
    resp = await orchestrator.answer(req)
    print_answer_response(resp, language=language)


def main():
    parser = argparse.ArgumentParser(description="Test BIS Copilot Phase 4 RAG Generation")
    parser.add_argument(
        "--query",
        type=str,
        default="What is the minimum breaking load required under Clause 5.2?",
        help="Query to ask BIS Copilot",
    )
    parser.add_argument(
        "--language",
        type=str,
        choices=["en", "hi", "mr"],
        default="en",
        help="Target response language (en/hi/mr)",
    )
    parser.add_argument(
        "--live-db",
        action="store_true",
        help="Use live PostgreSQL database instead of dry-run simulation",
    )
    parser.add_argument(
        "--demo-all",
        action="store_true",
        help="Run comprehensive demonstration covering requirements, multilingual, and refusal",
    )

    args = parser.parse_args()

    if args.demo_all:
        demo_queries = [
            ("What is the minimum breaking load and deformation limit in Clause 5.2?", "en"),
            ("What are the insulation resistance requirements for electrical safety under Clause 6.1?", "en"),
            ("Clause 5.2 के तहत न्यूनतम ब्रेकिंग लोड क्या आवश्यक है?", "hi"),
            ("What is the BIS certification requirement for unapproved pharmaceutical drugs?", "en"),
        ]
        for q, lang in demo_queries:
            asyncio.run(run_query(query=q, language=lang, dry_run=not args.live_db))
    else:
        asyncio.run(run_query(query=args.query, language=args.language, dry_run=not args.live_db))


if __name__ == "__main__":
    main()
