"""Core AnswerGenerator orchestrating prompt delivery and structured response parsing."""

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from backend.app.config import get_settings
from backend.app.generation.exceptions import InvalidLLMResponseError
from backend.app.generation.models import (
    EvidenceContext,
    LLMAnswerPayload,
    LLMCitation,
)
from backend.app.generation.prompts import SYSTEM_PROMPT, PromptBuilder
from backend.app.generation.provider import LLMProvider, LLMResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class AnswerGenerator:
    """Manages prompt construction, model invocation, JSON validation, and fallback answers."""

    def __init__(self, provider: LLMProvider):
        self.provider = provider

    def _clean_json_content(self, text: str) -> str:
        """Strip markdown code fences and extraneous leading/trailing conversational text."""
        cleaned = text.strip()
        # Remove ```json ... ``` or ``` ... ``` wrappers
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        return cleaned.strip()

    def parse_payload(self, raw_content: str) -> LLMAnswerPayload:
        """Parse raw LLM output text into verified LLMAnswerPayload model."""
        cleaned = self._clean_json_content(raw_content)
        try:
            data = json.loads(cleaned)
            return LLMAnswerPayload.model_validate(data)
        except Exception as exc:
            logger.warning(f"Failed to parse LLM JSON output: {exc}. Raw preview: {raw_content[:200]}")
            raise InvalidLLMResponseError(f"Model output did not match valid JSON schema: {exc}") from exc

    def create_fallback_payload(
        self,
        context: EvidenceContext,
        language: str = "en",
        reason: str = "Direct evidence synthesis fallback",
    ) -> LLMAnswerPayload:
        """Generate a deterministic, grounded fallback answer directly from available evidence."""
        if not context.items or context.quality == "INSUFFICIENT":
            msg_en = "I could not find sufficient evidence in the available standards and documents to answer this reliably."
            msg_hi = "उपलब्ध मानकों और दस्तावेजों में इस प्रश्न का उत्तर देने के लिए पर्याप्त प्रमाण नहीं मिले।"
            msg_mr = "उपलब्ध मानके आणि कागदपत्रांमध्ये या प्रश्नाचे उत्तर देण्यासाठी पुरेसे पुरावे सापडले नाहीत."
            text = msg_hi if language == "hi" else (msg_mr if language == "mr" else msg_en)

            return LLMAnswerPayload(
                answer=text,
                confidence=0.10,
                evidence_used=[],
                citations=[],
                caveats=[reason],
                insufficient_evidence=True,
                follow_up_questions=[
                    "Would you like to search across historical or superseded standards?",
                    "Can you provide a specific Indian Standard number?",
                ],
                intent=context.intent,
            )

        # Build grounded summary from top items
        top_item = context.items[0]
        std = top_item.standard_number or "BIS Document"
        cls_num = top_item.clause_number or "Specification"
        content_preview = top_item.content.split("\n")[0]

        if language == "hi":
            answer_str = f"{std} के {cls_num} के अनुसार: {content_preview}। कृपया पूर्ण विवरण के लिए आधिकारिक मानक देखें।"
        elif language == "mr":
            answer_str = f"{std} च्या {cls_num} नुसार: {content_preview}. कृपया संपूर्ण तपशीलासाठी अधिकृत मानक पहा."
        else:
            answer_str = f"According to {std}, {cls_num}: {content_preview}. Requirements must be verified against the official standard document."

        citations = [
            LLMCitation(
                evidence_id=top_item.evidence_id,
                standard=std,
                clause=top_item.clause_number,
                pages=f"{top_item.page_start}–{top_item.page_end}" if top_item.page_start else None,
            )
        ]

        return LLMAnswerPayload(
            answer=answer_str,
            confidence=0.88,
            evidence_used=[top_item.evidence_id],
            citations=citations,
            caveats=[f"Synthesized via deterministic fallback ({reason})."],
            insufficient_evidence=False,
            follow_up_questions=[f"What are the test methods for {std}?"],
            intent=context.intent,
        )

    async def generate_answer(
        self,
        context: EvidenceContext,
        language: str = "en",
        regeneration_violations: Optional[List[str]] = None,
    ) -> Tuple[LLMAnswerPayload, LLMResponse]:
        """Execute prompt generation and parse LLM response, with fallback on failure."""
        user_prompt = PromptBuilder.build_user_prompt(context, language=language)

        if regeneration_violations:
            user_prompt = PromptBuilder.build_regeneration_prompt(user_prompt, regeneration_violations)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        try:
            llm_resp = await self.provider.generate(
                messages,
                temperature=settings.LLM_TEMPERATURE,
                max_tokens=settings.LLM_MAX_TOKENS,
                timeout=float(settings.LLM_TIMEOUT_SECONDS),
            )
            payload = self.parse_payload(llm_resp.content)
            return payload, llm_resp
        except Exception as exc:
            logger.warning(f"Generation error or parse failure: {exc}. Engaging deterministic fallback.")
            fallback_payload = self.create_fallback_payload(
                context,
                language=language,
                reason=f"Provider fallback triggered: {exc}",
            )
            dummy_resp = LLMResponse(
                content=json.dumps(fallback_payload.model_dump(), ensure_ascii=False),
                model="deterministic-fallback",
                provider="fallback",
                latency_ms=1.0,
            )
            return fallback_payload, dummy_resp
