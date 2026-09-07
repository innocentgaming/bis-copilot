"""Query normalization, validation, and heuristic intent classification."""

import re
import unicodedata
from typing import Dict, Optional, Tuple

from backend.app.retrieval.exceptions import QueryValidationError

# Regex to detect Indian Standard numbers, e.g. 'IS 1293:2019', 'IS 1234', 'IS/ISO 9001'
IS_REGEX = re.compile(r"\b(IS(?:/[A-Z0-9]+)?\s+\d+(?:(?:\s*:\s*|\s+Part\s+\d+\s*:\s*)\d{4})?)\b", re.IGNORECASE)

# Regex to detect clause numbers, e.g. 'clause 5.2', 'cl. 7.3.1', 'annex a'
CLAUSE_REGEX = re.compile(r"\b(?:clause|cl\.?|section|sec\.?)\s+(\d+(?:\.\d+)*)\b|\b(annex\s+[A-Z](?:\.\d+)?)\b", re.IGNORECASE)

# Standalone clause number pattern, e.g. '5.2' when preceded/followed by words
NUMERIC_CLAUSE_REGEX = re.compile(r"\b(\d+\.\d+(?:\.\d+)*)\b")


class QueryNormalizer:
    """Normalizes and extracts intent/entities from search queries deterministically."""

    @staticmethod
    def normalize(query: str) -> str:
        """Normalize query whitespace and Unicode while preserving technical identifiers.
        
        Args:
            query: Raw user query string.
            
        Returns:
            Cleaned and normalized query string.
        """
        if not query:
            return ""

        # Step 1: Unicode NFKC normalization (replaces odd ligatures/symbols with standard forms)
        normalized = unicodedata.normalize("NFKC", query)

        # Step 2: Replace tabs, carriage returns, and newlines with space
        normalized = re.sub(r"[\r\n\t]+", " ", normalized)

        # Step 3: Collapse repeated spaces
        normalized = re.sub(r" +", " ", normalized)

        # Step 4: Standardize spacing around colon in standard numbers (e.g., 'IS 1234 : 2024' -> 'IS 1234:2024')
        normalized = re.sub(r"\b(IS\s+\d+)\s*:\s*(\d{4})\b", r"\1:\2", normalized, flags=re.IGNORECASE)

        # Step 5: Trim leading/trailing whitespace
        return normalized.strip()

    @staticmethod
    def validate(query: str, max_length: int = 2000) -> str:
        """Validate that the query is non-empty, contains meaningful content, and meets size limits.
        
        Args:
            query: Raw user query string.
            max_length: Maximum allowed length in characters.
            
        Returns:
            Normalized query string.
            
        Raises:
            QueryValidationError: If query is empty, blank, or exceeds length bounds.
        """
        if query is None:
            raise QueryValidationError("Query cannot be None")

        normalized = QueryNormalizer.normalize(query)
        if not normalized:
            raise QueryValidationError("Query must contain at least 1 meaningful non-whitespace character")

        if len(normalized) > max_length:
            raise QueryValidationError(f"Query exceeds maximum allowed length of {max_length} characters")

        return normalized

    @classmethod
    def classify_intent(cls, query: str) -> Tuple[str, Dict[str, Optional[str]]]:
        """Classify query into an intent category and extract technical identifiers using deterministic rules.
        
        Possible intents:
            - standard_lookup: e.g. "What is IS 1293?"
            - clause_lookup: e.g. "What does clause 5.2 say?"
            - test_method: e.g. "How to test tensile strength?"
            - certification: e.g. "What is the ISI mark process?"
            - laboratory: e.g. "Which lab tests electrical plugs?"
            - requirement_question: e.g. "What are the material requirements?"
            - general: fallback general queries.
            
        Returns:
            Tuple of (intent_string, detected_entities_dict)
        """
        normalized = cls.normalize(query)
        q_lower = normalized.lower()

        entities: Dict[str, Optional[str]] = {
            "standard_number": None,
            "clause_number": None,
        }

        # Extract standard number if present
        std_match = IS_REGEX.search(normalized)
        if std_match:
            entities["standard_number"] = std_match.group(1).upper()

        # Extract clause number if present
        cls_match = CLAUSE_REGEX.search(normalized)
        if cls_match:
            entities["clause_number"] = cls_match.group(1) or cls_match.group(2)
        else:
            num_cls_match = NUMERIC_CLAUSE_REGEX.search(normalized)
            if num_cls_match:
                entities["clause_number"] = num_cls_match.group(1)

        # Intent classification heuristics
        if any(kw in q_lower for kw in ["lab", "laboratory", "testing facility", "test center"]):
            intent = "laboratory"
        elif any(kw in q_lower for kw in ["test method", "testing procedure", "how to test", "sampling", "test condition"]):
            intent = "test_method"
        elif any(kw in q_lower for kw in ["certif", "isi mark", "license", "scheme", "hallmark", "grant of licence", "qco"]):
            intent = "certification"
        elif entities["clause_number"] is not None:
            intent = "clause_lookup"
        elif entities["standard_number"] is not None and len(q_lower.split()) <= 6:
            intent = "standard_lookup"
        elif any(kw in q_lower for kw in ["requirement", "specification", "limit", "tolerance", "dimension", "material"]):
            intent = "requirement_question"
        else:
            intent = "general"

        return intent, entities
