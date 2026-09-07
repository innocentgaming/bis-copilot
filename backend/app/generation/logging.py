"""Structured logging for RAG generation and AI orchestration."""

import logging
from typing import Any, Dict, Optional

logger = logging.getLogger("bis_copilot.generation")


class GenerationLogger:
    """Provides structured audit logs for retrieval and generation lifecycles."""

    @staticmethod
    def log_turn(
        query: str,
        intent: str,
        evidence_count: int,
        provider: str,
        model: str,
        grounding_score: float,
        confidence: float,
        total_ms: float,
        insufficient_evidence: bool = False,
        warnings: Optional[list] = None,
    ) -> None:
        """Record structured summary of generation turn."""
        log_entry = {
            "event": "answer_generated",
            "query_preview": query[:80],
            "intent": intent,
            "evidence_count": evidence_count,
            "provider": provider,
            "model": model,
            "grounding_score": grounding_score,
            "confidence": confidence,
            "total_ms": total_ms,
            "insufficient_evidence": insufficient_evidence,
            "warnings_count": len(warnings or []),
        }
        logger.info(f"[GENERATION] {log_entry}")
