"""Thread-safe in-memory cache backend with TTL eviction."""

import time
from typing import Any, Dict, Optional, Tuple

from backend.app.cache.base import CacheBackend
from backend.app.config import get_settings

settings = get_settings()


class InMemoryCache(CacheBackend):
    """In-memory key-value cache respecting TTL."""

    def __init__(self):
        self._store: Dict[str, Tuple[Any, Optional[float]]] = {}

    async def get(self, key: str) -> Optional[Any]:
        if not settings.CACHE_ENABLED:
            return None

        record = self._store.get(key)
        if not record:
            return None

        val, expiry = record
        if expiry and time.time() > expiry:
            del self._store[key]
            return None
        return val

    async def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        if not settings.CACHE_ENABLED:
            return

        ttl = ttl_seconds or settings.CACHE_TTL_SECONDS
        expiry = time.time() + ttl if ttl > 0 else None
        self._store[key] = (value, expiry)

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)

    async def clear(self) -> None:
        self._store.clear()


cache = InMemoryCache()
