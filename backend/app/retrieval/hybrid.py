"""Hybrid retrieval combining vector and keyword candidate fusion."""

from typing import Any, Dict, List, Optional
from uuid import UUID

from backend.app.config import get_settings
from backend.app.retrieval.diversification import Diversifier
from backend.app.retrieval.scoring import ScoreNormalizer, sort_candidates_deterministic

settings = get_settings()


class HybridFusion:
    """Merges and scores candidates from vector and keyword retrieval modalities."""

    @staticmethod
    def weighted_score_fusion(
        vector_candidates: List[Dict[str, Any]],
        keyword_candidates: List[Dict[str, Any]],
        vector_weight: float = settings.VECTOR_WEIGHT,
        keyword_weight: float = settings.KEYWORD_WEIGHT,
    ) -> List[Dict[str, Any]]:
        """Fuse candidates using normalized weighted linear score combination.
        
        Formula:
            fused_score = (vector_weight * norm_vec) + (keyword_weight * norm_kw)
        """
        # Step 1: Collect raw scores for normalization
        vec_scores: Dict[UUID, float] = {
            c["chunk_id"]: float(c.get("vector_score", 0.0)) for c in vector_candidates
        }
        kw_scores: Dict[UUID, float] = {
            c["chunk_id"]: float(c.get("keyword_score", 0.0)) for c in keyword_candidates
        }

        norm_vec = ScoreNormalizer.min_max_normalize(vec_scores)
        norm_kw = ScoreNormalizer.min_max_normalize(kw_scores)

        # Step 2: Index all candidate dictionaries by chunk_id
        candidate_map: Dict[UUID, Dict[str, Any]] = {}

        for c in vector_candidates:
            cid = c["chunk_id"]
            if cid not in candidate_map:
                candidate_map[cid] = dict(c)

        for c in keyword_candidates:
            cid = c["chunk_id"]
            if cid not in candidate_map:
                candidate_map[cid] = dict(c)
            else:
                # Merge metadata/fields if vector candidate missed any
                for k, v in c.items():
                    if candidate_map[cid].get(k) is None and v is not None:
                        candidate_map[cid][k] = v

        # Step 3: Compute weighted score for every unique candidate
        total_weight = vector_weight + keyword_weight or 1.0
        w_v = vector_weight / total_weight
        w_k = keyword_weight / total_weight

        fused_list: List[Dict[str, Any]] = []
        for cid, candidate in candidate_map.items():
            nv = norm_vec.get(cid, 0.0)
            nk = norm_kw.get(cid, 0.0)
            fused_score = (w_v * nv) + (w_k * nk)

            candidate["score"] = fused_score
            candidate["vector_score"] = candidate.get("vector_score")
            candidate["keyword_score"] = candidate.get("keyword_score")
            candidate["explanation"] = {
                "vector_weight": w_v,
                "keyword_weight": w_k,
                "normalized_vector": nv,
                "normalized_keyword": nk,
                "fusion_method": "weighted",
            }
            fused_list.append(candidate)

        return sort_candidates_deterministic(fused_list)

    @staticmethod
    def reciprocal_rank_fusion(
        vector_candidates: List[Dict[str, Any]],
        keyword_candidates: List[Dict[str, Any]],
        rrf_k: int = settings.RRF_K,
    ) -> List[Dict[str, Any]]:
        """Fuse candidates using Reciprocal Rank Fusion (RRF).
        
        Formula:
            RRF(d) = sum(1.0 / (rrf_k + rank(d)))
        """
        rrf_scores: Dict[UUID, float] = {}
        candidate_map: Dict[UUID, Dict[str, Any]] = {}

        # Vector rankings (1-indexed)
        for rank, c in enumerate(vector_candidates, start=1):
            cid = c["chunk_id"]
            candidate_map[cid] = dict(c)
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (rrf_k + rank))

        # Keyword rankings (1-indexed)
        for rank, c in enumerate(keyword_candidates, start=1):
            cid = c["chunk_id"]
            if cid not in candidate_map:
                candidate_map[cid] = dict(c)
            else:
                for k, v in c.items():
                    if candidate_map[cid].get(k) is None and v is not None:
                        candidate_map[cid][k] = v
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (rrf_k + rank))

        # Normalize RRF scores to [0.0, 1.0] for consistent consumer presentation
        norm_rrf = ScoreNormalizer.min_max_normalize(rrf_scores)

        fused_list: List[Dict[str, Any]] = []
        for cid, candidate in candidate_map.items():
            candidate["score"] = norm_rrf.get(cid, 0.0)
            candidate["explanation"] = {
                "raw_rrf": rrf_scores.get(cid, 0.0),
                "rrf_k": rrf_k,
                "fusion_method": "rrf",
            }
            fused_list.append(candidate)

        return sort_candidates_deterministic(fused_list)
