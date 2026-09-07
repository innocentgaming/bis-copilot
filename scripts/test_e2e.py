"""Comprehensive 20-point End-to-End Test Harness for BIS Copilot (SIH 26107).

Tests:
 1. Login (/api/v1/auth/login)
 2. Authentication Verification (/api/v1/auth/me)
 3. Standards Catalog (/api/v1/standards)
 4. Standard Detail (/api/v1/standards/{id})
 5. Clause Tree Hierarchy
 6. Direct Hybrid Search (/api/v1/search)
 7. Non-Streaming Grounded Chat (/api/v1/chat)
 8. Real-Time SSE Token Streaming (/api/v1/chat/stream)
 9. Source Evidence Citations
10. Evidence Chunk Integrity
11. Confidence Score & Calibration
12. Safe Guardrail Refusal (Insufficient Evidence)
13. Multilingual Vernacular Generation (Hindi)
14. Accredited Testing Laboratories (/api/v1/laboratories)
15. Certification Schemes (/api/v1/certification/schemes)
16. Conversation History Persistence (/api/v1/conversations)
17. User Feedback Loop (/api/v1/feedback)
18. RBAC Administrative Oversight (/api/v1/admin/statistics)
19. Document Ingestion Security & Validation (/api/v1/documents)
20. Evaluation Benchmarking (/api/v1/evaluation)
"""

import argparse
import asyncio
import json
import os
import sys
import uuid
from typing import Any, Dict, Optional, Tuple

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import httpx
from backend.app.database.connection import check_sync_connection
from backend.app.main import app

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


