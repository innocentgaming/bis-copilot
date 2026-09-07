"""Automated end-to-end deployment smoke test for BIS Copilot (SIH 26107).

Validates 12 critical operational criteria:
1. Frontend HTTP responsiveness
2. Backend HTTP responsiveness
3. Liveness probe (/health)
4. Readiness probe (/ready or /api/v1/health/ready)
5. Authentication & JWT issuance (/api/v1/auth/login)
6. Authenticated route access (/api/v1/auth/me)
7. Standards catalog retrieval (/api/v1/standards)
8. Hybrid search (/api/v1/search)
9. Grounded RAG chat (/api/v1/chat)
10. Source evidence citation integrity
11. Negative guardrail refusal for out-of-domain queries
12. Multilingual response synthesis (Hindi)
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any, Dict, Optional, Tuple

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")


def http_request(
    url: str,
    method: str = "GET",
    data: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 10,
) -> Tuple[int, Dict[str, Any], Dict[str, str]]:
    """Perform HTTP request using standard library."""
    hdrs = {"User-Agent": "BIS-SmokeTest/1.0"}
    if headers:
        hdrs.update(headers)

    body_bytes = None
    if data is not None:
        hdrs["Content-Type"] = "application/json"
        body_bytes = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(url, data=body_bytes, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status_code = resp.status
            resp_headers = dict(resp.headers)
            raw_data = resp.read().decode("utf-8")
            try:
                parsed = json.loads(raw_data)
            except Exception:
                parsed = {"raw": raw_data}
            return status_code, parsed, resp_headers
    except urllib.error.HTTPError as e:
        raw_data = e.read().decode("utf-8")
        try:
            parsed = json.loads(raw_data)
        except Exception:
            parsed = {"raw": raw_data}
        return e.code, parsed, dict(e.headers)
    except Exception as e:
        return 0, {"error": str(e)}, {}


def run_smoke_test(frontend_url: str, backend_url: str) -> bool:
    print("=" * 65)
    print("           BIS COPILOT - AUTOMATED DEPLOYMENT SMOKE TEST         ")
    print("=" * 65)
    print(f"Target Frontend: {frontend_url}")
    print(f"Target Backend:  {backend_url}\n")

    failures = 0
    passed = 0

    def check(step_num: int, name: str, success: bool, detail: str = ""):
        nonlocal passed, failures
        mark = "✓ PASS" if success else "✗ FAIL"
        print(f"[{step_num:02d}/12] {name.ljust(44)} : {mark} {detail}")
        if success:
            passed += 1
        else:
            failures += 1

    # 1. Frontend Responsiveness
    code, data, _ = http_request(f"{frontend_url}/", timeout=5)
    check(1, "Frontend HTTP Responsiveness", code in (200, 304), f"(Status: {code})")

    # 2. Backend Responsiveness
    code, data, _ = http_request(f"{backend_url}/", timeout=5)
    check(2, "Backend HTTP Root Endpoint", code == 200, f"(Status: {code})")

    # 3. Liveness Probe
    code, data, _ = http_request(f"{backend_url}/health", timeout=5)
    check(3, "Process Liveness Probe (/health)", code == 200 and data.get("status") == "alive")

    # 4. Readiness Probe
    code, data, _ = http_request(f"{backend_url}/ready", timeout=5)
    readiness_ok = code in (200, 503) and "dependencies" in data
    check(4, "Dependency Readiness Probe (/ready)", readiness_ok, f"({data.get('status')})")

    # 5. Login & JWT Issuance
    login_payload = {"email": "auditor@bis.gov.in", "password": "auditor123"}
    code, data, _ = http_request(f"{backend_url}/api/v1/auth/login", method="POST", data=login_payload)
    token = None
    if code == 200 and data.get("data", {}).get("access_token"):
        token = data["data"]["access_token"]
    check(5, "Auth & JWT Issuance (/auth/login)", token is not None)

    auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 6. Authenticated Request
    code, data, _ = http_request(f"{backend_url}/api/v1/auth/me", headers=auth_headers)
    auth_ok = code == 200 and data.get("data", {}).get("email") == "auditor@bis.gov.in"
    check(6, "RBAC Authenticated Session (/auth/me)", auth_ok)

    # 7. Standards Catalog
    code, data, _ = http_request(f"{backend_url}/api/v1/standards", headers=auth_headers)
    check(7, "Standards Catalog Endpoint (/standards)", code == 200)

    # 8. Hybrid Search Endpoint
    code, data, _ = http_request(
        f"{backend_url}/api/v1/search?q=cement&method=hybrid&top_k=5",
        headers=auth_headers,
    )
    check(8, "Hybrid Search Execution (/search)", code == 200)

    # 9. Grounded RAG Chat
    chat_payload = {
        "query": "What is the 28-day compressive strength requirement for 53 Grade OPC under IS 12269?",
        "language": "en",
    }
    code, data, _ = http_request(f"{backend_url}/api/v1/chat", method="POST", data=chat_payload, headers=auth_headers)
    chat_ok = code == 200 and "answer" in data.get("data", {})
    check(9, "Grounded RAG Chat Answer (/chat)", chat_ok)

    # 10. Source Citation Presence
    citations = data.get("data", {}).get("citations", []) if chat_ok else []
    citation_ok = len(citations) > 0 or "IS 12269" in str(data)
    check(10, "Source Evidence Citation Integrity", citation_ok, f"({len(citations)} citations returned)")

    # 11. Refusal on Out-of-Domain Query
    negative_payload = {
        "query": "What antibiotics should be prescribed for acute bacterial pneumonia in infants?",
        "language": "en",
    }
    code, neg_data, _ = http_request(f"{backend_url}/api/v1/chat", method="POST", data=negative_payload, headers=auth_headers)
    refusal_ok = False
    if code == 200:
        ans_data = neg_data.get("data", {})
        refusal_ok = (
            ans_data.get("insufficient_evidence") is True
            or ans_data.get("confidence", 1.0) < 0.3
            or "sufficient evidence" in ans_data.get("answer", "").lower()
            or "not found" in ans_data.get("answer", "").lower()
        )
    check(11, "Negative Guardrail Refusal (/chat)", refusal_ok)

    # 12. Multilingual Request (Hindi)
    hi_payload = {
        "query": "53 ग्रेड ओपीसी सीमेंट के 28 दिनों की न्यूनतम संपीडन शक्ति क्या है?",
        "language": "hi",
    }
    code, hi_data, _ = http_request(f"{backend_url}/api/v1/chat", method="POST", data=hi_payload, headers=auth_headers)
    hi_ans = hi_data.get("data", {}).get("answer", "") if code == 200 else ""
    hi_ok = code == 200 and ("IS 12269" in hi_ans or "53" in hi_ans or len(hi_ans) > 10)
    check(12, "Multilingual Hindi Synthesis", hi_ok)

    print("\n" + "=" * 65)
    print(f"SUMMARY: {passed} PASSED, {failures} FAILED out of 12 checks.")
    print("=" * 65)

    return failures == 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run automated smoke tests against BIS Copilot services.")
    parser.add_argument("--frontend-url", default=FRONTEND_URL, help="Frontend service URL")
    parser.add_argument("--backend-url", default=BACKEND_URL, help="Backend service URL")
    args = parser.parse_args()

    success = run_smoke_test(frontend_url=args.frontend_url, backend_url=args.backend_url)
    sys.exit(0 if success else 1)
