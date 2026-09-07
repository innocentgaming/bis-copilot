"""Safety guardrails and prompt injection detection."""

import re
from typing import Optional, Tuple
from backend.app.generation.exceptions import SafetyValidationError

# Known prompt injection and jailbreak phrases
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"disregard\s+(all\s+)?rules",
    r"bypass\s+safety",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"system\s+prompt\s+leak",
    r"reveal\s+your\s+instructions",
    r"pretend\s+you\s+are\s+dan",
    r"output\s+the\s+api\s*key",
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


class SafetyChecker:
    """Detects adversarial inputs, prompt injection, and unauthorized disclosure attempts."""

    @classmethod
    def validate_query(cls, query: str) -> None:
        """Scan query for malicious adversarial patterns.
        
        Raises:
            SafetyValidationError: If dangerous or injection patterns are detected.
        """
        for pattern in COMPILED_PATTERNS:
            if pattern.search(query):
                raise SafetyValidationError(
                    "Query contains unauthorized override commands or security violations."
                )

    @classmethod
    def sanitize_output(cls, text: str) -> str:
        """Remove inadvertent credential or internal path disclosures from output text."""
        # Sanitize API keys or bearer tokens if accidentally echoed
        cleaned = re.sub(r"(?i)bearer\s+[a-zA-Z0-9_\-\.]{20,}", "[REDACTED TOKEN]", text)
        cleaned = re.sub(r"(?i)sk-[a-zA-Z0-9]{20,}", "[REDACTED KEY]", cleaned)
        return cleaned
