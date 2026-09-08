"""Unit tests for BIS 'Know Your Standards' IS Number Lookup."""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.is_normalizer import ISNormalizer
from backend.app.services.is_lookup_service import ISLookupService


@pytest.fixture
def client():
    return TestClient(app)


class TestISNormalizer:
    """Test suite for IS number parsing and normalization."""

    def test_canonical_is_number(self):
        parsed = ISNormalizer.parse("IS 1910-6:1993")
        assert parsed.canonical_number == "IS 1910-6:1993"
        assert parsed.base_number == "1910"
        assert parsed.part_number == "6"
        assert parsed.year == 1993

    def test_whitespace_and_case_tolerance(self):
        parsed = ISNormalizer.parse("  is   1910 - 6 : 1993  ")
        assert parsed.canonical_number == "IS 1910-6:1993"
        assert parsed.base_number == "1910"
        assert parsed.part_number == "6"
        assert parsed.year == 1993

    def test_missing_punctuation(self):
        parsed = ISNormalizer.parse("IS 1910 6 1993")
        assert parsed.canonical_number == "IS 1910-6:1993"
        assert parsed.base_number == "1910"
        assert parsed.part_number == "6"
        assert parsed.year == 1993

    def test_bare_number_without_prefix(self):
        parsed = ISNormalizer.parse("1910-6:1993")
        assert parsed.canonical_number == "IS 1910-6:1993"
        assert parsed.base_number == "1910"

    def test_base_number_only(self):
        parsed = ISNormalizer.parse("IS 1910")
        assert parsed.canonical_number == "IS 1910"
        assert parsed.base_number == "1910"
        assert parsed.part_number is None
        assert parsed.year is None

    def test_base_and_part_without_year(self):
        parsed = ISNormalizer.parse("IS 1910-6")
        assert parsed.canonical_number == "IS 1910-6"
        assert parsed.base_number == "1910"
        assert parsed.part_number == "6"
        assert parsed.year is None


class TestISLookupService:
    """Test suite for ISLookupService query resolution."""

    def test_exact_match(self):
        res = ISLookupService.lookup("IS 1910-6:1993")
        assert res.match_type == "exact"
        assert res.exact_match is not None
        assert res.exact_match.is_number == "IS 1910-6:1993"
        assert res.exact_match.section == "Chemical"
        assert res.exact_match.title == "Code of practice"
        assert res.exact_match.year_notified == 1993
        assert res.exact_match.status == "Under Revision"
        assert "rubber products" in res.exact_match.applicable_to.lower()
        assert len(res.close_matches) > 0

    def test_close_match_different_year(self):
        # Querying with non-existent year should find existing Part 6 editions
        res = ISLookupService.lookup("IS 1910-6:2050")
        assert res.match_type == "partial"
        assert res.exact_match is None
        assert len(res.close_matches) > 0
        assert any(cm.standard.is_number == "IS 1910-6:1993" for cm in res.close_matches)

    def test_close_match_base_number(self):
        res = ISLookupService.lookup("1910")
        assert res.match_type == "partial"
        assert len(res.close_matches) > 0
        assert all(cm.standard.is_number.startswith("IS 1910") for cm in res.close_matches)

    def test_empty_query(self):
        res = ISLookupService.lookup("")
        assert res.match_type == "none"
        assert res.exact_match is None
        assert len(res.close_matches) == 0


class TestISLookupEndpoints:
    """Test suite for FastAPI endpoints."""

    def test_path_lookup_endpoint(self, client):
        response = client.get("/api/v1/standards/lookup/IS 356-3:1990")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["match_type"] == "exact"
        assert data["data"]["exact_match"]["is_number"] == "IS 356-3:1990"
        assert data["data"]["exact_match"]["section"] == "Mechanical Engineering" or "Mechanical" in data["data"]["exact_match"]["section"]
        assert data["data"]["exact_match"]["status"] == "Active"

    def test_query_lookup_endpoint(self, client):
        response = client.get("/api/v1/standards/lookup?q=IS 1258-3:1990")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["match_type"] == "exact"
        assert data["data"]["exact_match"]["is_number"] == "IS 1258-3:1990"
        assert "fire extinguishers" in data["data"]["exact_match"]["applicable_to"].lower()

    def test_api_alias_endpoint(self, client):
        response = client.get("/api/standards/lookup?q=IS 4044-4:2013")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["match_type"] == "exact"
        assert data["data"]["exact_match"]["is_number"] == "IS 4044-4:2013"
        assert data["data"]["exact_match"]["section"] == "Civil Engineering"
