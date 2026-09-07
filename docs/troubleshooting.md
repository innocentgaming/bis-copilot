# System Troubleshooting & Disaster Recovery Handbook

**Project**: Bureau of Indian Standards (BIS) AI Quality / Compliance Copilot  
**SIH Problem Statement**: 26107  
**Platform**: FastAPI (Python 3.11) + Next.js 14 + PostgreSQL 16 / pgvector  

---

## 1. Quick Triage Flowchart

```
Issue Observed
  ├── Service Won't Start
  │     ├── Port Conflict -> Section 2 (Port Conflicts)
  │     ├── Docker Offline -> Section 3 (Docker Daemon Offline)
  │     └── Missing Environment Variable -> Section 4 (Environment Variables)
  ├── Database Issues
  │     ├── Connection Refused -> Section 5 (PostgreSQL Connection Failures)
  │     ├── Missing Extension -> Section 6 (pgvector Unregistered)
  │     └── Unapplied Migrations -> Section 7 (Schema & Alembic Errors)
  ├── Frontend Issues
  │     ├── Hydration / Build Errors -> Section 8 (Next.js Build & Hydration)
  │     └── Network / CORS Failures -> Section 9 (API Network Errors)
  └── Demonstration Emergency
        └── Zero Internet at Venue -> Section 10 (Offline Presentation Fallback)
```

---

## 2. Port Conflicts (8000, 3000, 5432)

### Symptoms
- `[WinError 10048] Only one usage of each socket address is normally permitted`
- `Bind for 0.0.0.0:8000 failed: port is already allocated`

### Resolution
```powershell
# Identify process occupying port 8000 (Windows)
netstat -ano | findstr :8000
# Terminate conflicting process by PID
taskkill /F /PID <PID>

# For Next.js port 3000
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# For PostgreSQL port 5432
netstat -ano | findstr :5432
taskkill /F /PID <PID>
```

---

## 3. Docker Daemon Offline on Host

### Symptoms
- `docker: The term 'docker' is not recognized`
- `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`

### Root Cause
Docker Desktop is not installed or not active on the host machine.

### Recovery Command
Start the application in **Native Local Mode**:
```bash
# Terminal 1: Backend API
.venv\Scripts\uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend Web Client
cd frontend && npm run dev
```

---

## 4. Environment Variables & Production Secrets

### Symptoms
- `ValueError: JWT_SECRET_KEY must be configured and at least 32 characters long in production mode.`
- `ValueError: Default insecure secret key cannot be used in production mode.`

### Resolution
Ensure `.env` contains production-strength credentials:
```bash
ENVIRONMENT=production
JWT_SECRET_KEY=prod-bis-copilot-secure-encryption-key-2026-sih107
POSTGRES_PASSWORD=your_strong_password_here
```

---

## 5. PostgreSQL Connection Failures

### Symptoms
- `ConnectionRefusedError: [WinError 1225] The remote computer refused the network connection`
- `psycopg2.OperationalError: connection to server at "localhost", port 5432 failed`

### Diagnostic Checks
```bash
# Test sync connection via CLI
python -c "from backend.app.database.connection import check_sync_connection; print(check_sync_connection())"

# Start containerized PostgreSQL
docker compose up -d postgres
```

---

## 6. pgvector Extension Missing

### Symptoms
- `type "vector" does not exist`
- `operator class "vector_cosine_ops" does not exist`

### Resolution
Ensure the database has the `vector` extension registered:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 7. Schema & Migration Mismatches

### Symptoms
- `relation "standards" does not exist`
- `alembic.util.exc.CommandError: Can't locate revision identified by 'head'`

### Resolution
```bash
# Verify Alembic status
alembic current

# Upgrade database to head
alembic upgrade head

# Re-seed demo baseline
python scripts/seed_demo.py --if-empty
```

---

## 8. Next.js Build & Hydration Errors

### Symptoms
- `Unhandled Runtime Error: Text content does not match server-rendered HTML.`
- `Next.js 14 production build fails on route compilation.`

### Resolution
```bash
# Clean Next.js cache and rebuild
cd frontend
rm -rf .next
npm run build
npm run start
```

---

## 9. API Network & CORS Issues

### Symptoms
- `Unable to connect to compliance service at http://localhost:8000/api/v1: NetworkError`
- `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`

### Resolution
1. Verify backend `CORS_ORIGINS` includes the frontend origin:
   ```env
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```
2. Verify frontend `NEXT_PUBLIC_API_BASE_URL`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

---

## 10. Offline Presentation Emergency Fallback

### Situation
Competition venue Wi-Fi is down or external LLM APIs are throttling.

### Resolution
1. Ensure the system is configured to run deterministically:
   ```env
   LLM_PROVIDER=deterministic
   EMBEDDING_PROVIDER=deterministic
   ```
2. Run pre-flight health verification:
   ```bash
   python scripts/demo_health.py
   ```
3. Launch presentation demo workflow:
   ```bash
   python scripts/start_sih_demo.py
   ```
   Navigate directly to `http://localhost:3000/demo` for pre-scripted, citation-verified evaluations.
