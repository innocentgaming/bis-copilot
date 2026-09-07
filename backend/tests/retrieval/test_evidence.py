"""Unit tests for evidence packaging and serialization."""

import uuid
from backend.app.retrieval.evidence import EvidencePackager


def test_package_evidence():
    cid = uuid.uuid4()
    candidates = [
        {
            "chunk_id": cid,
            "content": "Specifies minimum breaking load.",
            "score": 0.92345,
            "standard_number": "IS 99999:2025",
            "clause_number": "5.1",
            "heading": "Mechanical Properties",
            "page_start": 6,
            "page_end": 7,
        }
    ]
    ev_list = EvidencePackager.package_evidence(candidates)
    assert len(ev_list) == 1
    ev = ev_list[0]
    assert ev.chunk_id == cid
    assert ev.standard_number == "IS 99999:2025"
    assert ev.clause_number == "5.1"
    assert ev.relevance_score == round(0.92345, 4)
    assert ev.content == "Specifies minimum breaking load."


def test_to_llm_context_dict():
    cid = uuid.uuid4()
    candidates = [
        {
            "chunk_id": cid,
            "content": "Specifies breaking load.",
            "score": 0.88,
            "standard_number": "IS 99999:2025",
            "clause_number": "5.1",
            "heading": "Properties",
            "page_start": 6,
            "page_end": 7,
        }
    ]
    ev_list = EvidencePackager.package_evidence(candidates)
    ctx = EvidencePackager.to_llm_context_dict(ev_list)
    assert ctx["evidence_count"] == 1
    assert ctx["items"][0]["standard"] == "IS 99999:2025"
    assert ctx["items"][0]["pages"] == [6, 7]
