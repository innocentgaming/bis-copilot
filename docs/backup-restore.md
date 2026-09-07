# PostgreSQL Backup, Disaster Recovery & Restore Procedures

**System**: Bureau of Indian Standards (BIS) AI Quality Copilot  
**Database**: PostgreSQL 16 with `pgvector` extension  
**Container**: `bis_copilot_postgres`  

---

## 1. Overview & Strategy

The persistence architecture of BIS Copilot encompasses three components:
1. **Relational & Vector Data (PostgreSQL + pgvector)**: Contains document metadata, parsed clauses, standard definitions, laboratories, conversations, user accounts, and 1536-dimensional embeddings.
2. **Raw & Processed Documents (`data/raw`, `data/processed`)**: Original PDF standards uploaded or ingested.
3. **Docker Named Volumes (`postgres_data`)**: Physical storage directory mounted at `/var/lib/postgresql/data`.

> [!WARNING]
> Copying or snapshotting Docker volume folders while PostgreSQL is running does **NOT** guarantee database consistency (risk of WAL corruption or torn pages). Always perform logical backups via `pg_dump` or proper base backups via `pg_basebackup`.

---

## 2. Logical Backup (pg_dump)

### 2.1 Automated Container Backup
To create a compressed custom-format archive (`.dump`) directly from the running container:

```bash
# Create backups directory
mkdir -p backups

# Export timestamped logical backup
docker exec -t bis_copilot_postgres pg_dump \
    -U postgres \
    -d bis_copilot \
    -F c \
    -b \
    -v \
    -f /tmp/bis_copilot_backup.dump

# Copy dump from container to host
docker cp bis_copilot_postgres:/tmp/bis_copilot_backup.dump backups/bis_copilot_$(date +%Y%m%d_%H%M%S).dump

# Clean up temp file in container
docker exec bis_copilot_postgres rm /tmp/bis_copilot_backup.dump
```

### 2.2 Plaintext SQL Backup (Schema + Data)
For human-readable inspection or diffing:
```bash
docker exec -t bis_copilot_postgres pg_dump \
    -U postgres \
    -d bis_copilot \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges > backups/bis_copilot_backup.sql
```

---

## 3. Database Restoration (pg_restore)

### 3.1 Restore to an Existing Database
```bash
# Copy dump into postgres container
docker cp backups/bis_copilot_20260907.dump bis_copilot_postgres:/tmp/restore.dump

# Execute restore with clean drop and multi-threaded indexing
docker exec -i bis_copilot_postgres pg_restore \
    -U postgres \
    -d bis_copilot \
    --clean \
    --if-exists \
    --no-owner \
    --verbose \
    /tmp/restore.dump

# Verify migration consistency
docker exec -i bis_copilot_backend alembic current
```

### 3.2 Restore into a Fresh Environment
If recreating the database from scratch:
```bash
# Ensure pgvector extension is created
docker exec -i bis_copilot_postgres psql -U postgres -d bis_copilot -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run restore
docker exec -i bis_copilot_postgres pg_restore -U postgres -d bis_copilot -v /tmp/restore.dump
```

---

## 4. Document Assets & Artifact Backup

Ingested PDF standards and processed text extracts reside on the host filesystem under `data/`:

```bash
# Archive document storage
tar -czvf backups/documents_backup_$(date +%Y%m%d).tar.gz \
    data/raw \
    data/processed \
    data/uploads
```

Restoration:
```bash
tar -xzvf backups/documents_backup_20260907.tar.gz -C .
```

---

## 5. Model Cache Considerations

Pre-trained embedding and cross-encoder weights are downloaded on first run and cached in `~/.cache/huggingface/hub/` (or `/home/bisuser/.cache` inside container).
- Caches do not require database backup because they are reconstructed automatically on demand.
- For air-gapped or offline deployment without internet connectivity, package the cache directory:
```bash
tar -czvf backups/model_cache.tar.gz ~/.cache/huggingface/hub
```

---

## 6. Disaster Recovery Verification Checklist

After performing a database restore, run the deployment verifier:
```bash
python scripts/verify_deployment.py
python scripts/smoke_test.py
```
Ensure:
1. `SELECT 1 FROM pg_extension WHERE extname = 'vector';` returns 1.
2. `alembic current` matches `alembic heads` (`0001_initial_schema`).
3. Total document chunks count matches pre-backup state: `SELECT COUNT(*) FROM document_chunks;`.

---

## 7. Phase 9 Automated Python Backup & Restoration Tools

For portable and automated execution without direct Docker access:

### 7.1 Automated Backup Utility
```bash
python scripts/backup_database.py --output-dir data/backups
```
Features:
- Masks database connection credentials automatically in output and files.
- Extracts all relational tables and 1536-dimensional vector embeddings into timestamped JSON/SQL archives.
- Produces clean structural snapshot when database is offline.

### 7.2 Guarded Restoration Utility
```bash
python scripts/restore_database.py --confirm-restore
```
Safety Guards:
- **Mandatory confirmation**: Destructive restoration requires the explicit `--confirm-restore` flag. Invoking without this flag blocks execution.
- **Post-restore audit**: Automatically validates database tables, pgvector extension, and HNSW cosine index presence.

