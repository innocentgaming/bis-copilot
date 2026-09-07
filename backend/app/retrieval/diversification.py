"""Result deduplication and clause-level diversification."""

from collections import defaultdict
from typing import Any, Dict, List
from uuid import UUID

from backend.app.config import get_settings

settings = get_settings()


class Diversifier:
    """Deduplicates candidates and balances results across distinct standard clauses."""

    @staticmethod
    def deduplicate(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Deduplicate candidate chunks by chunk_id, preserving maximal scores and merged sources."""
        seen: Dict[UUID, Dict[str, Any]] = {}

        for c in candidates:
            cid = c["chunk_id"]
            if cid not in seen:
                seen[cid] = dict(c)
            else:
                existing = seen[cid]
                # Merge scores
                if c.get("vector_score") is not None and existing.get("vector_score") is None:
                    existing["vector_score"] = c["vector_score"]
                if c.get("keyword_score") is not None and existing.get("keyword_score") is None:
                    existing["keyword_score"] = c["keyword_score"]
                # Keep higher individual or fused score
                if c.get("score", 0.0) > existing.get("score", 0.0):
                    existing["score"] = c["score"]

                # Record combined source
                src = existing.get("retrieval_source", "")
                new_src = c.get("retrieval_source", "")
                if new_src and new_src not in src:
                    existing["retrieval_source"] = f"{src}+{new_src}"

        return list(seen.values())

    @staticmethod
    def diversify_by_clause(
        candidates: List[Dict[str, Any]],
        top_k: int,
        max_per_clause: int = settings.MAX_CHUNKS_PER_CLAUSE,
    ) -> List[Dict[str, Any]]:
        """Diversify results so no single clause floods the final evidence list.
        
        Args:
            candidates: Ranked candidate list.
            top_k: Number of final results requested.
            max_per_clause: Maximum allowed chunks from the same clause in initial selection.
            
        Returns:
            Diversified list of candidates up to top_k.
        """
        if not candidates:
            return []

        selected: List[Dict[str, Any]] = []
        clause_counts: Dict[str, int] = defaultdict(int)
        overflow: List[Dict[str, Any]] = []

        # Pass 1: Greedily pick chunks that do not exceed the per-clause threshold
        for c in candidates:
            # Use clause_id or clause_number as group key; if neither exists, use unique chunk_id
            clause_key = str(c.get("clause_id") or c.get("clause_number") or c["chunk_id"])

            if clause_counts[clause_key] < max_per_clause:
                clause_counts[clause_key] += 1
                selected.append(c)
                if len(selected) >= top_k:
                    break
            else:
                overflow.append(c)

        # Pass 2: If we still haven't met top_k and candidates remain, backfill from overflow
        if len(selected) < top_k and overflow:
            needed = top_k - len(selected)
            selected.extend(overflow[:needed])

        return selected
