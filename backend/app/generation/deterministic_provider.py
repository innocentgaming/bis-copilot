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
        match = re.search(r"Target Language:\s*([a-z]{2})", prompt, re.IGNORECASE)
        if match:
            lang = match.group(1).lower()
            if lang in ("en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "or"):
                return lang

        for code, name in [
            ("hi", "Hindi"),
            ("ta", "Tamil"),
            ("te", "Telugu"),
            ("bn", "Bengali"),
            ("mr", "Marathi"),
            ("gu", "Gujarati"),
            ("kn", "Kannada"),
            ("ml", "Malayalam"),
            ("pa", "Punjabi"),
            ("or", "Odia"),
        ]:
            if name.lower() in prompt.lower():
                return code
        return "en"

    def _generate_answer_json(self, prompt: str) -> str:
        """Synthesize answer JSON from prompt."""
        evidence_items = self._extract_evidence(prompt)
        lang = self._extract_language(prompt)

        insufficient_messages = {
            "en": "I could not find sufficient evidence in the available standards and documents to answer this reliably.",
            "hi": "उपलब्ध मानकों और दस्तावेजों में इस प्रश्न का उत्तर देने के लिए पर्याप्त प्रमाण नहीं मिले।",
            "ta": "கிடைக்கக்கூடிய தரநிலைகள் மற்றும் ஆவணங்களில் இதற்குப் பதிலளிக்க போதுமான சான்றுகள் கிடைக்கவில்லை.",
            "te": "అందుబాటులో ఉన్న ప్రమాణాలు మరియు పత్రాలలో దీనికి సమాధానం ఇవ్వడానికి తగిన ఆధారాలు లభించలేదు.",
            "bn": "উপলব্ধ মানদণ্ড এবং নথিপত্রে এই প্রশ্নের নির্ভরযোগ্য উত্তর দেওয়ার মতো পর্যাপ্ত প্রমাণ পাওয়া যায়নি।",
            "mr": "उपलब्ध मानके आणि कागदपत्रांमध्ये या प्रश्नाचे उत्तर देण्यासाठी पुरेसे पुरावे सापडले नाहीत.",
            "gu": "ઉપલબ્ધ ધોરણો અને દસ્તાવેજોમાં આનો વિશ્વસનીય જવાબ આપવા માટે પૂરતા પુરાવા મળ્યા નથી.",
            "kn": "ಲಭ್ಯವಿರುವ ಮಾನದಂಡಗಳು ಮತ್ತು ದಾಖಲೆಗಳಲ್ಲಿ ಇದಕ್ಕೆ ಉತ್ತರಿಸಲು ಸಾಕಷ್ಟು ಪುರಾವೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
            "ml": "ലഭ്യമായ മാനദണ്ഡങ്ങളിലും രേഖകളിലും ഇതിന് ഉത്തരം നൽകാൻ ആവശ്യമായ തെളിവുകൾ കണ്ടെത്താനായില്ല.",
            "pa": "ਉਪਲਬਧ ਮਾਪਦੰਡਾਂ ਅਤੇ ਦਸਤਾਵੇਜ਼ਾਂ ਵਿੱਚ ਇਸਦਾ ਭਰੋਸੇਯੋਗ ਜਵਾਬ ਦੇਣ ਲਈ ਕਾਫ਼ੀ ਸਬੂਤ ਨਹੀਂ ਮਿਲੇ।",
            "or": "ଉପଲବ୍ଧ ମାନକ ଏବଂ ଦଲିଲଗୁଡ଼ିକରେ ଏହାର ଉତ୍ତର ଦେବା ପାଇଁ ଯଥେଷ୍ଟ ପ୍ରମାଣ ମିଳିଲା ନାହିଁ।",
        }

        # Check if query indicates insufficient evidence
        if not evidence_items or "No authoritative evidence chunks" in prompt:
            chosen_msg = insufficient_messages.get(lang, insufficient_messages["en"])

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
            elif lang == "ta":
                first_line = (
                    f"{primary['standard']} ({title}) என்பது {section} பிரிவின் கீழ் வெளியிடப்பட்ட இந்திய தரநிலையாகும். "
                    f"நிலை: {status} (அறிவிக்கப்பட்ட ஆண்டு: {year}). "
                    f"நோக்கம்: {scope or applicable or 'தயாரிப்பு இணக்கத்தன்மை மற்றும் பாதுகாப்பு விவரக்குறிப்புகள்'}."
                )
            elif lang == "te":
                first_line = (
                    f"{primary['standard']} ({title}) అనేది {section} విభాగం క్రింద ప్రచురించబడిన భారతీయ ప్రమాణం. "
                    f"స్థితి: {status} (నోటిఫై చేయబడిన సంవత్సరం: {year}). "
                    f"పరిధి: {scope or applicable or 'ఉత్పత్తి అనుగుణ్యత మరియు భద్రతా నిర్దేశాలు'}."
                )
            elif lang == "bn":
                first_line = (
                    f"{primary['standard']} ({title}) হলো {section} বিভাগের অধীনে প্রকাশিত একটি ভারতীয় মানদণ্ড। "
                    f"স্থিতি: {status} (বিজ্ঞাপিত বছর: {year})। "
                    f"পরিধি: {scope or applicable or 'পণ্য সামঞ্জस्य এবং সুরক্ষা স্পেসিফিকেশন'}।"
                )
            elif lang == "gu":
                first_line = (
                    f"{primary['standard']} ({title}) એ {section} વિભાગ હેઠળ પ્રકાશિત ભારતીય ધોરણ છે. "
                    f"સ્થિતિ: {status} (સૂચિત વર્ષ: {year}). "
                    f"વ્યાપ: {scope or applicable or 'ઉત્પાદન સુસંગતતા અને સલામતી વિશિષ્ટતાઓ'}."
                )
            elif lang == "kn":
                first_line = (
                    f"{primary['standard']} ({title}) ಇದು {section} ವಿಭಾಗದ ಅಡಿಯಲ್ಲಿ ಪ್ರಕಟಿಸಲಾದ ಭಾರತೀಯ ಮಾನದಂಡವಾಗಿದೆ. "
                    f"ಸ್ಥಿತಿ: {status} (ಅಧಿಸೂಚಿತ ವರ್ಷ: {year}). "
                    f"ವ್ಯಾಪ್ತಿ: {scope or applicable or 'ಉತ್ಪನ್ನ ಅನುಸರಣೆ ಮತ್ತು ಸುರಕ್ಷತಾ ವಿವರಣೆಗಳು'}."
                )
            elif lang == "ml":
                first_line = (
                    f"{primary['standard']} ({title}) എന്നത് {section} വിഭാഗത്തിന് കീഴിൽ പ്രസിദ്ധീകരിച്ച ഇന്ത്യൻ മാനദണ്ഡമാണ്. "
                    f"നില: {status} (വിജ്ഞാപനം ചെയ്ത വർഷം: {year}). "
                    f"പരിധി: {scope or applicable or 'ഉൽപ്പന്ന അനുരൂപതയും സുരക്ഷാ മാനദണ്ഡങ്ങളും'}."
                )
            elif lang == "pa":
                first_line = (
                    f"{primary['standard']} ({title}) {section} ਡਿਵੀਜ਼ਨ ਅਧੀਨ ਪ੍ਰਕਾਸ਼ਿਤ ਇੱਕ ਭਾਰਤੀ ਮਾਪਦੰਡ ਹੈ। "
                    f"ਸਥਿਤੀ: {status} (ਨੋਟੀਫਾਈ ਸਾਲ: {year})। "
                    f"ਦਾਇਰਾ: {scope or applicable or 'ਉਤਪਾਦ ਅਨੁਕੂਲਤਾ ਅਤੇ ਸੁਰੱਖਿਆ ਨਿਰਧਾਰਨ'}।"
                )
            elif lang == "or":
                first_line = (
                    f"{primary['standard']} ({title}) ହେଉଛି {section} ବିଭାଗ ଅଧୀନରେ ପ୍ରକାଶିତ ଏକ ଭାରତୀୟ ମାନକ। "
                    f"ସ୍ଥିତି: {status} (ବର୍ଷ: {year})। "
                    f"ପରିସର: {scope or applicable or 'ଉତ୍ପାଦ ଅନୁରୂପତା ଏବଂ ସୁରକ୍ଷା ନିର୍ଦ୍ଦେଶାବଳୀ'}।"
                )
            else:
                first_line = (
                    f"{primary['standard']} is titled '{title}', published under the {section} Sectional Division "
                    f"with current status '{status}' (Notified: {year}). "
                    f"Scope: {scope or applicable or 'Product conformity assessment and safety specifications'}."
                )
        else:
            first_line = content_lines[0] if content_lines else primary["content"]

        closing_phrases = {
            "en": f"According to the official BIS Standards repository: {first_line} Verify requirements and conformity procedures against the latest gazetted specification.",
            "hi": f"{primary['standard']} के अनुसार: {first_line} विस्तृत जानकारी के लिए आधिकारिक बीआईएस दस्तावेज देखें।",
            "ta": f"{primary['standard']} இன் படி: {first_line} விரிவான தகவல்களுக்கு அதிகாரப்பூர்வ BIS ஆவணத்தைப் பார்க்கவும்.",
            "te": f"{primary['standard']} ప్రకారం: {first_line} వివరాల కోసం అధికారిక BIS పత్రాలను చూడండి.",
            "bn": f"{primary['standard']} অনুসারে: {first_line} বিস্তারিত তথ্যের জন্য অফিসিয়াল বিআইএস নথি দেখুন।",
            "mr": f"{primary['standard']} नुसार: {first_line} सविस्तर माहितीसाठी अधिकृत बीआयएस दस्तऐवज पहा.",
            "gu": f"{primary['standard']} મુજબ: {first_line} વિગતવાર માહિતી માટે અધિકૃત બીઆઈએસ દસ્તાવેજ જુઓ.",
            "kn": f"{primary['standard']} ಪ್ರಕಾರ: {first_line} ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಅಧಿಕೃತ ಬಿಐಎಸ್ ದಾಖಲೆಯನ್ನು ನೋಡಿ.",
            "ml": f"{primary['standard']} അനുസരിച്ച്: {first_line} കൂടുതൽ വിവരങ്ങൾക്ക് ഔദ്യോഗിക BIS രേഖ പരിശോധിക്കുക.",
            "pa": f"{primary['standard']} ਅਨੁਸਾਰ: {first_line} ਵਿਸਤ੍ਰਿਤ ਜਾਣਕਾਰੀ ਲਈ ਅਧਿਕਾਰਤ ਬੀਆਈਐਸ ਦਸਤਾਵੇਜ਼ ਵੇਖੋ।",
            "or": f"{primary['standard']} ଅନୁସାରେ: {first_line} ବିସ୍ତୃତ ସୂଚନା ପାଇଁ ଅଫିସିଆଲ୍ ବିଆଇଏସ୍ ଦଲିଲ ଦେଖନ୍ତୁ।",
        }
        answer_text = closing_phrases.get(lang, closing_phrases["en"])

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
            sec_phrases = {
                "en": f" Additionally, {sec['clause']} specifies: {sec_line}.",
                "hi": f" इसके अतिरिक्त, {sec['clause']} निर्दिष्ट करता है: {sec_line}।",
                "ta": f" மேலும், {sec['clause']} குறிப்பிடுகிறது: {sec_line}.",
                "te": f" అదనంగా, {sec['clause']} పేర్కొంటుంది: {sec_line}.",
                "bn": f" অতিরিক্তভাবে, {sec['clause']} নির্দিষ্ট করে: {sec_line}।",
                "mr": f" याव्यतिरिक्त, {sec['clause']} नमूद करते: {sec_line}.",
                "gu": f" આ ઉપરાંત, {sec['clause']} સ્પષ્ટ કરે છે: {sec_line}.",
                "kn": f" ಹೆಚ್ಚುವರಿಯಾಗಿ, {sec['clause']} ನಿರ್ದಿಷ್ಟಪಡಿಸುತ್ತದೆ: {sec_line}.",
                "ml": f" കൂടാതെ, {sec['clause']} വ്യക്തമാക്കുന്നു: {sec_line}.",
                "pa": f" ਇਸ ਤੋਂ ਇਲਾਵਾ, {sec['clause']} ਨਿਰਧਾਰਤ ਕਰਦਾ ਹੈ: {sec_line}।",
                "or": f" ଏହା ବ୍ୟତୀତ, {sec['clause']} ନିର୍ଦ୍ଦିଷ୍ଟ କରେ: {sec_line}।",
            }
            answer_text += sec_phrases.get(lang, sec_phrases["en"])

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
