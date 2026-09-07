"""Database initialization script for BIS Copilot.

Usage:
    python scripts/setup_db.py [--check] [--migrate] [--create-all] [--seed]
"""

import os
import sys
import argparse
import logging
from sqlalchemy import text

# Ensure project root is in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.config import get_settings
from backend.app.database.connection import sync_engine, check_sync_connection
from backend.app.database.session import Base
import backend.app.models  # Ensure all models are registered

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("setup_db")


def verify_connection() -> bool:
    """Check database reachability."""
    logger.info("Checking database connection...")
    if not check_sync_connection():
        logger.error("Failed to connect to the database. Ensure PostgreSQL is running.")
        return False
    logger.info("Database connection established successfully.")
    return True


def ensure_extensions():
    """Ensure pgvector and other required extensions exist."""
    logger.info("Ensuring 'vector' extension exists in PostgreSQL...")
    try:
        with sync_engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
            res = conn.execute(text("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")).fetchone()
            if res:
                logger.info(f"Extension 'vector' confirmed (version: {res[1]}).")
            else:
                logger.warning("Extension 'vector' not listed in pg_extension.")
    except Exception as exc:
        logger.warning(f"Note on vector extension check: {exc}")


def run_alembic_migrations():
    """Execute Alembic upgrade head programmatically."""
    logger.info("Applying Alembic migrations (alembic upgrade head)...")
    from alembic.config import Config
    from alembic import command

    alembic_ini_path = os.path.join(BASE_DIR, "alembic.ini")
    if not os.path.exists(alembic_ini_path):
        alembic_ini_path = os.path.join(BASE_DIR, "backend", "alembic.ini")

    alembic_cfg = Config(alembic_ini_path)
    command.upgrade(alembic_cfg, "head")
    logger.info("Alembic migrations completed successfully.")


def create_all_tables():
    """Create all tables directly via SQLAlchemy metadata."""
    logger.info("Creating tables via Base.metadata.create_all()...")
    ensure_extensions()
    Base.metadata.create_all(bind=sync_engine)
    logger.info("All tables created successfully.")


def main():
    parser = argparse.ArgumentParser(description="BIS Copilot Database Setup Script")
    parser.add_argument("--check", action="store_true", help="Check database connection only")
    parser.add_argument("--migrate", action="store_true", help="Run Alembic migrations (upgrade head)")
    parser.add_argument("--create-all", action="store_true", help="Create tables via SQLAlchemy create_all")
    parser.add_argument("--seed", action="store_true", help="Seed minimal development sample data")
    args = parser.parse_args()

    settings = get_settings()
    logger.info(f"Target Database: {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")

    # If no flags passed, run default safe init (verify, migrate, and offer seed)
    if not any([args.check, args.migrate, args.create_all, args.seed]):
        logger.info("Running default initialization workflow...")
        if not verify_connection():
            logger.info("To start the database: docker compose up -d postgres")
            sys.exit(1)
        ensure_extensions()
        run_alembic_migrations()
        logger.info("Initialization complete. Run with --seed to populate development sample data.")
        return

    if args.check:
        if verify_connection():
            ensure_extensions()
            sys.exit(0)
        else:
            sys.exit(1)

    if not verify_connection():
        sys.exit(1)

    if args.create_all:
        create_all_tables()

    if args.migrate:
        ensure_extensions()
        run_alembic_migrations()

    if args.seed:
        from scripts.seed_dev_data import seed_development_data
        seed_development_data()


if __name__ == "__main__":
    main()
