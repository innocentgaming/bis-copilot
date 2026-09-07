# Production Security Hardening Specification

**Project**: Bureau of Indian Standards (BIS) AI Quality / Compliance Copilot  
**SIH Problem Statement**: 26107  
**Phase**: Phase 9 — Production Deployment, Observability & SIH Delivery  

---

## 1. Security Architecture Overview

The platform enforces defense-in-depth security across network, authentication, authorization, API traffic, file ingestion, and LLM prompt processing.

---

## 2. Authentication & JWT Security

- **Algorithm Whitelist**: Restricted exclusively to `HS256`. Asymmetric or `none` algorithm attacks are rejected.
- **Key Complexity Standard**: Production configurations reject any `JWT_SECRET_KEY` under 32 characters (256 bits) or matching common development defaults.
- **Token Expiration**:
  - Access Token: 24 hours (`ACCESS_TOKEN_EXPIRE_MINUTES=1440`).
  - Refresh Token: 7 days (`REFRESH_TOKEN_EXPIRE_DAYS=7`).
- **Signature & Tamper Verification**: Any modified payload or forged token immediately returns HTTP 401 Unauthorized with `AUTHENTICATION_ERROR`.

---

## 3. Role-Based Access Control (RBAC)

The system enforces 3 explicit roles:
1. `user` (General Public / Industry): Access to standards catalog, compliance search, chat queries, and accredited laboratory finder.
2. `auditor` (BIS Inspector / Quality Auditor): Access to audit trail, clause inspection tree, certification schemes, and evidence inspection drawer.
3. `admin` (BIS Technical Authority): Exclusive access to document ingestion, dataset deletion, user role administration, and system statistics.

Attempts by standard users or auditors to call `/api/v1/documents/ingest` or `/api/v1/admin/*` are rejected with HTTP 403 Forbidden (`AUTHORIZATION_ERROR`).

---

## 4. Rate Limiting & Abuse Prevention

The `InMemoryRateLimiter` enforces sliding-window rate limits per client IP and path:
- `/api/v1/chat` and `/api/v1/chat/stream`: 60 requests/minute.
- `/api/v1/auth/login` and `/api/v1/auth/register`: 30 requests/minute.
- `/api/v1/admin/*`: 60 requests/minute.

When a client breaches their limit:
- Status: `HTTP 429 Too Many Requests`
- Header: `Retry-After: 60`
- Response Body: Formatted `RATE_LIMIT_ERROR` envelope.

---

## 5. File Upload Hardening

File ingestion on `/api/v1/documents/ingest` applies four layers of inspection:
1. **Extension Check**: Must end in `.pdf`.
2. **MIME Type Validation**: Must match `application/pdf`.
3. **Magic Byte Verification**: Must begin with authentic header bytes `%PDF-`. Executable files or renamed scripts are rejected immediately.
4. **Size Enforcement**: Configured via `MAX_UPLOAD_SIZE_BYTES=52428800` (50 MB max). Oversized files are rejected before processing.
5. **Path Traversal Defense**: Files are saved with a randomly generated UUID filename (`uuid.uuid4().pdf`) in `data/uploads/`, eliminating any possibility of directory traversal.
6. **Corrupt File Cleanup**: If structural validation fails, the temporary file is deleted deterministically.

---

## 6. HTTP Security Headers & CORS

Every HTTP response from the backend contains standard security headers:
- `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing)
- `X-Frame-Options: DENY` (Clickjacking prevention)
- `X-XSS-Protection: 1; mode=block` (Browser XSS filter)
- `Referrer-Policy: strict-origin-when-cross-origin` (Reduces referrer leakage)
- `CORS Origins`: Configured exclusively to trusted frontend origins (`http://localhost:3000`, `http://127.0.0.1:3000`). Wildcard `*` origins are forbidden in production.

---

## 7. LLM Prompt Injection Defense

The system employs a dual-stage anti-injection guardrail:
1. **Input Query Sanitization**: Regex detection strips system prompt override patterns (`ignore previous instructions`, `you are now DAN`, `developer mode`).
2. **Authoritative Evidence Grounding**: The LLM is constrained to cite only evidence provided inside authentic `<EVIDENCE>` tags. Injected fake claims (e.g. attempting to lower the 53 Grade OPC compressive strength to 10 MPa) are rejected by the citation validator.
