"""Abstract base class for cache backends."""

from abc import ABC, abstractmethod
from typing import Any, Optional


class CacheBackend(ABC):
    """Unified interface for key-value caching."""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        pass

    @abstractmethod
    async def delete(self, key: str) -> None:
        pass

    @abstractmethod
    async def clear(self) -> None:
        pass
