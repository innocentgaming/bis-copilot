"""Unit tests for the master RetrievalService orchestrator."""

import uuid
from unittest.mock import AsyncMock, patch
import pytest

from backend.app.ingestion.embeddings import DeterministicEmbeddingProvider
from backend.app.retrieval.exceptions import QueryValidationError, RetrievalError
from backend.app.retrieval.models import (
    RetrievalMethod,
    RetrievalRequest,
    RetrievalStatus,
)
from backend.app.retrieval.reranker import NoOpReranker
from backend.app.retrieval.service import RetrievalService


@pytest.fixture
def mock_session():
    return AsyncMock()


@pytest.fixture
def service(mock_session):
    provider = DeterministicEmbeddingProvider(dimension=1536)
    reranker = NoOpReranker()
    return RetrievalService(
        session=mock_session,
        embedding_provider=provider,
        reranker=reranker,
    )


@pytest.mark.asyncio
async def test_service_rejects_empty_query(service):
    # Test that service catches and raises QueryValidationError if an unvalidated query reaches it
    unvalidated_request = RetrievalRequest.model_construct(query="   ")
    with pytest.raises(QueryValidationError):
        await service.retrieve(unvalidated_request)


@pytest.mark.asyncio
async def test_service_hybrid_successful(service):
    cid1 = uuid.uuid4()
    cid2 = uuid.uuid4()

    mock_vector = [
        {
            "chunk_id": cid1,
            "content": "Vector content 1",
            "chunk_index": 0,
            "vector_score": 0.95,
            "score": 0.95,
            "standard_number": "IS 99999:2025",
            "clause_number": "5.1",
            "heading": "General",
            "page_start": 3,
            "page_end": 4,
            "retrieval_source": "vector",
        }
    ]
    mock_keyword = [
        {
            "chunk_id": cid2,
            "content": "Keyword content 2",
            "chunk_index": 1,
            "keyword_score": 0.88,
            "score": 0.88,
            "standard_number": "IS 99999:2025",
            "clause_number": "5.2",
            "heading": "Requirements",
            "page_start": 5,
            "page_end": 5,
            "retrieval_source": "keyword",
        }
    ]

    with patch("backend.app.retrieval.service.VectorSearcher.search", return_value=mock_vector):
        with patch("backend.app.retrieval.service.KeywordSearcher.search", return_value=mock_keyword):
            req = RetrievalRequest(query="material requirements", top_k=5, debug=True)
            response = await service.retrieve(req)

            assert response.status == RetrievalStatus.SUCCESS
            assert len(response.results) == 2
            assert len(response.evidence) == 2
            assert len(response.citations) == 2
            assert response.duration_ms > 0
            assert response.debug_info is not None
            assert response.debug_info["vector_candidate_count"] == 1
            assert response.debug_info["keyword_candidate_count"] == 1


@pytest.mark.asyncio
async def test_service_partial_fallback_vector_failure(service):
    cid = uuid.uuid4()
    mock_keyword = [
        {
            "chunk_id": cid,
            "content": "Fallback content",
            "chunk_index": 0,
            "keyword_score": 0.75,
            "score": 0.75,
            "standard_number": "IS 1234:2020",
            "clause_number": "1.0",
            "retrieval_source": "keyword",
        }
    ]

    with patch("backend.app.retrieval.service.VectorSearcher.search", side_effect=Exception("DB vector connection drop")):
        with patch("backend.app.retrieval.service.KeywordSearcher.search", return_value=mock_keyword):
            req = RetrievalRequest(query="fallback test", method=RetrievalMethod.HYBRID)
            response = await service.retrieve(req)

            assert response.status == RetrievalStatus.PARTIAL_FALLBACK
            assert response.retrieval_method == "keyword_fallback"
            assert len(response.warnings) == 1
            assert "Vector retrieval unavailable" in response.warnings[0]
            assert len(response.results) == 1


@pytest.mark.asyncio
async def test_service_no_results_status(service):
    with patch("backend.app.retrieval.service.VectorSearcher.search", return_value=[]):
        with patch("backend.app.retrieval.service.KeywordSearcher.search", return_value=[]):
            req = RetrievalRequest(query="unknown query text")
            response = await service.retrieve(req)

            assert response.status == RetrievalStatus.NO_RESULTS
            assert len(response.results) == 0
            assert len(response.evidence) == 0


@pytest.mark.asyncio
async def test_service_low_confidence_status(service):
    cid = uuid.uuid4()
    # Score 0.05 is well below LOW_CONFIDENCE_THRESHOLD (0.25)
    weak_result = [
        {
            "chunk_id": cid,
            "content": "Weak match content",
            "chunk_index": 0,
            "vector_score": 0.05,
            "keyword_score": 0.05,
            "score": 0.05,
            "retrieval_source": "vector",
        }
    ]

    with patch("backend.app.retrieval.service.VectorSearcher.search", return_value=weak_result):
        with patch("backend.app.retrieval.service.KeywordSearcher.search", return_value=[]):
            req = RetrievalRequest(query="weak match", method=RetrievalMethod.VECTOR)
            response = await service.retrieve(req)

            assert response.status == RetrievalStatus.LOW_CONFIDENCE
            assert len(response.results) == 1


@pytest.mark.asyncio
async def test_service_catalog_lookup_for_is_number(service):
    with patch("backend.app.retrieval.service.VectorSearcher.search", return_value=[]):
        with patch("backend.app.retrieval.service.KeywordSearcher.search", return_value=[]):
            req = RetrievalRequest(query="IS 1921-3:2016")
            response = await service.retrieve(req)

            assert response.status == RetrievalStatus.SUCCESS
            assert len(response.results) >= 1
            assert "IS 1921-3:2016" in response.results[0].content
            assert len(response.evidence) >= 1
            assert response.evidence[0].standard_number == "IS 1921-3:2016"

