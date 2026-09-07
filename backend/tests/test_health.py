import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_root_endpoint():
    """Verify root endpoint returns project information."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["project"] == "BIS Copilot"
        assert "health" in data


@pytest.mark.asyncio
async def test_health_endpoint():
    """Verify health endpoint responds with database status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        # May be 200 if DB is up, or 503 if DB is down
        assert response.status_code in [200, 503]
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert "version" in data
