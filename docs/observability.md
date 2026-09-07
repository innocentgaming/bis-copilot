# Observability, Structured Logging & Tracing Architecture

**Project**: Bureau of Indian Standards (BIS) AI Quality / Compliance Copilot  
**SIH Problem Statement**: 26107  
**Phase**: Phase 9 — Production Deployment, Observability & SIH Delivery  

---

## 1. Observability Architecture Overview

The BIS Copilot platform incorporates end-to-end distributed observability across all processing layers:

```text
Browser Client
   │ (X-Request-ID Header)
   ▼
Next.js Frontend (:3000)
   │ (X-Request-ID Propagated)
   ▼
FastAPI RequestContextMiddleware (:8000)
   ├── Extracted or Generated UUID4
   ├── Latency Stopwatch Initialized
   └── Response Headers Injected
         │
         ├── RAG Hybrid Retrieval Service
         │     ├── query_validation_ms
         │     ├── embedding_ms
         │     ├── vector_search_ms
         │     ├── keyword_search_ms
         │     ├── hybrid_fusion_ms
         │     └── reranking_ms
         │
         ├── Grounded Generation & Guardrails
         │     ├── generation_ms
         │     ├── citation_validation_ms
         │     └── persistence_ms
         │
         └── SSE Streaming Manager
               ├── request_to_first_token_ms
               ├── stream_duration_ms
               └── tokens_or_chunks_streamed
```

---

## 2. Structured JSON Access Logs

Every HTTP request handled by the FastAPI application produces a single-line JSON log record on `stdout`:

```json
{
  "timestamp": "2026-09-07T18:14:26.061008+00:00",
  "level": "INFO",
  "logger": "bis_copilot.api",
  "message": "POST /api/v1/chat -> 200 (14.2ms)",
  "request_id": "f583e782-bdf4-41aa-85b4-ff7a63750529",
  "method": "POST",
  "path": "/api/v1/chat",
  "route": "/api/v1/chat",
  "latency_ms": 14.21,
  "status_code": 200,
  "user_id": "auditor-uuid"
}
```

### Privacy Redaction Guarantee
The `mask_sensitive_data` filter recursively redacts passwords, authentication tokens, API keys, and session cookies from logs, replacing them with `***REDACTED***`.

---

## 3. RAG Pipeline Granular Timings

The `ProcessingTimings` model returns microsecond-accurate timing breakdown inside the `data.processing` object of every query response:

```json
{
  "retrieval_ms": 0.14,
  "context_ms": 0.05,
  "generation_ms": 0.43,
  "validation_ms": 0.08,
  "persistence_ms": 0.09,
  "total_ms": 0.62,
  "query_validation_ms": 0.02,
  "embedding_ms": 0.04,
  "vector_search_ms": 0.03,
  "keyword_search_ms": 0.02,
  "hybrid_fusion_ms": 0.01,
  "reranking_ms": 0.02,
  "citation_validation_ms": 0.08,
  "total_pipeline_ms": 0.62
}
```

---

## 4. SSE Streaming Telemetry

Real-time streaming via `POST /api/v1/chat/stream` emits incremental tokens followed by a verified `final` event containing stream telemetry:

```json
event: final
data: {
  "conversation_id": "...",
  "answer": "Under IS 12269:2015 Clause 6.2...",
  "citations": [...],
  "confidence": 0.95,
  "sse_metrics": {
    "request_to_first_token_ms": 4.6,
    "stream_duration_ms": 12.8,
    "tokens_or_chunks_streamed": 28
  }
}
```

---

## 5. Canonical Error Taxonomy

When an error occurs, the API formats a uniform JSON response envelope:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "category": "RATE_LIMIT_ERROR",
    "message": "Rate limit exceeded (60 req/min). Please slow down.",
    "details": {}
  },
  "meta": {
    "request_id": "req-12345"
  }
}
```

### The 12 Production Error Categories:
1. `AUTHENTICATION_ERROR`: Missing, expired, or invalid credentials.
2. `AUTHORIZATION_ERROR`: Role permission boundary violation (e.g. non-admin attempting document deletion).
3. `VALIDATION_ERROR`: Schema or parameter validation failure (e.g. empty query or malformed body).
4. `DATABASE_ERROR`: Connectivity, transaction, or database operational failure.
5. `RETRIEVAL_ERROR`: Failure in vector search or PostgreSQL full-text search.
6. `EMBEDDING_ERROR`: Model inference failure during query vector generation.
7. `RERANKER_ERROR`: Cross-encoder reranking failure.
8. `GENERATION_ERROR`: LLM provider outage or inference timeout.
9. `CITATION_ERROR`: Failed citation verification or ungrounded claims detected by guardrail.
10. `RATE_LIMIT_ERROR`: Client exceeded sliding-window request volume (HTTP 429).
11. `UPLOAD_ERROR`: Corrupt file, non-PDF file, or upload size exceeding 50 MB.
12. `INTERNAL_ERROR`: Unhandled server exception with sanitized user message.
