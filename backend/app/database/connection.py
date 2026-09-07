import logging
from sqlalchemy import text, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.engine import Engine
from backend.app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Async engine for FastAPI application
async_engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
)

# Sync engine for Alembic, CLI tools, and synchronous scripts
sync_engine: Engine = create_engine(
    settings.SYNC_DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_size=max(2, settings.DB_POOL_SIZE // 2),
    max_overflow=max(5, settings.DB_MAX_OVERFLOW // 2),
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
)


async def check_async_connection() -> bool:
    """Verify asynchronous database connection."""
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.warning(f"Async database connection check failed: {exc}")
        return False


def check_sync_connection() -> bool:
    """Verify synchronous database connection."""
    try:
        with sync_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.warning(f"Sync database connection check failed: {exc}")
        return False


async def check_pgvector_available() -> bool:
    """Verify if pgvector extension is installed and accessible in PostgreSQL."""
    try:
        async with async_engine.connect() as conn:
            res = await conn.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'"))
            return res.scalar_one_or_none() is not None
    except Exception as exc:
        logger.warning(f"pgvector extension check failed: {exc}")
        return False


async def check_schema_initialized() -> bool:
    """Verify if core database tables and schema migrations are initialized."""
    try:
        async with async_engine.connect() as conn:
            res = await conn.execute(
                text("SELECT 1 FROM information_schema.tables WHERE table_name = 'documents'")
            )
            return res.scalar_one_or_none() is not None
    except Exception as exc:
        logger.warning(f"Schema check failed: {exc}")
        return False

