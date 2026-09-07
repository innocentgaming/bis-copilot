"""Embedding provider abstractions and implementations for semantic vector generation."""

import abc
import hashlib
import math
from typing import List
import numpy as np

from backend.app.config import get_settings
from backend.app.ingestion.exceptions import EmbeddingError

settings = get_settings()


class EmbeddingProvider(abc.ABC):
    """Abstract interface for text embedding models."""

    @abc.abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Compute vector embeddings for a list of text strings."""
        pass

    def embed_query(self, query: str) -> List[float]:
        """Compute vector embedding for a single search query string."""
        results = self.embed_documents([query])
        return results[0] if results else [0.0] * self.get_dimension()

    @abc.abstractmethod
    def get_dimension(self) -> int:
        """Return the vector dimension produced by this provider."""
        pass


class DeterministicEmbeddingProvider(EmbeddingProvider):
    """Fast, deterministic pseudo-embedding provider for testing and offline environments.

    Generates reproducible unit-length vectors using cryptographic pseudo-random hashing.
    Ensures vector dimension matches settings.EMBEDDING_DIMENSION precisely.
    """

    def __init__(self, dimension: int = settings.EMBEDDING_DIMENSION):
        self.dimension = dimension

    def get_dimension(self) -> int:
        return self.dimension

    def _embed_single(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self.dimension

        # Generate deterministic floats using SHA-512 rounds
        vec = []
        salt = 0
        while len(vec) < self.dimension:
            h = hashlib.sha512(f"{salt}:{text}".encode("utf-8")).digest()
            for i in range(0, len(h), 4):
                if len(vec) >= self.dimension:
                    break
                val = int.from_bytes(h[i : i + 4], byteorder="big", signed=True)
                vec.append(float(val) / (2**31))
            salt += 1

        # Normalize to unit length (L2 norm) for cosine similarity
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def embed_query(self, query: str) -> List[float]:
        return self._embed_single(query)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_single(t) for t in texts]


_EMBEDDING_MODEL_CACHE: dict = {}


def _resolve_device(preferred: str = None) -> str:
    """Resolve compute device with automatic CPU fallback if CUDA is absent."""
    dev = (preferred or getattr(settings, "MODEL_DEVICE", "cpu")).lower()
    if dev == "cuda":
        try:
            import torch
            if not torch.cuda.is_available():
                return "cpu"
        except ImportError:
            return "cpu"
    return dev


class SentenceTransformerEmbeddingProvider(EmbeddingProvider):
    """Production embedding provider powered by sentence-transformers."""

    def __init__(
        self,
        model_name: str = settings.EMBEDDING_MODEL,
        batch_size: int = settings.EMBEDDING_BATCH_SIZE,
        device: str = None,
    ):
        self.model_name = model_name
        self.batch_size = batch_size
        self.device = _resolve_device(device)
        self._model = None

    def _load_model(self):
        cache_key = f"{self.model_name}:{self.device}"
        if cache_key in _EMBEDDING_MODEL_CACHE:
            self._model = _EMBEDDING_MODEL_CACHE[cache_key]
            return

        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name, device=self.device)
                _EMBEDDING_MODEL_CACHE[cache_key] = self._model
            except Exception as exc:
                raise EmbeddingError(f"Failed to load embedding model '{self.model_name}': {exc}")

    def get_dimension(self) -> int:
        self._load_model()
        return self._model.get_sentence_embedding_dimension()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        self._load_model()
        try:
            embeddings = self._model.encode(
                texts,
                batch_size=self.batch_size,
                show_progress_bar=False,
                normalize_embeddings=True,  # Crucial for pgvector cosine distance
            )
            return embeddings.tolist()
        except Exception as exc:
            raise EmbeddingError(f"Error computing embeddings with model '{self.model_name}': {exc}")


def get_embedding_provider(
    provider_type: str = "deterministic",
) -> EmbeddingProvider:
    """Factory creating the appropriate embedding provider.

    Args:
        provider_type: 'deterministic' (offline/tests) or 'sentence_transformers' (production).
    """
    if provider_type == "sentence_transformers":
        return SentenceTransformerEmbeddingProvider()
    return DeterministicEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
