# Production Deployment Guide — BIS Quality / Compliance Copilot

**Project**: Bureau of Indian Standards (BIS) AI Quality / Compliance Copilot  
**SIH Problem Statement**: 26107  
**Phase**: Phase 9 — Production Deployment, Observability & SIH Delivery  

---

## 1. System Architecture

```text
                             Client Web Browser
                                     │
                                     ▼
                    Frontend Container (:3000)
                    [Next.js 14 Standalone Production]
                                     │
                                     ▼
                    Backend Container (:8000)
                    [FastAPI + Uvicorn ASGI Daemon]
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
         PostgreSQL 16 + pgvector             Local File System
         [Relational & HNSW Index]            [Raw/Processed PDFs]
```

All services run inside a dedicated Docker bridge network (`bis_copilot_network`) with explicit CPU/memory resource allocations.

---

## 2. Docker Compose Production Deployment

### 2.1 Prerequisites
- Docker Engine 24.0+ and Docker Compose v2.20+
- Host system with at least 4 GB RAM and 2 CPU cores available.

### 2.2 Environment Configuration
Ensure `.env` contains production parameters:
```env
ENVIRONMENT=production
POSTGRES_DB=bis_copilot
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_db_password
DATABASE_URL=postgresql+asyncpg://postgres:your_strong_db_password@postgres:5432/bis_copilot
SYNC_DATABASE_URL=postgresql+psycopg2://postgres:your_strong_db_password@postgres:5432/bis_copilot
JWT_SECRET_KEY=a-strong-random-secret-key-at-least-32-characters-long
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
RATE_LIMIT_ENABLED=true
MAX_UPLOAD_SIZE_BYTES=52428800
```

> [!CAUTION]
> If `ENVIRONMENT=production` and `JWT_SECRET_KEY` is shorter than 32 characters or matches the default insecure string, the backend server will intentionally terminate startup with a fatal error.

### 2.3 One-Command Build and Startup
```bash
# Build images and start services in detached mode
docker compose up -d --build
```

The container startup sequence:
1. `bis_copilot_postgres` initializes and begins accepting connections.
2. `bis_copilot_backend` waits for database readiness via `check_sync_connection()`, applies Alembic migrations (`alembic upgrade head`), and seeds default accounts and standards via `scripts/seed_demo.py`.
3. `bis_copilot_frontend` starts after the backend reports healthy.

---

## 3. Host / Bare-Metal Deployment

For environments without Docker Desktop:

### 3.1 Backend Server
```powershell
# Activate virtual environment
.venv\Scripts\Activate.ps1

# Run database migrations
alembic upgrade head

# Seed demo dataset
python scripts/seed_demo.py --if-empty

# Launch FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

### 3.2 Frontend Web App
```powershell
cd frontend
npm install
npm run build
npm start
```

---

## 4. Verification and Health Probes

### 4.1 Process Liveness Probe
```bash
curl -f http://localhost:8000/health
```
Response:
```json
{
  "status": "alive",
  "database": "ok",
  "service": "bis-copilot-backend",
  "environment": "production",
  "version": "1.0.0"
}
```

### 4.2 Dependency Readiness Probe
```bash
curl -f http://localhost:8000/ready
```
Response:
```json
{
  "status": "ready",
  "dependencies": {
    "database": "connected",
    "pgvector": "available",
    "schema": "initialized",
    "rag_engine": "ready"
  },
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 5. Troubleshooting & Recovery

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Port 5432 conflict** | Local PostgreSQL running on host | Change `POSTGRES_PORT=5433` in `.env` |
| **Port 8000 conflict** | Another process on 8000 | Set `API_PORT=8001` in `.env` |
| **503 on `/ready`** | Database still warming up or offline | Run `docker compose logs postgres` or `alembic upgrade head` |
| **JWT startup error** | Secret key too weak | Generate a 32+ character key for `JWT_SECRET_KEY` |
| **CORS error in browser** | Origin not whitelisted | Add client host to `CORS_ORIGINS` in `.env` |
