"""Tests for embedding generation, batching, and provider abstraction."""

import math
from backend.app.config import get_settings
from backend.app.ingestion.embeddings import (
    DeterministicEmbeddingProvider,
    get_embedding_provider,
)

settings = get_settings()


def test_deterministic_embedding_dimension():
    """Verify provider generates vectors with length matching settings.EMBEDDING_DIMENSION."""
    provider = DeterministicEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
    assert provider.get_dimension() == settings.EMBEDDING_DIMENSION

    texts = ["Indian Standard IS 1293", "Electrical heating apparatus"]
    vectors = provider.embed_documents(texts)

    assert len(vectors) == 2
    assert len(vectors[0]) == settings.EMBEDDING_DIMENSION
    assert len(vectors[1]) == settings.EMBEDDING_DIMENSION


def test_deterministic_embedding_normalization():
    """Verify vector is L2 normalized for cosine similarity."""
    provider = DeterministicEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)
    vec = provider.embed_documents(["Testing unit length"])[0]

    norm = math.sqrt(sum(x * x for x in vec))
    assert abs(norm - 1.0) < 1e-4


def test_embedding_factory():
    """Verify factory returns appropriate provider."""
    p1 = get_embedding_provider("deterministic")
    assert isinstance(p1, DeterministicEmbeddingProvider)
    assert p1.get_dimension() == settings.EMBEDDING_DIMENSION
