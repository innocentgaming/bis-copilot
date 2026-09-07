# BIS Copilot — Phase 5: Production Backend API Specification

## 1. Overview & Architecture
Phase 5 delivers the production-ready RESTful and streaming API platform for **BIS Copilot** (SIH Problem Statement 26107). It integrates the relational schema (Phase 1), ingestion pipeline (Phase 2), hybrid retrieval engine (Phase 3), and anti-hallucinatory AI orchestration (Phase 4) into an enterprise-grade API suite.

### Key Architectural Pillars
- **Standardized Response Envelope**: Uniform response structures across every endpoint (`success`, `data`, `error`, `meta`).
- **Security & RBAC**: JWT authentication with PBKDF2 hashing, secure role-based access control (`user`, `auditor`, `admin`), and automated request isolation.
- **Defensive Headers & Auditability**: Traceability with `X-Request-ID`, processing time metrics `X-Processing-Time-Ms`, CSP, and strict frame-options.
- **Resilience & Caching**: In-memory async TTL cache for high-throughput standards lookup, and graceful degradation during external service interruptions.
- **Streaming & SSE**: High-concurrency Server-Sent Events (SSE) for token-by-token answer streaming paired with strict post-generation verification.

---

## 2. Global Response Envelope

All API endpoints wrap payloads in a consistent Pydantic envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "request_id": "8b6dcbe7-6c3c-4e1c-964d-2d9aa8d42641",
    "timestamp": "2026-09-07T12:00:00.000Z",
    "processing_ms": 24.5
  }
}
```

In the event of an error:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Standard IS 99999 not found",
    "details": null
  },
  "meta": {
    "request_id": "8b6dcbe7-6c3c-4e1c-964d-2d9aa8d42641",
    "timestamp": "2026-09-07T12:00:00.000Z",
    "processing_ms": 1.2
  }
}
```

---

## 3. Endpoints Directory

### 3.1 System Health & Observability
| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Root liveness probe and database ping |
| `GET` | `/api/v1/health` | Public | Subsystem health with database readiness status |
| `GET` | `/api/v1/health/dependencies` | Public | Status of Database, Retrieval Engine, and LLM Provider |
| `GET` | `/api/v1/health/details` | Public | Verbose system metrics, uptime, and component status |

### 3.2 Authentication & User Management
| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user account with hashed credentials |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user and issue JWT bearer token |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile and role |
| `POST` | `/api/v1/auth/refresh` | Authenticated | Refresh active JWT access token |

### 3.3 AI Compliance Chat & Retrieval
| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/chat` | Optional Auth | Full evidence-grounded AI compliance inquiry |
| `POST` | `/api/v1/chat/stream` | Optional Auth | Server-Sent Events (SSE) streaming compliance chat |
| `POST` | `/api/v1/search` | Optional Auth | Direct hybrid retrieval (pgvector + FTS) without LLM |

### 3.4 Standards, Clauses & Documents
| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/standards` | Optional Auth | Paginated search and catalog of Indian Standards |
| `GET` | `/api/v1/standards/{id}` | Optional Auth | Detailed metadata for an Indian Standard |
| `GET` | `/api/v1/standards/{id}/clauses`| Optional Auth | Hierarchical clause breakdown for a standard |
| `GET` | `/api/v1/clauses/{id}` | Optional Auth | Full text and metadata for a specific clause |
| `GET` | `/api/v1/clauses/{id}/chunks` | Optional Auth | Extracted document chunks and embeddings |
| `GET` | `/api/v1/documents` | Admin / Auditor| List uploaded BIS PDF documents |
| `POST` | `/api/v1/documents/upload` | Admin | Upload PDF for background ingestion |
| `GET` | `/api/v1/documents/{id}` | Admin / Auditor| Inspection of raw document metadata |

### 3.5 Conformity Assessment & Testing Laboratories
| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/laboratories` | Public | Directory of BIS-recognized test laboratories |
| `GET` | `/api/v1/laboratories/find-by-standard` | Public | Geographic/parameter matching for standard testing |
| `GET` | `/api/v1/certification/schemes` | Public | Certification schemes (ISI Mark, CRS, Hallmarking) |
| `GET` | `/api/v1/certification/requirements` | Public | Mandatory test and inspection requirements |

### 3.6 Conversations, Feedback & Evaluation
| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/conversations` | Authenticated | User conversational history list |
| `GET` | `/api/v1/conversations/{id}` | Authenticated | Specific conversation metadata |
| `GET` | `/api/v1/conversations/{id}/messages` | Authenticated | Chronological message thread with citations |
| `DELETE` | `/api/v1/conversations/{id}` | Authenticated | Delete a conversation thread |
| `POST` | `/api/v1/feedback` | Optional Auth | User thumbs-up/down (+1/-1) and audit comments |
| `GET` | `/api/v1/feedback/summary` | Admin / Auditor| Feedback satisfaction metrics and rating distribution |
| `GET` | `/api/v1/evaluation/questions` | Admin / Auditor| Standardized benchmark evaluation questions |
| `POST` | `/api/v1/evaluation/run` | Admin | Trigger retrieval and grounding evaluation suite |
| `GET` | `/api/v1/admin/stats` | Admin | Aggregate counts of standards, chunks, and queries |
| `POST` | `/api/v1/admin/ingest` | Admin | Administrative trigger for document re-indexing |

---

## 4. Verification & Testing

The Phase 5 test suite rigorously verifies API correctness across 17 test modules:
```bash
.venv/Scripts/pytest backend/tests/api/
```

### Coverage Breakdown:
- **Authentication**: `test_auth.py` (Registration, login, invalid credentials, token verification, role permissions)
- **Security & Headers**: `test_security.py` (X-Request-ID propagation, CORS, nosniff, framing protection, SQL injection resilience)
- **Chat & Streaming**: `test_chat.py`, `test_streaming.py` (Query dispatch, SSE format, grounding flags, fallback execution)
- **Domain Resources**: `test_standards.py`, `test_clauses.py`, `test_documents.py`, `test_laboratories.py`, `test_certification.py`
- **User Experience**: `test_conversations.py`, `test_feedback.py`, `test_search.py`, `test_admin.py`, `test_evaluation.py`
- **End-to-End**: `test_e2e_api.py` (Full workflow: registration -> login -> compliance chat -> feedback -> conversation inspect)

Total Automated Tests: **154 items** (149 passed, 5 skipped cleanly when Docker database is offline).
