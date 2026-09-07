#!/bin/sh
set -e

echo "=== BIS Copilot Backend Initialization ==="

# Wait for PostgreSQL database connection
echo "Checking database connectivity..."
python -c "
import sys, time
from backend.app.database.connection import check_sync_connection
for attempt in range(1, 31):
    if check_sync_connection():
        print('Database connection established successfully.')
        sys.exit(0)
    print(f'Waiting for database (attempt {attempt}/30)...')
    time.sleep(1)
print('ERROR: Database connection timed out after 30 seconds.', file=sys.stderr)
sys.exit(1)
"

# Run idempotent database migrations
echo "Applying database schema migrations (alembic upgrade head)..."
alembic upgrade head

# Seed demo data if database is empty or explicitly requested
if [ "$SEED_DEMO_DATA" = "true" ] || [ ! -f "/app/data/.demo_seeded" ]; then
    echo "Checking demo data requirements..."
    python scripts/seed_demo.py --if-empty || true
    touch /app/data/.demo_seeded 2>/dev/null || true
fi

echo "Starting API server: $@"
exec "$@"
