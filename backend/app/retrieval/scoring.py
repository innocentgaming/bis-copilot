"""Score normalization, calibration, and deterministic ranking utilities."""

from typing import Dict, List, Tuple
from uuid import UUID


class ScoreNormalizer:
    """Provides methods to normalize scores across diverse retrieval modalities."""

    @staticmethod
    def cosine_distance_to_similarity(distance: float) -> float:
        """Convert pgvector cosine distance to a [0.0, 1.0] similarity score.
        
        Formula:
            similarity = max(0.0, min(1.0, 1.0 - distance))
        """
        if distance is None:
            return 0.0
        sim = 1.0 - distance
        return max(0.0, min(1.0, float(sim)))

    @staticmethod
    def min_max_normalize(scores: Dict[UUID, float]) -> Dict[UUID, float]:
        """Normalize a dictionary of raw scores into the [0.0, 1.0] range using min-max scaling.
        
        If all scores are equal, maps them to 1.0 if positive, else 0.0.
        """
        if not scores:
            return {}

        values = list(scores.values())
        min_val = min(values)
        max_val = max(values)

        if max_val == min_val:
            return {k: (1.0 if max_val > 0 else 0.0) for k in scores}

        span = max_val - min_val
        return {k: float((v - min_val) / span) for k, v in scores.items()}

    @staticmethod
    def rank_based_normalize(ranked_ids: List[UUID]) -> Dict[UUID, float]:
        """Convert an ordered list of candidate IDs into rank-based normalized scores in [0.0, 1.0].
        
        Rank 0 gets 1.0; last rank gets 1 / N.
        """
        n = len(ranked_ids)
        if n == 0:
            return {}
        if n == 1:
            return {ranked_ids[0]: 1.0}

        return {chunk_id: (n - rank) / n for rank, chunk_id in enumerate(ranked_ids)}


def sort_candidates_deterministic(candidates: List[dict]) -> List[dict]:
    """Sort candidates deterministically with stable tie-breakers.
    
    Order:
        1. score DESC
        2. chunk_index ASC (earlier in document preferred)
        3. chunk_id ASC (string comparison of UUID for absolute stability)
    """
    return sorted(
        candidates,
        key=lambda c: (
            -float(c.get("score", 0.0)),
            int(c.get("chunk_index", 0)),
            str(c.get("chunk_id", "")),
        ),
    )
