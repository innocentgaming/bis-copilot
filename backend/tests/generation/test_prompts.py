"""Unit tests for prompt formatting and delimiter templates."""

import uuid
from backend.app.generation.models import EvidenceContext, EvidenceItem
from backend.app.generation.prompts import PromptBuilder


def test_format_evidence_block():
    cid = uuid.uuid4()
    item = EvidenceItem(
        evidence_id="E1",
        chunk_id=cid,
        content="Dielectric strength must exceed 2500 V.",
        standard_number="IS 99999:2025",
        clause_number="7.1",
        clause_heading="Dielectric Properties",
        page_start=8,
        page_end=9,
        relevance_score=0.95,
        citation_text="[IS 99999:2025, Clause 7.1, pp. 8–9]",
    )
    block = PromptBuilder.format_evidence_block(item)
    assert '<EVIDENCE id="E1">' in block
    assert "Standard: IS 99999:2025" in block
    assert "Clause: 7.1 (Dielectric Properties)" in block
    assert "Pages: 8–9" in block
    assert "Content:\nDielectric strength must exceed 2500 V." in block
    assert "</EVIDENCE>" in block


def test_build_user_prompt_multilingual():
    ctx = EvidenceContext(query="What is the test voltage?", intent="test_method")
    all_langs = ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "or"]
    for lang in all_langs:
        prompt = PromptBuilder.build_user_prompt(ctx, language=lang)
        assert f"Target Language: {lang}" in prompt
        if lang != "en":
            assert "CRITICAL MULTILINGUAL DIRECTIVE:" in prompt


def test_build_regeneration_prompt():
    orig = "ORIGINAL PROMPT CONTENT"
    violations = [
        "Answer contains ungrounded value '999'.",
        "Removed fabricated citation referencing nonexistent evidence ID 'E99'.",
    ]
    regen = PromptBuilder.build_regeneration_prompt(orig, violations)
    assert "CRITICAL REGENERATION NOTICE:" in regen
    assert "Answer contains ungrounded value '999'." in regen
    assert "Removed fabricated citation" in regen
