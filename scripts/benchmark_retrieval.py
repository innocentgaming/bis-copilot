"""Retrieval evaluation and benchmarking tool measuring Recall@K, MRR, and latency."""

import argparse
import asyncio
import os
import sys
import time
import uuid
from typing import Any, Dict, List, Tuple

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.config import get_settings
from backend.app.database.session import AsyncSessionLocal
from backend.app.ingestion.embeddings import DeterministicEmbeddingProvider
from backend.app.retrieval.citations import CitationBuilder
from backend.app.retrieval.diversification import Diversifier
from backend.app.retrieval.evidence import EvidencePackager
from backend.app.retrieval.hybrid import HybridFusion
from backend.app.retrieval.models import (
    RetrievalMethod,
    RetrievalRequest,
    RetrievalResponse,
    RetrievalStatus,
)
from backend.app.retrieval.query import QueryNormalizer
from backend.app.retrieval.reranker import NoOpReranker
from backend.app.retrieval.service import RetrievalService

settings = get_settings()

# Synthetic ground-truth corpus mirroring sample_standard.pdf clauses
BENCHMARK_CHUNKS = [
    {
        "chunk_id": uuid.UUID("11111111-0000-0000-0000-000000000001"),
        "content": "Clause 1 Scope — This standard specifies safety, performance, and construction requirements for industrial electrical apparatus.",
        "standard_number": "IS 99999:2025",
        "clause_number": "1.0",
        "heading": "Scope",
        "page_start": 1,
        "page_end": 1,
        "vector_score": 0.96,
        "keyword_score": 0.94,
        "chunk_index": 0,
    },
    {
        "chunk_id": uuid.UUID("11111111-0000-0000-0000-000000000002"),
        "content": "Clause 5.1 Material Specifications — Enclosures shall be manufactured from flame-retardant polycarbonate or high-grade stainless steel.",
        "standard_number": "IS 99999:2025",
        "clause_number": "5.1",
        "heading": "Material Specifications",
        "page_start": 4,
        "page_end": 5,
        "vector_score": 0.95,
        "keyword_score": 0.92,
        "chunk_index": 1,
    },
    {
        "chunk_id": uuid.UUID("11111111-0000-0000-0000-000000000003"),
        "content": "Clause 5.2 Mechanical Performance — Breaking load must withstand a minimum force of 450 N at 25°C under continuous testing.",
        "standard_number": "IS 99999:2025",
        "clause_number": "5.2",
        "heading": "Mechanical Performance",
        "page_start": 5,
        "page_end": 6,
        "vector_score": 0.92,
        "keyword_score": 0.96,
        "chunk_index": 2,
    },
    {
        "chunk_id": uuid.UUID("11111111-0000-0000-0000-000000000004"),
        "content": "Clause 7.1 Electrical Insulation — Dielectric strength shall be tested at 2500 V AC for 60 seconds without flashover.",
        "standard_number": "IS 99999:2025",
        "clause_number": "7.1",
        "heading": "Electrical Insulation Testing",
        "page_start": 8,
        "page_end": 9,
        "vector_score": 0.94,
        "keyword_score": 0.95,
        "chunk_index": 3,
    },
    {
        "chunk_id": uuid.UUID("11111111-0000-0000-0000-000000000005"),
        "content": "Annex A (Normative) Sampling and Inspection — Lot acceptance requires 5 units sampled per batch of 1000 items according to Table A.1.",
        "standard_number": "IS 99999:2025",
        "clause_number": "Annex A",
        "heading": "Sampling and Inspection",
        "page_start": 14,
        "page_end": 15,
        "vector_score": 0.91,
        "keyword_score": 0.90,
        "chunk_index": 4,
    },
]

# Evaluation test dataset with ground truth targets
EVALUATION_QUESTIONS = [
    {
        "query": "What is the general scope of IS 99999?",
        "expected_chunk_ids": [uuid.UUID("11111111-0000-0000-0000-000000000001")],
        "expected_clause": "1.0",
    },
    {
        "query": "What are the material specifications for enclosures?",
        "expected_chunk_ids": [uuid.UUID("11111111-0000-0000-0000-000000000002")],
        "expected_clause": "5.1",
    },
    {
        "query": "What is the breaking load requirement in clause 5.2?",
        "expected_chunk_ids": [uuid.UUID("11111111-0000-0000-0000-000000000003")],
        "expected_clause": "5.2",
    },
    {
        "query": "How is dielectric insulation strength tested in Clause 7.1?",
        "expected_chunk_ids": [uuid.UUID("11111111-0000-0000-0000-000000000004")],
        "expected_clause": "7.1",
    },
    {
        "query": "What are the sampling and inspection criteria in Annex A?",
        "expected_chunk_ids": [uuid.UUID("11111111-0000-0000-0000-000000000005")],
        "expected_clause": "Annex A",
    },
]


