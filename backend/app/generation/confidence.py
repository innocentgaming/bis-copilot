"""Multi-factor calibrated confidence computation engine."""

from typing import Tuple
from backend.app.config import get_settings
from backend.app.generation.models import (
    CitationValidationResult,
    ConfidenceLevel,
    EvidenceContext,
    GroundingCheckResult,
)

settings = get_settings()


class ConfidenceEngine:
    """Computes transparent, multi-factor confidence for generated answers."""

    @classmethod
    def calculate_confidence(
        cls,
        context: EvidenceContext,
        grounding: GroundingCheckResult,
        citations: CitationValidationResult,
        insufficient_evidence: bool = False,
    ) -> Tuple[float, ConfidenceLevel]:
        """Compute composite confidence score and categorical level.
        
        Weighting:
            - Retrieval Quality: 30%
            - Grounding Score:   30%
            - Citation Validity: 20%
            - Evidence Coverage: 10%
            - Conflict Penalty: -10% (when active)
        """
        if insufficient_evidence or not context.items:
            return 0.10, ConfidenceLevel.INSUFFICIENT

        # Factor 1: Retrieval Quality (top evidence relevance score)
        top_relevance = context.items[0].relevance_score if context.items else 0.0
        retrieval_factor = max(0.0, min(1.0, top_relevance))

        # Factor 2: Grounding Score
        grounding_factor = max(0.0, min(1.0, grounding.grounding_score))

        # Factor 3: Citation Validity
        total_cites = len(citations.valid_citations) + len(citations.invalid_citations)
        if total_cites > 0:
            citation_factor = len(citations.valid_citations) / total_cites
        else:
            # If answer provided zero citations for factual query, penalize
            citation_factor = 0.50

        # Factor 4: Evidence Coverage
        coverage_factor = min(1.0, len(context.items) / 3.0)

        # Factor 5: Conflict Penalty
        conflict_penalty = 0.10 if context.has_conflicts else 0.0

        # Weighted calculation
        raw_score = (
            (0.30 * retrieval_factor)
            + (0.30 * grounding_factor)
            + (0.20 * citation_factor)
            + (0.10 * coverage_factor)
            - conflict_penalty
        )
        final_score = round(max(0.0, min(1.0, raw_score)), 4)

        # Determine level
        if final_score >= 0.75:
            level = ConfidenceLevel.HIGH
        elif final_score >= 0.50:
            level = ConfidenceLevel.MEDIUM
        elif final_score >= settings.GENERATION_CONFIDENCE_THRESHOLD:
            level = ConfidenceLevel.LOW
        else:
            level = ConfidenceLevel.INSUFFICIENT

        return final_score, level
