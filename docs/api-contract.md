# BIS Copilot API Contract Specification (v1.0.0)

**Base URL**: `http://localhost:8000/api/v1`  
**Interactive Swagger UI**: `http://localhost:8000/docs`  
**OpenAPI Specification**: `http://localhost:8000/openapi.json`  

All API endpoints (except raw SSE streams) return standardized JSON envelopes:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "request_id": "fe-abc12345"
  }
}
```
Error envelope format:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | RATE_LIMIT_EXCEEDED",
    "message": "Human-readable explanation of error",
    "details": { ... }
  },
  "meta": {
    "request_id": "fe-abc12345"
  }
}
```

---

## 1. System Liveness & Readiness

### `GET /health`
- **Description**: Lightweight process liveness probe.
- **Auth**: None
- **Response** (200 OK):
  ```json
  {
    "status": "alive",
    "service": "bis-copilot-backend",
    "environment": "production",
    "version": "1.0.0"
  }
  ```

### `GET /ready`
- **Description**: Dependency readiness probe inspecting PostgreSQL, pgvector extension, and RAG services.
- **Auth**: None
- **Response** (200 OK / 503 Unavailable):
  ```json
  {
    "status": "ready",
    "dependencies": {
      "database": "connected",
      "pgvector": "available",
      "rag_engine": "ready"
    },
    "environment": "production",
    "version": "1.0.0"
  }
  ```

---

## 2. Authentication & RBAC

### `POST /api/v1/auth/login`
- **Description**: Authenticate user and issue signed HS256 JWT access and refresh tokens.
- **Request Body**:
  ```json
  {
    "email": "auditor@bis.gov.in",
    "password": "auditor123"
  }
  ```
- **Response Data** (200 OK):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "BIS Senior Auditor",
      "email": "auditor@bis.gov.in",
      "role": "auditor",
      "preferred_language": "en"
    }
  }
  ```

### `POST /api/v1/auth/register`
- **Description**: Register a new user account with language preference.
- **Request Body**:
  ```json
  {
    "name": "Compliance Officer",
    "email": "officer@factory.in",
    "password": "strongPassword123!",
    "preferred_language": "hi"
  }
  ```

### `GET /api/v1/auth/me`
- **Description**: Retrieve active profile for the Bearer token.
- **Headers**: `Authorization: Bearer <token>`

---

## 3. RAG Chat & Streaming Orchestration

### `POST /api/v1/chat`
- **Description**: Execute single-turn or multi-turn grounded compliance query with anti-hallucination validation.
- **Headers**: `Authorization: Bearer <token>` (Optional)
- **Request Body**:
  ```json
  {
    "query": "What is the 28-day compressive strength of 53 grade cement under IS 12269?",
    "conversation_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "standard_number": "IS 12269:2015",
    "language": "en"
  }
  ```
- **Response Data** (200 OK):
  ```json
  {
    "answer": "Under IS 12269:2015 Clause 6.2, 53 Grade Ordinary Portland Cement shall achieve a 28-day compressive strength of not less than 53 MPa (N/mm²)...",
    "confidence": 0.96,
    "citations": [
      {
        "evidence_id": "chunk-12269-6.2",
        "standard": "IS 12269:2015",
        "clause": "6.2",
        "pages": "4-5"
      }
    ],
    "insufficient_evidence": false,
    "follow_up_questions": [
      "Would you like to inspect the 3-day and 7-day strength requirements?"
    ]
  }
  ```

### `POST /api/v1/chat/stream`
- **Description**: Real-time Server-Sent Events (SSE) token stream.
- **Media Type**: `text/event-stream`
- **SSE Events**:
  - `event: metadata` &rarr; `data: {"conversation_id": "...", "query": "..."}`
  - `event: token` &rarr; `data: {"token": "Under"}`
  - `event: citation` &rarr; `data: {"evidence_id": "...", "standard": "IS 12269:2015", "clause": "6.2"}`
  - `event: done` &rarr; `data: {"confidence": 0.96, "duration_ms": 320.5}`

---

## 4. Standards & Clause Catalog

### `GET /api/v1/standards`
- **Parameters**: `domain` (string), `status` (active/withdrawn), `limit` (int), `offset` (int).
- **Description**: Paginated standards catalog with entity statistics.

### `GET /api/v1/standards/{id}`
- **Description**: Standard metadata, edition details, and full nested clause tree (`5` &rarr; `5.1` &rarr; `Annex A`).

### `GET /api/v1/clauses/{id}`
- **Description**: Detailed clause content, table extracts, and associated document chunk references.

---

## 5. Search Engine

### `GET /api/v1/search`
- **Parameters**:
  - `q` (required string, query)
  - `method` (`hybrid` | `vector` | `keyword`)
  - `top_k` (int, 1-50)
  - `standard_id` (optional UUID)
- **Response Data**: Candidate chunks ordered by reciprocal rank fusion (RRF) with similarity scores and execution duration in milliseconds.

---

## 6. Accredited Laboratories

### `GET /api/v1/laboratories`
- **Parameters**: `state` (string), `product_id` (UUID), `standard_number` (string).
- **Response Data**: Directory of NABL/BIS-recognized laboratories with test capabilities, address, and contact details.

---

## 7. Conformity & Certification Schemes

### `GET /api/v1/certification/schemes`
- **Response Data**: Overview of BIS schemes (Scheme I ISI Mark, Scheme II Management Systems, Scheme IV FMCS, Scheme X CRS).

### `GET /api/v1/certification/schemes/{code}/requirements`
- **Response Data**: Mandatory factory testing and conformity guidelines.

---

## 8. Administrative Operations (Admin Only)

### `POST /api/v1/documents/ingest`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (PDF), `force` (bool).
- **Security Validations**:
  - File extension must be `.pdf`.
  - MIME type must match `application/pdf`.
  - Magic header must start with `b"%PDF-"`.
  - Size restricted to max 50 MB (`MAX_UPLOAD_SIZE_BYTES`).
  - Stored under randomly generated UUID filename to prevent directory traversal.

### `GET /api/v1/documents/jobs/{job_id}`
- **Description**: Real-time progress tracker for asynchronous background document ingestion.

### `GET /api/v1/admin/statistics`
- **Description**: System statistics: user counts, standard counts, chunk volumes, positive/negative feedback ratio.
