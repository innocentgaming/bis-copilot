"""Deterministic provider generating reproducible, evidence-grounded answers without external APIs."""

import asyncio
import json
import re
import time
from typing import AsyncIterator, Dict, List, Optional

from backend.app.generation.provider import LLMProvider, LLMResponse


class DeterministicLLMProvider(LLMProvider):
    """Generates deterministic answers directly from supplied evidence without network calls.
    
    Used for offline CI/CD, deterministic unit testing, and robust system fallbacks.
    """

    def __init__(self, model_name: str = "deterministic-engine-v1"):
        self.model_name = model_name

    def _extract_evidence(self, prompt: str) -> List[Dict[str, str]]:
        """Extract evidence blocks from prompt text."""
        pattern = re.compile(
            r'<EVIDENCE id="([^"]+)">\s*'
            r'Standard:\s*([^\n]+)\n'
            r'Clause:\s*([^\n]+)\n'
            r'Pages:\s*([^\n]+)\n'
            r'Citation:\s*([^\n]+)\n'
            r'Content:\s*(.*?)\s*</EVIDENCE>',
            re.DOTALL | re.IGNORECASE,
        )
        matches = pattern.findall(prompt)
        items = []
        for eid, std, cls_num, pages, cite, content in matches:
            items.append({
                "evidence_id": eid.strip(),
                "standard": std.strip(),
                "clause": cls_num.strip(),
                "pages": pages.strip(),
                "citation": cite.strip(),
                "content": content.strip(),
            })
        return items

    def _extract_language(self, prompt: str) -> str:
        """Detect language directive in prompt."""
        if "Hindi (हिन्दी)" in prompt or "Target Language: hi" in prompt:
            return "hi"
        if "Marathi (मराठी)" in prompt or "Target Language: mr" in prompt:
            return "mr"
        return "en"

    def _generate_answer_json(self, prompt: str) -> str:
        """Synthesize answer JSON from prompt."""
        evidence_items = self._extract_evidence(prompt)
        lang = self._extract_language(prompt)

        # Check if query indicates insufficient evidence
        if not evidence_items or "No authoritative evidence chunks" in prompt:
            msg_en = "I could not find sufficient evidence in the available standards and documents to answer this reliably."
            msg_hi = "उपलब्ध मानकों और दस्तावेजों में इस प्रश्न का उत्तर देने के लिए पर्याप्त प्रमाण नहीं मिले।"
            msg_mr = "उपलब्ध मानके आणि कागदपत्रांमध्ये या प्रश्नाचे उत्तर देण्यासाठी पुरेसे पुरावे सापडले नाहीत."
            chosen_msg = msg_hi if lang == "hi" else (msg_mr if lang == "mr" else msg_en)

            payload = {
                "answer": chosen_msg,
                "confidence": 0.1,
                "evidence_used": [],
                "citations": [],
                "caveats": ["No relevant document chunks found in database matching search criteria."],
                "insufficient_evidence": True,
                "follow_up_questions": [
                    "Would you like to search across historical or superseded standards?",
                    "Can you provide a specific Indian Standard number (e.g. IS 1293)?",
                ],
                "intent": "general",
            }
            return json.dumps(payload, ensure_ascii=False)

        # Extract primary facts from top evidence items (up to 2)
        primary = evidence_items[0]
        used_ids = [primary["evidence_id"]]
        citations = [
            {
                "evidence_id": primary["evidence_id"],
                "standard": primary["standard"],
                "clause": primary["clause"],
                "pages": primary["pages"],
            }
        ]

        # Extract clean statement from evidence content
        content_lines = [l.strip() for l in primary["content"].split("\n") if l.strip()]
        has_metadata = any(l.startswith(("Title:", "Sectional Division:", "Status:", "Year Notified:", "Section:")) for l in content_lines)
        if has_metadata:
            meta_dict = {}
            for l in content_lines:
                if ":" in l:
                    k, v = l.split(":", 1)
                    meta_dict[k.strip()] = v.strip()
            title = meta_dict.get("Title", "")
            section = meta_dict.get("Sectional Division", meta_dict.get("Section", ""))
            year = meta_dict.get("Year Notified", meta_dict.get("Year", ""))
            status = meta_dict.get("Status", "Active")
            scope = meta_dict.get("Scope & Description", meta_dict.get("Scope", ""))
            applicable = meta_dict.get("Applicable To", "")

            if lang == "hi":
                first_line = (
                    f"{primary['standard']} ({title}) {section} प्रभाग के अंतर्गत एक भारतीय मानक है। "
                    f"स्थिति: {status} (अधिसूचना वर्ष: {year})। "
                    f"विस्तार: {scope or applicable or 'उत्पाद अनुरूपता एवं गुणवत्ता विनिर्देश'}।"
                )
            elif lang == "mr":
                first_line = (
                    f"{primary['standard']} ({title}) हे {section} विभागांतर्गत भारतीय मानक आहे. "
                    f"स्थिती: {status} (वर्ष: {year}). "
                    f"व्याप्ती: {scope or applicable or 'उत्पादन गुणवत्ता आणि नियम'}."
                )
            else:
                first_line = (
                    f"{primary['standard']} is titled '{title}', published under the {section} Sectional Division "
                    f"with current status '{status}' (Notified: {year}). "
                    f"Scope: {scope or applicable or 'Product conformity assessment and safety specifications'}."
                )
        else:
            first_line = content_lines[0] if content_lines else primary["content"]

        if lang == "hi":
            answer_text = (
                f"{primary['standard']} के अनुसार: {first_line} "
                f"विस्तृत जानकारी के लिए आधिकारिक बीआईएस दस्तावेज देखें।"
            )
        elif lang == "mr":
            answer_text = (
                f"{primary['standard']} नुसार: {first_line} "
                f"सविस्तर माहितीसाठी अधिकृत बीआयएस दस्तऐवज पहा."
            )
        else:
            answer_text = (
                f"According to the official BIS Standards repository: {first_line} "
                f"Verify requirements and conformity procedures against the latest gazetted specification."
            )

        # If a second evidence chunk exists, incorporate it
        if len(evidence_items) > 1:
            sec = evidence_items[1]
            used_ids.append(sec["evidence_id"])
            citations.append({
                "evidence_id": sec["evidence_id"],
                "standard": sec["standard"],
                "clause": sec["clause"],
                "pages": sec["pages"],
            })
            sec_line = [l.strip() for l in sec["content"].split("\n") if l.strip()][0]
            if lang == "hi":
                answer_text += f" इसके अतिरिक्त, {sec['clause']} निर्दिष्ट करता है: {sec_line}।"
            elif lang == "mr":
                answer_text += f" याव्यतिरिक्त, {sec['clause']} नमूद करते: {sec_line}."
            else:
                answer_text += f" Additionally, {sec['clause']} specifies: {sec_line}."

        payload = {
            "answer": answer_text,
            "confidence": 0.92,
            "evidence_used": used_ids,
            "citations": citations,
            "caveats": ["Answer grounded strictly in verified database chunks."],
            "insufficient_evidence": False,
            "follow_up_questions": [
                f"What are the testing requirements for {primary['standard']}?",
                "Which laboratories are recognized for this certification?",
            ],
            "intent": "requirement_question",
        }
        return json.dumps(payload, ensure_ascii=False)

    async def generate(
        self,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.0,
        max_tokens: int = 1500,
        timeout: float = 30.0,
    ) -> LLMResponse:
        t0 = time.perf_counter()
        user_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        content = self._generate_answer_json(user_msg)
        latency = (time.perf_counter() - t0) * 1000

        return LLMResponse(
            content=content,
            model=self.model_name,
            provider="deterministic",
            input_tokens=len(user_msg.split()),
            output_tokens=len(content.split()),
            total_tokens=len(user_msg.split()) + len(content.split()),
            finish_reason="stop",
            latency_ms=round(latency, 2),
            raw_response={"mode": "deterministic_synthesis"},
        )

    async def stream_generate(
        self,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.0,
        max_tokens: int = 1500,
        timeout: float = 30.0,
    ) -> AsyncIterator[str]:
        user_msg = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        content = self._generate_answer_json(user_msg)
        # Stream in 15-character chunks
        for i in range(0, len(content), 15):
            yield content[i : i + 15]
            await asyncio.sleep(0.005)
