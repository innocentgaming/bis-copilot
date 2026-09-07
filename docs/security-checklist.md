# Production Security Checklist & Hardening Audit

**Project**: Bureau of Indian Standards (BIS) AI Quality Copilot  
**Smart India Hackathon (SIH)** — Problem Statement: 26107  
**Verification Date**: September 2026  

---

## 1. Cryptography & Secrets Management

- [x] **No hardcoded secrets in version control**:
  - `config.py` uses pydantic settings reading from `.env`.
  - `.env` is listed in `.gitignore`.
- [x] **Production JWT secret enforcement**:
  - `validate_environment()` in `backend/app/config.py` rejects default dev keys when `ENVIRONMENT=production`.
  - Enforces minimum 32-character (256-bit) secret length.
- [x] **Secure Password Hashing**:
  - Argon2id with 64 MiB memory cost and 3 iterations (`argon2-cffi`).
- [x] **Database credentials isolation**:
  - Database passwords and connection strings are injected via environment variables.

---

## 2. API & Network Security

- [x] **CORS restricted to authorized origins**:
  - `FastAPI CORSMiddleware` restricted to `CORS_ORIGINS` (default: `http://localhost:3000,http://127.0.0.1:3000`).
  - No wildcard `["*"]` with credentials allowed.
- [x] **Security HTTP Response Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [x] **Distributed Tracing & Request IDs**:
  - `RequestContextMiddleware` generates or propagates `X-Request-ID` across every request.

---

## 3. Authentication & RBAC Access Control

- [x] **Role-Based Access Control**:
  - `require_authenticated_user` checks valid JWT access token.
  - `require_admin` restricts administrative routes (`/api/v1/admin/*`, `/api/v1/documents/*`).
  - `require_auditor_or_admin` protects compliance inspection routes.
  - Unauthorized requests return HTTP 401; forbidden requests return HTTP 403.
- [x] **User Isolation**:
  - Conversation histories and feedback entries are scoped to the authenticated user ID.

---

## 4. File Upload & Ingestion Security

- [x] **MIME & Extension Validation**:
  - Only `.pdf` files are permitted.
  - MIME type verified against `application/pdf`.
- [x] **Magic Bytes Header Verification**:
  - Files must start with `b"%PDF-"` magic bytes before saving to disk.
- [x] **Path Traversal Protection**:
  - Uploaded files are saved under generated random UUIDs (`f"{uuid.uuid4()}.pdf"`) in controlled `data/uploads/` directory.
  - User-supplied filenames are never used for filesystem writes.
- [x] **Unbounded Upload Prevention**:
  - Maximum upload size constrained to 50 MB (`MAX_UPLOAD_SIZE_BYTES`).
- [x] **Execution Prevention**:
  - Upload directory is non-executable and files are never run as shell commands.

---

## 5. Rate Limiting & Denial of Service Protection

- [x] **Sliding-Window Rate Limiting**:
  - `InMemoryRateLimiter` configured per IP and endpoint path.
  - Exceeded quotas return HTTP 429 Too Many Requests with `Retry-After` and `X-Request-ID`.
  - Configurable in `.env` (`RATE_LIMIT_ENABLED`, `RATE_LIMIT_ANONYMOUS_RPM`, etc.).

---

## 6. Observability & Privacy Sanitization

- [x] **Information Disclosure Prevention**:
  - Global exception handler catches unhandled exceptions and returns uniform JSON error envelopes without exposing internal stack traces or database driver details.
- [x] **Log Sanitization**:
  - Structured JSON logs omit `Authorization` headers, JWT token bodies, and user passwords.

---

## 7. Frontend Security & Asset Delivery

- [x] **Client Environment Scoping**:
  - Only `NEXT_PUBLIC_*` variables are exposed to the browser.
  - No database credentials, JWT secrets, or backend service tokens exist in the frontend bundle.
- [x] **Unprivileged Container Execution**:
  - Backend runs as non-root user `bisuser` (UID 1000).
  - Frontend runs as non-root user `nextjs` (UID 1001).
