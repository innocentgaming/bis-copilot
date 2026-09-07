"""Unit tests for query normalization, validation, and intent classification."""

import pytest
from backend.app.retrieval.exceptions import QueryValidationError
from backend.app.retrieval.query import QueryNormalizer


def test_normalize_whitespace_and_unicode():
    raw = "   What   are   the \t\n requirements   for \u00a0 IS 1293 ?   "
    normalized = QueryNormalizer.normalize(raw)
    assert normalized == "What are the requirements for IS 1293 ?"


def test_normalize_preserves_standard_and_clause_identifiers():
    raw = "What does  IS 1293 : 2019   clause 5.2.1  say about 250 V rating?"
    normalized = QueryNormalizer.normalize(raw)
    assert "IS 1293:2019" in normalized
    assert "clause 5.2.1" in normalized
    assert "250 V" in normalized


def test_validate_empty_query_raises_error():
    with pytest.raises(QueryValidationError, match="non-whitespace character"):
        QueryNormalizer.validate("     \t \n   ")

    with pytest.raises(QueryValidationError):
        QueryNormalizer.validate("")

    with pytest.raises(QueryValidationError):
        QueryNormalizer.validate(None)


def test_validate_max_length_exceeded():
    long_query = "a" * 2005
    with pytest.raises(QueryValidationError, match="exceeds maximum"):
        QueryNormalizer.validate(long_query, max_length=2000)


def test_validate_valid_query():
    cleaned = QueryNormalizer.validate("  What is the scope of IS 99999?  ")
    assert cleaned == "What is the scope of IS 99999?"


def test_classify_intent_standard_lookup():
    intent, entities = QueryNormalizer.classify_intent("What is IS 1293:2019?")
    assert intent == "standard_lookup"
    assert entities["standard_number"] == "IS 1293:2019"


def test_classify_intent_clause_lookup():
    intent, entities = QueryNormalizer.classify_intent("Explain clause 5.2 in the standard")
    assert intent == "clause_lookup"
    assert entities["clause_number"] == "5.2"


def test_classify_intent_test_method():
    intent, entities = QueryNormalizer.classify_intent("What is the test method for tensile strength?")
    assert intent == "test_method"


def test_classify_intent_certification():
    intent, entities = QueryNormalizer.classify_intent("How to obtain an ISI mark licence for domestic appliances?")
    assert intent == "certification"


def test_classify_intent_laboratory():
    intent, entities = QueryNormalizer.classify_intent("Which laboratory is recognized for testing plugs?")
    assert intent == "laboratory"


def test_classify_intent_requirements():
    intent, entities = QueryNormalizer.classify_intent("What are the material requirements and tolerance specifications?")
    assert intent == "requirement_question"