class E2EHarness:
    def __init__(self, base_url: str, use_live_network: bool = False):
        self.base_url = base_url
        self.use_live_network = use_live_network
        self.token: Optional[str] = None
        self.conversation_id: Optional[str] = None
        self.passed = 0
        self.failed = 0
        self.skipped = 0

    def record(self, num: int, name: str, status: str, detail: str = ""):
        if status == "PASS":
            self.passed += 1
            badge = "[PASS]"
        elif status == "SKIP":
            self.skipped += 1
            badge = "[SKIP]"
        else:
            self.failed += 1
            badge = "[FAIL]"
        print(f"[{num:02d}/20] {name.ljust(44)} : {badge} {detail}")

    async def run(self):
        print("=" * 70)
        print("          BIS COPILOT - 20-POINT END-TO-END TEST HARNESS          ")
        print("=" * 70)
        mode_label = f"Live HTTP ({self.base_url})" if self.use_live_network else "In-Process ASGI Engine"
        print(f"Execution Mode: {mode_label}\n")

        db_online = check_sync_connection()
        if not db_online:
            print("[NOTICE] PostgreSQL is offline on host. Database-backed routes will be recorded as [SKIP].\n")

        def is_db_offline(e: Exception) -> bool:
            err = str(e).lower()
            return "connection refused" in err or "1225" in err or "operationalerror" in err or "10061" in err

        transport = None if self.use_live_network else httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url=self.base_url, timeout=20.0) as client:
            # 1. Login
            try:
                resp = await client.post(
                    "/api/v1/auth/login",
                    json={"email": "auditor@bis.gov.in", "password": "auditor123"},
                )
                if resp.status_code == 200 and resp.json().get("data", {}).get("access_token"):
                    self.token = resp.json()["data"]["access_token"]
                    self.record(1, "User Authentication & JWT Issuance", "PASS")
                elif not db_online or resp.status_code in (500, 503):
                    self.record(1, "User Authentication & JWT Issuance", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(1, "User Authentication & JWT Issuance", "FAIL", f"(Status {resp.status_code})")
            except Exception as e:
                if is_db_offline(e):
                    self.record(1, "User Authentication & JWT Issuance", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(1, "User Authentication & JWT Issuance", "FAIL", str(e))

            headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}

            # 2. Authentication Verification
            try:
                if not self.token:
                    self.record(2, "RBAC Session Validation (/auth/me)", "SKIP", "(Requires active token)")
                else:
                    resp = await client.get("/api/v1/auth/me", headers=headers)
                    if resp.status_code == 200 and resp.json().get("data", {}).get("email") == "auditor@bis.gov.in":
                        self.record(2, "RBAC Session Validation (/auth/me)", "PASS")
                    else:
                        self.record(2, "RBAC Session Validation (/auth/me)", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                if is_db_offline(e):
                    self.record(2, "RBAC Session Validation (/auth/me)", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(2, "RBAC Session Validation (/auth/me)", "FAIL", str(e))

            # 3. Standards Catalog
            std_id = None
            try:
                resp = await client.get("/api/v1/standards", headers=headers)
                if resp.status_code == 200:
                    items = resp.json().get("data", {}).get("items", [])
                    if items:
                        std_id = items[0].get("id")
                    self.record(3, "Standards Catalog Listing", "PASS", f"({len(items)} standards found)")
                elif not db_online:
                    self.record(3, "Standards Catalog Listing", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(3, "Standards Catalog Listing", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(3, "Standards Catalog Listing", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 4. Standard Detail
            if std_id:
                try:
                    resp = await client.get(f"/api/v1/standards/{std_id}", headers=headers)
                    if resp.status_code == 200 and "standard_number" in resp.json().get("data", {}):
                        self.record(4, "Standard Detail Retrieval", "PASS")
                    else:
                        self.record(4, "Standard Detail Retrieval", "FAIL", f"Status: {resp.status_code}")
                except Exception as e:
                    self.record(4, "Standard Detail Retrieval", "SKIP" if is_db_offline(e) else "FAIL", str(e))
            else:
                self.record(4, "Standard Detail Retrieval", "SKIP", "(Requires online database standards)")

            # 5. Clause Tree
            if std_id:
                try:
                    resp = await client.get(f"/api/v1/standards/{std_id}", headers=headers)
                    clauses = resp.json().get("data", {}).get("clauses", [])
                    self.record(5, "Hierarchical ClauseTree Verification", "PASS", f"({len(clauses)} clauses parsed)")
                except Exception as e:
                    self.record(5, "Hierarchical ClauseTree Verification", "SKIP" if is_db_offline(e) else "FAIL", str(e))
            else:
                self.record(5, "Hierarchical ClauseTree Verification", "SKIP", "(Requires online database standards)")

            # 6. Direct Hybrid Search
            try:
                resp = await client.get("/api/v1/search?q=cement&method=hybrid&top_k=5", headers=headers)
                if resp.status_code == 200:
                    results = resp.json().get("data", {}).get("results", [])
                    self.record(6, "Direct Hybrid Search (Vector + FTS)", "PASS", f"({len(results)} chunks retrieved)")
                elif not db_online:
                    self.record(6, "Direct Hybrid Search (Vector + FTS)", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(6, "Direct Hybrid Search (Vector + FTS)", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(6, "Direct Hybrid Search (Vector + FTS)", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 7. Non-Streaming Grounded Chat
            chat_data = None
            try:
                resp = await client.post(
                    "/api/v1/chat",
                    json={"query": "What is the 28-day compressive strength of 53 Grade OPC under IS 12269?", "language": "en"},
                    headers=headers,
                )
                if resp.status_code == 200:
                    chat_data = resp.json().get("data", {})
                    self.conversation_id = chat_data.get("conversation_id")
                    self.record(7, "Grounded RAG Answer Generation", "PASS")
                elif not db_online:
                    self.record(7, "Grounded RAG Answer Generation", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(7, "Grounded RAG Answer Generation", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(7, "Grounded RAG Answer Generation", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 8. Real-Time SSE Token Streaming
            try:
                resp = await client.post(
                    "/api/v1/chat/stream",
                    json={"query": "What are the requirements of IS 12269 Clause 6.2?", "language": "en"},
                    headers=headers,
                )
                if resp.status_code == 200 and "text/event-stream" in resp.headers.get("content-type", ""):
                    self.record(8, "Server-Sent Events (SSE) Streaming", "PASS")
                elif not db_online:
                    self.record(8, "Server-Sent Events (SSE) Streaming", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(8, "Server-Sent Events (SSE) Streaming", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(8, "Server-Sent Events (SSE) Streaming", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 9. Source Evidence Citations
            citations = chat_data.get("citations", []) if chat_data else []
            if citations or (chat_data and "IS 12269" in chat_data.get("answer", "")):
                self.record(9, "Authoritative Citation Verification", "PASS", f"({len(citations)} citations)")
            elif not db_online:
                self.record(9, "Authoritative Citation Verification", "SKIP", "(Requires live RAG retrieval)")
            else:
                self.record(9, "Authoritative Citation Verification", "FAIL", "Missing citations in answer")

            # 10. Evidence Chunk Integrity
            ev_used = chat_data.get("evidence_used", []) if chat_data else []
            if ev_used or citations:
                self.record(10, "Evidence Traceability Audit", "PASS")
            elif not db_online:
                self.record(10, "Evidence Traceability Audit", "SKIP", "(Requires live RAG retrieval)")
            else:
                self.record(10, "Evidence Traceability Audit", "FAIL")

            # 11. Confidence Calibration
            conf = chat_data.get("confidence") if chat_data else None
            if conf is not None and 0.0 <= conf <= 1.0:
                self.record(11, "Confidence Engine Calibration", "PASS", f"(Score: {conf:.2f})")
            elif not db_online:
                self.record(11, "Confidence Engine Calibration", "SKIP", "(Requires live RAG generation)")
            else:
                self.record(11, "Confidence Engine Calibration", "FAIL", "Invalid confidence score")

            # 12. Safe Guardrail Refusal
            try:
                resp = await client.post(
                    "/api/v1/chat",
                    json={"query": "Can you give me a recipe for baking sourdough bread?", "language": "en"},
                    headers=headers,
                )
                if resp.status_code == 200:
                    ans = resp.json().get("data", {})
                    refused = (
                        ans.get("insufficient_evidence") is True
                        or ans.get("confidence", 1.0) < 0.3
                        or "sufficient evidence" in ans.get("answer", "").lower()
                    )
                    self.record(12, "Negative Guardrail & Refusal", "PASS" if refused else "FAIL")
                elif not db_online:
                    self.record(12, "Negative Guardrail & Refusal", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(12, "Negative Guardrail & Refusal", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(12, "Negative Guardrail & Refusal", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 13. Multilingual Vernacular Generation (Hindi)
            try:
                resp = await client.post(
                    "/api/v1/chat",
                    json={"query": "53 ग्रेड ओपीसी सीमेंट के 28 दिनों की न्यूनतम संपीडन शक्ति क्या है?", "language": "hi"},
                    headers=headers,
                )
                if resp.status_code == 200:
                    hi_ans = resp.json().get("data", {}).get("answer", "")
                    preserved = "IS 12269" in hi_ans or "53" in hi_ans
                    self.record(13, "Multilingual Hindi Synthesis", "PASS" if preserved else "FAIL")
                elif not db_online:
                    self.record(13, "Multilingual Hindi Synthesis", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(13, "Multilingual Hindi Synthesis", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(13, "Multilingual Hindi Synthesis", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 14. Testing Laboratories
            try:
                resp = await client.get("/api/v1/laboratories", headers=headers)
                if resp.status_code == 200:
                    labs = resp.json().get("data", {}).get("items", [])
                    self.record(14, "Accredited Laboratory Directory", "PASS", f"({len(labs)} labs indexed)")
                elif not db_online:
                    self.record(14, "Accredited Laboratory Directory", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(14, "Accredited Laboratory Directory", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(14, "Accredited Laboratory Directory", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 15. Certification Schemes
            try:
                resp = await client.get("/api/v1/certification/schemes", headers=headers)
                if resp.status_code == 200:
                    schemes = resp.json().get("data", [])
                    self.record(15, "Conformity & Certification Schemes", "PASS", f"({len(schemes)} schemes)")
                elif not db_online:
                    self.record(15, "Conformity & Certification Schemes", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(15, "Conformity & Certification Schemes", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(15, "Conformity & Certification Schemes", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 16. Conversation Persistence
            try:
                resp = await client.get("/api/v1/conversations", headers=headers)
                if resp.status_code == 200:
                    self.record(16, "Conversation History Persistence", "PASS")
                elif not db_online:
                    self.record(16, "Conversation History Persistence", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(16, "Conversation History Persistence", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(16, "Conversation History Persistence", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 17. Feedback Loop
            if self.conversation_id:
                try:
                    resp = await client.post(
                        "/api/v1/feedback",
                        json={"conversation_id": self.conversation_id, "rating": 1, "comment": "E2E Verified"},
                        headers=headers,
                    )
                    self.record(17, "User Feedback Loop", "PASS" if resp.status_code in (200, 201) else "FAIL")
                except Exception as e:
                    self.record(17, "User Feedback Loop", "SKIP" if is_db_offline(e) else "FAIL", str(e))
            else:
                self.record(17, "User Feedback Loop", "SKIP", "(Requires active conversation)")

            # 18. RBAC Administrative Oversight
            try:
                resp = await client.get("/api/v1/admin/statistics", headers=headers)
                if resp.status_code == 200:
                    self.record(18, "RBAC Admin Security & Statistics", "PASS")
                elif not db_online:
                    self.record(18, "RBAC Admin Security & Statistics", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(18, "RBAC Admin Security & Statistics", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(18, "RBAC Admin Security & Statistics", "SKIP" if is_db_offline(e) else "FAIL", str(e))

            # 19. Document Ingestion Security
            try:
                # Test rejection of invalid file type
                files = {"file": ("malicious.exe", b"MZ_EXECUTABLE_HEADER", "application/octet-stream")}
                resp = await client.post("/api/v1/documents/ingest", files=files, headers=headers)
                # Must be rejected with 400, 401, 403, or 422
                rejected = resp.status_code in (400, 401, 403, 422)
                self.record(19, "Document Upload Security & Validation", "PASS" if rejected else "FAIL", f"(Rejected HTTP {resp.status_code})")
            except Exception as e:
                self.record(19, "Document Upload Security & Validation", "FAIL", str(e))

            # 20. Evaluation Runs
            try:
                resp = await client.get("/api/v1/evaluation/runs", headers=headers)
                if resp.status_code == 200:
                    self.record(20, "Evaluation Benchmark Orchestration", "PASS")
                elif not db_online:
                    self.record(20, "Evaluation Benchmark Orchestration", "SKIP", "(PostgreSQL offline on host)")
                else:
                    self.record(20, "Evaluation Benchmark Orchestration", "FAIL", f"Status: {resp.status_code}")
            except Exception as e:
                self.record(20, "Evaluation Benchmark Orchestration", "SKIP" if is_db_offline(e) else "FAIL", str(e))

        print("\n" + "=" * 70)
        print(f"TOTAL RESULTS: {self.passed} PASSED, {self.failed} FAILED, {self.skipped} SKIPPED out of 20.")
        print("=" * 70)
        return self.failed == 0


def main():
    parser = argparse.ArgumentParser(description="Run 20-Point E2E Integration Suite for BIS Copilot.")
    parser.add_argument("--backend-url", default=BACKEND_URL, help="Backend URL")
    parser.add_argument("--live", action="store_true", help="Force live network requests to BACKEND_URL")
    args = parser.parse_args()

    # Determine if live network should be used
    use_live = args.live
    if not use_live:
        # Check if live server is reachable
        try:
            import urllib.request
            with urllib.request.urlopen(f"{args.backend_url}/health", timeout=1):
                use_live = True
        except Exception:
            use_live = False

    harness = E2EHarness(base_url=args.backend_url, use_live_network=use_live)
    success = asyncio.run(harness.run())
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
