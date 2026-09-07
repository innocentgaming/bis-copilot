"""Evidence context builder transforming Phase 3 retrieval outputs for LLM prompting."""

import re
from typing import Any, Dict, List, Optional
from uuid import UUID

from backend.app.config import get_settings
from backend.app.generation.models import EvidenceContext, EvidenceItem
from backend.app.retrieval.models import RetrievalResponse

settings = get_settings()


class EvidenceContextBuilder:
    """Transforms, curates, and filters retrieved chunks into a strict evidence context."""

    @classmethod
    def build_context(
        cls,
        retrieval_response: RetrievalResponse,
        max_chunks: int = settings.GENERATION_MAX_CONTEXT_CHUNKS,
        min_score: float = settings.GENERATION_MIN_RELEVANCE_SCORE,
    ) -> EvidenceContext:
        """Construct a validated EvidenceContext from Phase 3 RetrievalResponse.
        
        Args:
            retrieval_response: Raw response object from RetrievalService.retrieve()
            max_chunks: Maximum number of evidence items to supply to the prompt
            min_score: Minimum relevance score threshold to retain an item
            
        Returns:
            EvidenceContext with enumerated evidence tokens (E1, E2, ...) and conflict flags.
        """
        items: List[EvidenceItem] = []
        warnings: List[str] = list(retrieval_response.warnings)

        # Pair results with citations if available
        results = retrieval_response.results
        citations = retrieval_response.citations

        # Step 1: Filter by relevance score
        qualified_results = [r for r in results if r.score >= min_score]
        if len(qualified_results) < len(results):
            warnings.append(
                f"Filtered {len(results) - len(qualified_results)} chunks below min relevance score {min_score}"
            )

        # Step 2: Slice to max context limit
        selected_results = qualified_results[:max_chunks]

        # Step 3: Map into enumerated EvidenceItem list
        family_editions: Dict[str, set] = {}
        has_conflicts = False

        # First pass to index standard families and detect conflicts
        for res in selected_results:
            std_num = res.standard_number or "BIS Document"
            prefix_match = re.match(r"(IS\s+\d+)", std_num, re.IGNORECASE)
            if prefix_match:
                prefix = prefix_match.group(1).upper()
                if prefix not in family_editions:
                    family_editions[prefix] = set()
                family_editions[prefix].add(std_num.upper())

        for prefix, eds in family_editions.items():
            if len(eds) > 1:
                has_conflicts = True
                warnings.append(
                    f"Detected multiple versions or editions for {prefix} in evidence: {', '.join(sorted(eds))}"
                )

        for idx, res in enumerate(selected_results, start=1):
            evidence_id = f"E{idx}"
            std_num = res.standard_number or "BIS Document"

            # Locate matching citation text or build default
            matching_cite = next((c for c in citations if c.chunk_id == res.chunk_id), None)
            cite_text = matching_cite.citation_text if matching_cite else f"[{std_num}]"

            item = EvidenceItem(
                evidence_id=evidence_id,
                chunk_id=res.chunk_id,
                content=res.content.strip(),
                standard_number=res.standard_number,
                standard_title=res.metadata.get("standard_title") if res.metadata else None,
                clause_number=res.clause_number,
                clause_heading=res.heading,
                page_start=res.page_start,
                page_end=res.page_end,
                document_id=res.document_id,
                document_name=res.metadata.get("document_name") if res.metadata else None,
                relevance_score=res.score,
                retrieval_method=res.metadata.get("retrieval_source", "hybrid") if res.metadata else "hybrid",
                citation_text=cite_text,
            )
            items.append(item)

        # Step 4: Evaluate overall evidence quality
        if not items:
            quality = "INSUFFICIENT"
        elif items[0].relevance_score < 0.35:
            quality = "WEAK"
        else:
            quality = "GOOD"

        # Determine query intent
        intent = "general"
        if retrieval_response.debug_info and "detected_intent" in retrieval_response.debug_info:
            intent = retrieval_response.debug_info["detected_intent"]

        return EvidenceContext(
            query=retrieval_response.query,
            intent=intent,
            items=items,
            total_items=len(items),
            quality=quality,
            has_conflicts=has_conflicts,
            warnings=warnings,
        )
