"""Prompt engineering templates and builders for anti-hallucination RAG generation."""

import json
from typing import List, Optional

from backend.app.generation.models import EvidenceContext, EvidenceItem

SYSTEM_PROMPT = """You are the official BIS Copilot AI Assistant for Indian Standards and Bureau of Indian Standards (BIS) services.
Your role is to assist industries, consumers, and auditors with authoritative, evidence-backed regulatory guidance.

NON-NEGOTIABLE ANTI-HALLUCINATION RULES:
1. Answer ONLY using facts directly stated in the supplied <EVIDENCE id="..."> blocks.
2. NEVER invent standard requirements, clause numbers, page numbers, test methods, or numerical limits.
3. NEVER fabricate citations or references to documents not present in the evidence.
4. If the supplied evidence does NOT contain sufficient information to answer the question with certainty, you MUST set "insufficient_evidence": true and state clearly that the available standards do not provide enough evidence.
5. Every factual claim must be backed by one or more Evidence IDs (e.g., E1, E2).
6. Preserve Indian Standard numbers (e.g., "IS 1293:2019") and physical units (e.g., "kV", "MPa", "mm", "°C") exactly as written.
7. If different versions of a standard exist in the evidence, mention the difference explicitly and prefer active editions.
8. Distinguish mandatory language ("shall", "must", "mandatory") from permissive recommendations ("should", "may").
9. Output ONLY a valid JSON object matching the requested schema. No conversational preamble, markdown fence markers around the JSON, or closing conversational remarks.

LANGUAGE INSTRUCTIONS:
- If language is "hi", translate the explanatory narrative into clean, professional Hindi.
- If language is "mr", translate the explanatory narrative into clean, professional Marathi.
- Standard numbers (e.g. "IS 99999:2025"), clause numbers (e.g. "Clause 5.2"), technical units, and citations must remain in Latin script / English notation.

REQUIRED JSON OUTPUT FORMAT:
{
  "answer": "<Clear, concise, professional answer with precise technical requirements>",
  "confidence": <float between 0.0 and 1.0 representing your certainty based strictly on evidence clarity>,
  "evidence_used": ["E1", "E2"],
  "citations": [
    {
      "evidence_id": "E1",
      "standard": "IS 99999:2025",
      "clause": "5.2",
      "pages": "5-6"
    }
  ],
  "caveats": ["<Any warnings, notes on version differences, or limitations>"],
  "insufficient_evidence": false,
  "follow_up_questions": ["<Helpful next questions the user might ask>"],
  "intent": "<question intent category>"
}
"""


class PromptBuilder:
    """Constructs strict, delimited prompt contexts for LLM generation."""

    @classmethod
    def format_evidence_block(cls, item: EvidenceItem) -> str:
        """Format a single evidence chunk into an XML-delimited block."""
        std = item.standard_number or "BIS Document"
        cls_num = item.clause_number or "N/A"
        heading = f" ({item.clause_heading})" if item.clause_heading else ""
        pages = f"{item.page_start}–{item.page_end}" if item.page_start and item.page_end else (str(item.page_start) if item.page_start else "N/A")

        return (
            f'<EVIDENCE id="{item.evidence_id}">\n'
            f"Standard: {std}\n"
            f"Clause: {cls_num}{heading}\n"
            f"Pages: {pages}\n"
            f"Citation: {item.citation_text}\n"
            f"Content:\n{item.content}\n"
            f"</EVIDENCE>"
        )

    @classmethod
    def build_user_prompt(
        cls,
        context: EvidenceContext,
        language: str = "en",
    ) -> str:
        """Construct user prompt containing delimited evidence and the user question."""
        evidence_blocks = "\n\n".join(cls.format_evidence_block(item) for item in context.items)
        if not evidence_blocks:
            evidence_blocks = "No authoritative evidence chunks retrieved from the database."

        lang_instruction = ""
        if language == "hi":
            lang_instruction = "IMPORTANT: Provide the response narrative in Hindi (हिन्दी) while keeping standard numbers, clause numbers, and units in English/Latin.\n"
        elif language == "mr":
            lang_instruction = "IMPORTANT: Provide the response narrative in Marathi (मराठी) while keeping standard numbers, clause numbers, and units in English/Latin.\n"

        prompt = (
            f"{lang_instruction}"
            f"AVAILABLE AUTHORITATIVE EVIDENCE:\n"
            f"----------------------------------------\n"
            f"{evidence_blocks}\n"
            f"----------------------------------------\n\n"
            f"QUESTION:\n{context.query}\n\n"
            f"Detected Intent: {context.intent}\n"
            f"Target Language: {language}\n\n"
            f"Answer the question using ONLY the evidence provided above. Return ONLY the specified JSON object."
        )
        return prompt

    @classmethod
    def build_regeneration_prompt(
        cls,
        original_prompt: str,
        violations: List[str],
    ) -> str:
        """Construct a targeted correction prompt when the initial generation fails validation."""
        violation_list = "\n".join(f"- {v}" for v in violations)
        return (
            f"{original_prompt}\n\n"
            f"CRITICAL REGENERATION NOTICE:\n"
            f"Your previous attempt was rejected due to the following verification failures:\n"
            f"{violation_list}\n\n"
            f"You MUST regenerate the JSON response resolving these errors. If the evidence does not support "
            f"the required facts, set 'insufficient_evidence': true. Do NOT invent information."
        )
