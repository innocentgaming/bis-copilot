# SIH Demonstration Troubleshooting & Emergency Recovery Guide

**Problem Statement**: SIH 26107 — Bureau of Indian Standards (BIS) AI Quality Copilot  
**Purpose**: Rapid triage instructions and exact recovery commands during live evaluator presentations or competitions.

---

## Quick Diagnostics Flowchart

1. Run the deployment verifier:
   ```bash
   python scripts/verify_deployment.py
   ```
2. Run the automated smoke test:
   ```bash
   python scripts/smoke_test.py
   ```

---

## 1. Docker Daemon Not Running on Host

- **Symptom**: `docker: The term 'docker' is not recognized` or `Cannot connect to the Docker daemon`.
- **Cause**: Docker Desktop is stopped or Docker is not in system PATH.
- **Recovery Command**:
  1. Launch Docker Desktop from the Start Menu / Applications.
  2. If Docker cannot be used during demo, start the stack in **Local Mode**:
     ```bash
     # Terminal 1: Backend
     .venv\Scripts\uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
     
     # Terminal 2: Frontend
     cd frontend && npm start
     ```

---

## 2. PostgreSQL Container Unhealthy

- **Symptom**: `bis_copilot_postgres` exits or remains `(health: starting)`.
- **Recovery Command**:
  ```bash
  # Check PostgreSQL logs
  docker compose logs postgres
  
  # Restart container
  docker compose restart postgres
  
  # If volume is corrupt, reset volume
  docker compose down -v
  docker compose up -d postgres
  ```

---

## 3. Backend Unhealthy or Failing to Start

- **Symptom**: `curl http://localhost:8000/health` fails or connection refused.
- **Root Causes**:
  - `JWT_SECRET_KEY` rejected by production validator because it is insecure or < 32 characters.
  - Database connection refused.
- **Recovery Command**:
  ```bash
  # Check logs for exact traceback
  docker compose logs backend
  
  # Fix .env
  # Set: JWT_SECRET_KEY=sih-2026-bis-copilot-production-secure-key-999
  # Set: ENVIRONMENT=development (for demo bypass)
  
  # Restart backend
  docker compose restart backend
  ```

---

## 4. Frontend Unavailable (`http://localhost:3000`)

- **Symptom**: Browser reports `ERR_CONNECTION_REFUSED` on port 3000.
- **Recovery Command**:
  ```bash
  docker compose logs frontend
  docker compose restart frontend
  ```

---

## 5. Port Already in Use Collision (5432, 8000, 3000)

- **Symptom**: `bind: address already in use`.
- **Recovery Command**:
  ```powershell
  # Find process occupying port (Windows PowerShell)
  netstat -ano | findstr :8000
  netstat -ano | findstr :3000
  netstat -ano | findstr :5432

  # Kill process by PID
  taskkill /PID <PID> /F
  ```
  Or change port mappings in `.env`:
  `API_PORT=8001`, `POSTGRES_PORT=5433`.

---

## 6. Empty Database or Missing Demo Standards

- **Symptom**: Evaluator searches for `IS 12269` and gets 0 results.
- **Recovery Command**:
  ```bash
  # Re-run idempotent demo seeder immediately
  python scripts/seed_demo.py
  ```
  This immediately inserts `IS 12269:2015`, `IS 1786:2008`, `IS 10500:2012`, `IS 9873:2019`, clauses, embeddings, and test labs.

---

## 7. Migration Alignment Failure (`alembic`)

- **Symptom**: `alembic.util.exc.CommandError: Can't locate revision identified by '...'`.
- **Recovery Command**:
  ```bash
  # Verify current vs head
  python -m alembic current
  python -m alembic heads

  # Force upgrade to head
  python -m alembic upgrade head
  ```

---

## 8. SSE Streaming Failure or Frozen Stream

- **Symptom**: Chat response does not stream tokens.
- **Recovery**:
  - The frontend client (`frontend/lib/api/client.ts`) automatically falls back to non-streaming `/chat` if the SSE connection aborts.
  - To test direct non-streaming query:
    ```bash
    curl -X POST http://localhost:8000/api/v1/chat \
         -H "Content-Type: application/json" \
         -d '{"query": "What is the 28-day compressive strength of IS 12269?"}'
    ```

---

## 9. CORS Policy Block in Browser

- **Symptom**: `Access to fetch at ... has been blocked by CORS policy`.
- **Recovery Command**:
  - In `.env`, ensure `CORS_ORIGINS` contains `http://localhost:3000,http://127.0.0.1:3000`.
  - Restart backend: `docker compose restart backend`.

---

## 10. Authentication Failure with Preset Accounts

- **Symptom**: `401 Unauthorized` when signing in as `auditor@bis.gov.in`.
- **Recovery Command**:
  - Re-run `python scripts/seed_demo.py` to reset demo credentials.
  - Preset logins:
    - `auditor@bis.gov.in` / `auditor123`
    - `admin@bis.gov.in` / `admin123`
    - `user@bis.gov.in` / `user123`
  - In the UI, use the **Quick Demo Login** buttons on `/login` to auto-fill.
