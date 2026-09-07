"""Evidence packaging utilities for downstream AI and LLM agents."""

from typing import Any, Dict, List
from backend.app.retrieval.models import Evidence, RetrievalResult


class EvidencePackager:
    """Structures retrieved candidates into authoritative Evidence and RetrievalResult objects."""

    @staticmethod
    def package_evidence(candidates: List[Dict[str, Any]]) -> List[Evidence]:
        """Convert candidates into clean Evidence models for LLM context consumption."""
        evidence_list: List[Evidence] = []
        for c in candidates:
            evidence_list.append(
                Evidence(
                    chunk_id=c["chunk_id"],
                    document_id=c.get("document_id"),
                    standard_number=c.get("standard_number"),
                    clause_number=c.get("clause_number"),
                    heading=c.get("heading"),
                    page_start=c.get("page_start"),
                    page_end=c.get("page_end"),
                    content=c.get("content", ""),
                    relevance_score=round(float(c.get("score", 0.0)), 4),
                )
            )
        return evidence_list

    @staticmethod
    def package_results(candidates: List[Dict[str, Any]]) -> List[RetrievalResult]:
        """Convert candidates into detailed RetrievalResult models."""
        results: List[RetrievalResult] = []
        for c in candidates:
            results.append(
                RetrievalResult(
                    chunk_id=c["chunk_id"],
                    content=c.get("content", ""),
                    score=round(float(c.get("score", 0.0)), 4),
                    vector_score=(
                        round(float(c["vector_score"]), 4)
                        if c.get("vector_score") is not None
                        else None
                    ),
                    keyword_score=(
                        round(float(c["keyword_score"]), 4)
                        if c.get("keyword_score") is not None
                        else None
                    ),
                    rerank_score=(
                        round(float(c["rerank_score"]), 4)
                        if c.get("rerank_score") is not None
                        else None
                    ),
                    document_id=c.get("document_id"),
                    standard_id=c.get("standard_id"),
                    clause_id=c.get("clause_id"),
                    standard_number=c.get("standard_number"),
                    clause_number=c.get("clause_number"),
                    heading=c.get("heading"),
                    page_start=c.get("page_start"),
                    page_end=c.get("page_end"),
                    metadata=c.get("metadata", {}),
                    explanation=c.get("explanation"),
                )
            )
        return results

    @staticmethod
    def to_llm_context_dict(evidence_list: List[Evidence]) -> Dict[str, Any]:
        """Convert a list of Evidence objects into a compact JSON-serializable structure for prompts."""
        return {
            "evidence_count": len(evidence_list),
            "items": [
                {
                    "standard": e.standard_number or "BIS Document",
                    "clause": e.clause_number or "N/A",
                    "heading": e.heading or "",
                    "pages": (
                        [e.page_start, e.page_end]
                        if e.page_start and e.page_end and e.page_start != e.page_end
                        else ([e.page_start] if e.page_start else [])
                    ),
                    "score": e.relevance_score,
                    "content": e.content,
                }
                for e in evidence_list
            ],
        }
