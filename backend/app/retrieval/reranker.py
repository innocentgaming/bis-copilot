"""Reranking abstraction and implementations for candidate cross-encoder scoring."""

import abc
import logging
from typing import Any, Dict, List, Optional

from backend.app.config import get_settings
from backend.app.retrieval.exceptions import RerankerError

logger = logging.getLogger(__name__)
settings = get_settings()


class Reranker(abc.ABC):
    """Abstract interface for candidate rerankers."""

    @abc.abstractmethod
    def rerank(
        self,
        query: str,
        candidates: List[Dict[str, Any]],
        top_k: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Rerank candidates based on deep cross-encoder relevance against query.
        
        Args:
            query: Clean user search query.
            candidates: Initial retrieved candidates (ordered by fusion score).
            top_k: Number of candidates to rerank and retain.
            
        Returns:
            Reranked list of candidates with updated `rerank_score` and `score`.
        """
        pass


class NoOpReranker(Reranker):
    """Pass-through reranker for unit tests, offline environments, or disabled reranking."""

    def rerank(
        self,
        query: str,
        candidates: List[Dict[str, Any]],
        top_k: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        limit = top_k or len(candidates)
        selected = candidates[:limit]
        for c in selected:
            # Preserve current fused score as rerank_score
            c["rerank_score"] = c.get("score", 0.0)
        return selected


_MODEL_CACHE: Dict[str, Any] = {}


def _resolve_device(preferred: Optional[str] = None) -> str:
    """Resolve compute device (cpu/cuda) with automatic CPU fallback if CUDA is absent."""
    dev = (preferred or getattr(settings, "MODEL_DEVICE", "cpu")).lower()
    if dev == "cuda":
        try:
            import torch
            if not torch.cuda.is_available():
                logger.info("CUDA requested but unavailable on host. Falling back gracefully to CPU.")
                return "cpu"
        except ImportError:
            return "cpu"
    return dev


class CrossEncoderReranker(Reranker):
    """Production cross-encoder reranker powered by sentence-transformers (e.g. BGE-reranker)."""

    def __init__(
        self,
        model_name: str = settings.RERANKER_MODEL,
        device: Optional[str] = None,
    ):
        self.model_name = model_name
        self.device = _resolve_device(device)
        self._model = None

    def _load_model(self):
        cache_key = f"{self.model_name}:{self.device}"
        if cache_key in _MODEL_CACHE:
            self._model = _MODEL_CACHE[cache_key]
            return

        if self._model is None:
            try:
                from sentence_transformers import CrossEncoder
                self._model = CrossEncoder(self.model_name, device=self.device)
                _MODEL_CACHE[cache_key] = self._model
            except Exception as exc:
                raise RerankerError(f"Failed to load CrossEncoder model '{self.model_name}': {exc}") from exc

    def rerank(
        self,
        query: str,
        candidates: List[Dict[str, Any]],
        top_k: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        limit = top_k or settings.RERANKER_TOP_K
        subset = candidates[:limit]

        try:
            self._load_model()
            pairs = [[query, c["content"]] for c in subset]
            raw_scores = self._model.predict(pairs)

            # Assign rerank scores (converting to float in case of numpy types)
            for idx, c in enumerate(subset):
                score = float(raw_scores[idx])
                c["rerank_score"] = score
                c["score"] = score  # Final score driven by reranker

            # Sort descending by rerank score
            subset.sort(key=lambda c: -c["rerank_score"])
            return subset

        except Exception as exc:
            logger.warning(
                f"Reranker failed with model '{self.model_name}', falling back to fused scores: {exc}"
            )
            # Graceful fallback: return subset with original scores
            for c in subset:
                c["rerank_score"] = c.get("score", 0.0)
            return subset


def get_reranker(
    enabled: bool = settings.RERANKER_ENABLED,
    model_name: str = settings.RERANKER_MODEL,
    prefer_noop: bool = False,
) -> Reranker:
    """Factory creating the appropriate reranker instance.
    
    Args:
        enabled: If False, returns NoOpReranker.
        model_name: Model identifier for CrossEncoder.
        prefer_noop: Forces NoOpReranker (useful for tests).
    """
    if not enabled or prefer_noop:
        return NoOpReranker()
    return CrossEncoderReranker(model_name=model_name)
