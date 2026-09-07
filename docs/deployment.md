# Production Deployment Guide: BIS AI Quality Copilot

**Smart India Hackathon (SIH) Problem Statement**: 26107  
**Platform**: Docker Compose / Linux / Windows WSL2  
**Target Ports**:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- PostgreSQL + pgvector: Internal network `bis_copilot_network` (mapped to host 5432)

---

## 1. Prerequisites

- **Docker**: Engine version 24.0+ and Docker Compose v2.20+
- **Host OS**: Linux (Ubuntu 22.04 LTS recommended), macOS (Apple Silicon or Intel), or Windows 10/11 with WSL2
- **Hardware Minimum**: 4 CPU cores, 8 GB RAM, 20 GB free disk space
- **Hardware Recommended**: 8 CPU cores, 16 GB RAM (supports concurrent cross-encoder reranking and embedding caching)
- **Network**: Internet access during first build to download base images and model weights (or pre-bundled offline cache).

---

## 2. Environment Configuration

1. Clone repository and navigate to root directory:
   ```bash
   cd sih107
   ```
2. Create production environment file from template:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` for production values:
   ```bash
   # Set environment to production
   ENVIRONMENT=production

   # Set strong, unique 32+ character JWT secret
   JWT_SECRET_KEY=prod-bis-copilot-secure-encryption-key-2026-sih107

   # Set database credentials
   POSTGRES_DB=bis_copilot
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_strong_postgres_password_here

   # Restrict CORS to allowed domain
   CORS_ORIGINS=http://localhost:3000,http://your-domain.com

   # Configure model execution device
   MODEL_DEVICE=cpu
   ```

---

## 3. One-Step Production Launch

Launch the entire stack using Docker Compose:

```bash
docker compose up --build -d
```

### What Happens Automatically:
1. `postgres` starts using `pgvector/pgvector:pg16` and initializes the database volume.
2. `postgres` passes internal `pg_isready` healthcheck.
3. `backend` container waits for database health.
4. `docker-entrypoint.sh` executes Alembic migrations (`alembic upgrade head`).
5. `docker-entrypoint.sh` seeds demo Indian Standards (`IS 12269`, `IS 1786`, `IS 10500`) and demo accounts.
6. `backend` starts Uvicorn on port `8000`.
7. `frontend` container waits for backend health and starts Next.js on port `3000`.

Verify container status:
```bash
docker compose ps
```

Expected output:
```text
NAME                   IMAGE                       STATUS                    PORTS
bis_copilot_postgres   pgvector/pgvector:pg16     Up (healthy)              0.0.0.0:5432->5432/tcp
bis_copilot_backend    sih107-backend             Up (healthy)              0.0.0.0:8000->8000/tcp
bis_copilot_frontend   sih107-frontend            Up (healthy)              0.0.0.0:3000->3000/tcp
```

---

## 4. Verification & Health Monitoring

Run the automated deployment smoke test:
```bash
python scripts/smoke_test.py
```

Inspect health probes:
```bash
# Process Liveness
curl http://localhost:8000/health

# Subsystem Readiness
curl http://localhost:8000/ready
```

---

## 5. Demonstration Preset Credentials

Open `http://localhost:3000/login` or `http://localhost:3000/demo`:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Senior Auditor** | `auditor@bis.gov.in` | `auditor123` | Full audit trail, verbatim citation inspection, lab directory |
| **Platform Administrator** | `admin@bis.gov.in` | `admin123` | Document ingestion, benchmark runs, system metrics |
| **General Citizen** | `user@bis.gov.in` | `user123` | Compliance assistant, standards search, Hindi multilingual |

---

## 6. Operational Commands & Maintenance

### Viewing Real-time Logs
```bash
# View all services
docker compose logs -f

# View backend structured JSON logs
docker compose logs -f backend

# View frontend access logs
docker compose logs -f frontend
```

### Running Manual Database Migrations
```bash
docker compose exec backend alembic current
docker compose exec backend alembic upgrade head
```

### Stopping & Restarting Stack
```bash
# Stop containers while preserving database volume
docker compose down

# Stop and wipe database volume (clean reset)
docker compose down -v
```

### Redeployment / Updates
```bash
git pull origin main
docker compose up --build -d
```

---

## 7. Troubleshooting Common Issues

1. **Port Collision (5432, 8000, or 3000 already in use)**:
   - Change `API_PORT=8080` or `POSTGRES_PORT=5433` in `.env`.
2. **PostgreSQL Healthcheck Failing**:
   - Check postgres logs: `docker compose logs postgres`.
   - Ensure the disk has sufficient write space.
3. **Backend Fails with Insecure JWT Secret**:
   - In production mode (`ENVIRONMENT=production`), `JWT_SECRET_KEY` must be at least 32 characters and distinct from default development keys. Update `.env`.
4. **SSE Streaming Broken Behind Nginx/Proxy**:
   - Ensure reverse proxy buffers are disabled (`proxy_buffering off;`) and HTTP 1.1 with chunked transfer is permitted.

---

## 8. Known Operational Limitations

1. **In-Memory Rate Limiting**: The current rate limiter uses an in-memory sliding window. For multi-node load-balanced deployments across multiple backend instances, configure an external Redis store.
2. **CPU Model Latency**: Cross-encoder reranking on CPU takes approximately 100–300 ms per query. For sub-50 ms latencies under heavy concurrent loads, set `MODEL_DEVICE=cuda` on a GPU-enabled node.
3. **First-Run Hugging Face Download**: On the first run with `sentence-transformers` enabled, models require ~400 MB of download bandwidth before serving requests. Deterministic mode requires 0 MB.
