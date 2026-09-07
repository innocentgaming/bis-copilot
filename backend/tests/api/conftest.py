"""Pytest fixtures for API endpoint testing."""

import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.api.dependencies import (
    get_current_user_optional,
    get_db_session,
    require_admin,
    require_authenticated_user,
)
from backend.app.main import app
from backend.app.models.base import utc_now
from backend.app.models.user import User


@pytest.fixture(autouse=True)
def clean_dependencies():
    """Ensure clean dependency overrides for each individual test."""
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_session():
    """Create a mock async SQLAlchemy database session."""
    session = AsyncMock()
    session.add = MagicMock()
    session.flush = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = AsyncMock()
    session.get = AsyncMock()
    session.execute = AsyncMock()
    return session


@pytest.fixture
def standard_user():
    """Create a dummy standard user entity."""
    user = User(
        id=uuid.UUID("11111111-2222-3333-4444-555555555555"),
        name="Standard Test User",
        email="user@example.com",
        password_hash="mock_argon2_hash",
        role="user",
        preferred_language="en",
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    return user


@pytest.fixture
def admin_user():
    """Create a dummy administrative user entity."""
    user = User(
        id=uuid.UUID("99999999-8888-7777-6666-555555555555"),
        name="Admin Test User",
        email="admin@example.com",
        password_hash="mock_argon2_hash",
        role="admin",
        preferred_language="en",
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    return user


@pytest.fixture
def async_client(mock_session):
    """Provide AsyncClient with DB session override."""
    app.dependency_overrides[get_db_session] = lambda: mock_session
    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")
    yield client
    app.dependency_overrides.clear()