def calculate_metrics(
    retrieved_chunk_ids: List[uuid.UUID],
    expected_chunk_ids: List[uuid.UUID],
    k_values: Tuple[int, ...] = (5, 10),
) -> Tuple[Dict[int, float], float]:
    """Compute Recall@K and Reciprocal Rank (RR) for a single query."""
    recalls = {}
    for k in k_values:
        top_k_ids = set(retrieved_chunk_ids[:k])
        hits = sum(1 for cid in expected_chunk_ids if cid in top_k_ids)
        recalls[k] = float(hits / len(expected_chunk_ids)) if expected_chunk_ids else 0.0

    # Reciprocal Rank calculation
    rr = 0.0
    for rank, cid in enumerate(retrieved_chunk_ids, start=1):
        if cid in expected_chunk_ids:
            rr = 1.0 / rank
            break

    return recalls, rr


def simulate_retrieval(query: str, top_k: int = 10) -> Tuple[List[uuid.UUID], float]:
    """Execute in-memory retrieval pipeline for benchmarking."""
    t0 = time.perf_counter()
    norm_q = QueryNormalizer.validate(query)
    intent, entities = QueryNormalizer.classify_intent(norm_q)

    # Score each chunk using synthetic hybrid scoring
    candidates = []
    q_words = set(norm_q.lower().split())
    for chunk in BENCHMARK_CHUNKS:
        c = dict(chunk)
        c_words = set(c["content"].lower().split())
        overlap = len(q_words.intersection(c_words))
        # Keyword term overlap + exact boost
        kw_score = overlap / max(1, len(q_words))
        if entities.get("clause_number") and entities["clause_number"].lower() in c["clause_number"].lower():
            kw_score += 0.5

        c["keyword_score"] = kw_score
        candidates.append(c)

    # Fuse scores
    fused = HybridFusion.weighted_score_fusion(
        vector_candidates=candidates,
        keyword_candidates=candidates,
        vector_weight=0.6,
        keyword_weight=0.4,
    )

    # Diversify
    final_candidates = Diversifier.diversify_by_clause(fused, top_k=top_k)
    duration_ms = (time.perf_counter() - t0) * 1000

    return [c["chunk_id"] for c in final_candidates], duration_ms


async def run_benchmark(top_k: int = 10) -> None:
    """Run full retrieval evaluation benchmark across question fixtures."""
    print("\n" + "=" * 55)
    print("BIS COPILOT — RETRIEVAL EVALUATION BENCHMARK")
    print("=" * 55)
    print(f"Total Benchmark Questions: {len(EVALUATION_QUESTIONS)}")
    print(f"Target K:                  {top_k}")
    print("-" * 55)

    recalls_at_5: List[float] = []
    recalls_at_10: List[float] = []
    rrs: List[float] = []
    latencies: List[float] = []

    for idx, item in enumerate(EVALUATION_QUESTIONS, start=1):
        q = item["query"]
        expected_ids = item["expected_chunk_ids"]

        retrieved_ids, latency = simulate_retrieval(q, top_k=top_k)
        recalls, rr = calculate_metrics(retrieved_ids, expected_ids, k_values=(5, 10))

        recalls_at_5.append(recalls[5])
        recalls_at_10.append(recalls[10])
        rrs.append(rr)
        latencies.append(latency)

        print(f"[{idx:02d}] Query:    {q[:45]}...")
        print(f"     Latency:  {latency:.2f} ms | Recall@5: {recalls[5]:.2f} | RR: {rr:.2f}")

    avg_recall_5 = sum(recalls_at_5) / len(recalls_at_5) if recalls_at_5 else 0.0
    avg_recall_10 = sum(recalls_at_10) / len(recalls_at_10) if recalls_at_10 else 0.0
    mrr = sum(rrs) / len(rrs) if rrs else 0.0
    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
    min_latency = min(latencies) if latencies else 0.0
    max_latency = max(latencies) if latencies else 0.0

    print("\n" + "=" * 55)
    print("EVALUATION SUMMARY REPORT")
    print("=" * 55)
    print(f"Questions Evaluated: {len(EVALUATION_QUESTIONS)}")
    print(f"Recall@5:            {avg_recall_5:.4f}")
    print(f"Recall@10:           {avg_recall_10:.4f}")
    print(f"MRR (Mean RR):       {mrr:.4f}")
    print(f"Average Latency:     {avg_latency:.2f} ms")
    print(f"Latency Range:       {min_latency:.2f} ms – {max_latency:.2f} ms")
    print("=" * 55 + "\n")


if __name__ == "__main__":
    asyncio.run(run_benchmark())
