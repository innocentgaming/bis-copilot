from functools import lru_cache
from typing import Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # PostgreSQL connection settings
    POSTGRES_DB: str = "bis_copilot"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Database URLs
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/bis_copilot"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/bis_copilot"

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def assemble_async_db_url(cls, v: str) -> str:
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @field_validator("SYNC_DATABASE_URL", mode="after")
    @classmethod
    def assemble_sync_db_url(cls, v: str, info) -> str:
        if not v or v == "postgresql+psycopg2://postgres:postgres@localhost:5432/bis_copilot":
            db_url = info.data.get("DATABASE_URL", "")
            if db_url and "localhost" not in db_url:
                v = db_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+psycopg2://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
            v = v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

    # Vector embedding dimension and model
    EMBEDDING_MODEL: str = "BAAI/bge-m3"
    EMBEDDING_DIMENSION: int = 1536
    EMBEDDING_BATCH_SIZE: int = 32

    # Ingestion directories
    INGESTION_DATA_DIR: str = "data"
    RAW_DOCUMENT_DIR: str = "data/raw"
    PROCESSED_DOCUMENT_DIR: str = "data/processed"
    FAILED_DOCUMENT_DIR: str = "data/failed"

    # Chunking configuration
    CHUNK_SIZE: int = 1200
    CHUNK_OVERLAP: int = 150

    # OCR configuration
    OCR_ENABLED: bool = True
    OCR_LANGUAGE: str = "eng"
    MIN_TEXT_DENSITY: float = 0.05

    # Environment
    ENVIRONMENT: str = "development"
    DB_ECHO: bool = False

    # Retrieval configuration
    RETRIEVAL_METHOD: str = "hybrid"
    VECTOR_TOP_K: int = 50
    KEYWORD_TOP_K: int = 50
    FINAL_TOP_K: int = 10
    VECTOR_WEIGHT: float = 0.6
    KEYWORD_WEIGHT: float = 0.4
    RRF_K: int = 60
    RERANKER_ENABLED: bool = True
    RERANKER_MODEL: str = "BAAI/bge-reranker-v2-m3"
    RERANKER_TOP_K: int = 20
    MAX_RETRIEVAL_TOP_K: int = 100
    MAX_CANDIDATE_K: int = 500
    MAX_CHUNKS_PER_CLAUSE: int = 3
    LOW_CONFIDENCE_THRESHOLD: float = 0.25

    # LLM & Generation configuration
    LLM_PROVIDER: str = "deterministic"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_API_KEY: Optional[str] = None
    LLM_BASE_URL: Optional[str] = None
    LLM_TEMPERATURE: float = 0.0
    LLM_MAX_TOKENS: int = 1500
    LLM_TIMEOUT_SECONDS: int = 30
    LLM_MAX_RETRIES: int = 2

    GENERATION_ENABLED: bool = True
    GENERATION_MAX_CONTEXT_CHUNKS: int = 5
    GENERATION_MIN_RELEVANCE_SCORE: float = 0.20
    GENERATION_MIN_GROUNDING_SCORE: float = 0.60
    GENERATION_CONFIDENCE_THRESHOLD: float = 0.40

    ENABLE_CITATION_VALIDATION: bool = True
    ENABLE_GROUNDING_VALIDATION: bool = True
    ENABLE_HALLUCINATION_GUARD: bool = True
    REFUSE_ON_INSUFFICIENT_EVIDENCE: bool = True

    ENABLE_STREAMING: bool = True
    LOG_LLM_REQUESTS: bool = True
    LOG_LLM_RESPONSES: bool = True
    STORE_RAW_LLM_RESPONSE: bool = False

    # Authentication & Security
    JWT_SECRET_KEY: str = "dev-insecure-jwt-secret-key-change-in-production-0123456789"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # API & CORS
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = False  # Disabled by default in dev/test
    RATE_LIMIT_ANONYMOUS_RPM: int = 60
    RATE_LIMIT_AUTHENTICATED_RPM: int = 180
    RATE_LIMIT_INGESTION_RPM: int = 10

    # File Uploads
    MAX_UPLOAD_SIZE_BYTES: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_UPLOAD_EXTENSIONS: str = ".pdf"
    UPLOAD_TEMP_DIR: str = "data/uploads"

    # Database connection pool configuration
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800
    DB_POOL_PRE_PING: bool = True

    # Model Resource & Execution Device
    MODEL_DEVICE: str = "cpu"  # "cpu" or "cuda"

    # In-memory Caching
    CACHE_ENABLED: bool = True
    CACHE_TTL_SECONDS: int = 300


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()


def validate_environment(settings: Optional[Settings] = None) -> None:
    """Validate mandatory environment variables and security constraints at startup."""
    cfg = settings or get_settings()
    if cfg.ENVIRONMENT.lower() == "production":
        insecure_keys = {
            "dev-insecure-jwt-secret-key-change-in-production-0123456789",
            "change-this-in-production-super-secret-jwt-key",
            "secret",
            "jwt-secret",
        }
        if cfg.JWT_SECRET_KEY in insecure_keys:
            raise ValueError(
                "CRITICAL STARTUP ERROR: Insecure JWT_SECRET_KEY detected in production environment. "
                "You must configure a strong, unique secret key via JWT_SECRET_KEY."
            )
        if len(cfg.JWT_SECRET_KEY) < 32:
            raise ValueError(
                f"CRITICAL STARTUP ERROR: JWT_SECRET_KEY length ({len(cfg.JWT_SECRET_KEY)}) is less than 32 characters. "
                "Production cryptographic standard requires at least 256 bits (32 bytes)."
            )
        if not cfg.DATABASE_URL:
            raise ValueError("CRITICAL STARTUP ERROR: Missing required environment variable: DATABASE_URL")
