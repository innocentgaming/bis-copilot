"""Citation validation and deterministic repair against retrieved evidence."""

import logging
from typing import Any, Dict, List
from backend.app.generation.models import (
    AnswerCitation,
    CitationValidationResult,
    EvidenceContext,
    LLMCitation,
)

logger = logging.getLogger(__name__)


class CitationValidator:
    """Validates and deterministically repairs generated citations against authentic evidence."""

    @classmethod
    def validate_citations(
        cls,
        citations: List[LLMCitation],
        context: EvidenceContext,
    ) -> CitationValidationResult:
        """Verify that every citation matches a genuine evidence chunk in the context.
        
        Args:
            citations: List of LLMCitation instances parsed from the model response.
            context: The authoritative EvidenceContext supplied to the model.
            
        Returns:
            CitationValidationResult with valid, repaired, and purged invalid citations.
        """
        evidence_by_id = {item.evidence_id: item for item in context.items}
        valid: List[Dict[str, Any]] = []
        invalid: List[Dict[str, Any]] = []
        repaired: List[Dict[str, Any]] = []
        warnings: List[str] = []

        for cite in citations:
            target_item = evidence_by_id.get(cite.evidence_id)

            if not target_item:
                # Evidence ID does not exist in context -> Attempt fuzzy match by standard + clause
                matched = False
                for item in context.items:
                    if (
                        cite.standard
                        and item.standard_number
                        and cite.standard.lower() in item.standard_number.lower()
                    ) or (
                        cite.clause
                        and item.clause_number
                        and cite.clause.lower() == item.clause_number.lower()
                    ):
                        target_item = item
                        matched = True
                        break

                if not matched:
                    invalid.append(cite.model_dump())
                    warnings.append(
                        f"Removed fabricated citation referencing nonexistent evidence ID '{cite.evidence_id}'."
                    )
                    continue

            # Target evidence exists: verify standard and clause attributes
            std_match = bool(
                not cite.standard
                or not target_item.standard_number
                or cite.standard.lower() in target_item.standard_number.lower()
                or target_item.standard_number.lower() in cite.standard.lower()
            )
            cls_match = bool(
                not cite.clause
                or not target_item.clause_number
                or cite.clause.lower() == target_item.clause_number.lower()
            )

            # Determine page range string from genuine chunk
            actual_pages = None
            if target_item.page_start and target_item.page_end:
                if target_item.page_start == target_item.page_end:
                    actual_pages = f"p. {target_item.page_start}"
                else:
                    actual_pages = f"pp. {target_item.page_start}–{target_item.page_end}"
            elif target_item.page_start:
                actual_pages = f"p. {target_item.page_start}"

            if std_match and cls_match:
                # Valid citation
                valid.append({
                    "evidence_id": target_item.evidence_id,
                    "standard": target_item.standard_number or "BIS Document",
                    "clause": target_item.clause_number,
                    "pages": actual_pages or cite.pages,
                    "chunk_id": target_item.chunk_id,
                    "document_id": target_item.document_id,
                    "relevance_score": target_item.relevance_score,
                    "citation_text": target_item.citation_text,
                })
            else:
                # Discrepancy -> Deterministic repair using ground truth evidence metadata
                repaired_entry = {
                    "evidence_id": target_item.evidence_id,
                    "standard": target_item.standard_number or "BIS Document",
                    "clause": target_item.clause_number,
                    "pages": actual_pages,
                    "chunk_id": target_item.chunk_id,
                    "document_id": target_item.document_id,
                    "relevance_score": target_item.relevance_score,
                    "citation_text": target_item.citation_text,
                }
                repaired.append(repaired_entry)
                valid.append(repaired_entry)
                warnings.append(
                    f"Repaired inaccurate citation for {target_item.evidence_id} to authentic standard metadata."
                )

        is_all_valid = len(invalid) == 0 and len(repaired) == 0
        return CitationValidationResult(
            is_valid=is_all_valid,
            repaired=len(repaired) > 0,
            valid_citations=valid,
            invalid_citations=invalid,
            repaired_citations=repaired,
            warnings=warnings,
        )

    @classmethod
    def to_answer_citations(cls, valid_citation_dicts: List[Dict[str, Any]]) -> List[AnswerCitation]:
        """Convert validated citation dicts into clean public AnswerCitation models."""
        answer_cites = []
        for c in valid_citation_dicts:
            answer_cites.append(
                AnswerCitation(
                    standard=c["standard"],
                    clause=c.get("clause"),
                    pages=c.get("pages"),
                    chunk_id=c.get("chunk_id"),
                    document_id=c.get("document_id"),
                    relevance_score=c.get("relevance_score"),
                    citation_text=c.get("citation_text", f"[{c['standard']}]"),
                )
            )
        return answer_cites
