"""FastAPI authentication and RBAC dependency injectors."""

import uuid
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.auth.jwt import decode_token
from backend.app.database.session import AsyncSessionLocal
from backend.app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)


async def get_db_session() -> AsyncSession:
    """Provide a scoped transactional async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_db_session),
) -> Optional[User]:
    """Extract authenticated user if bearer token is provided and valid, else None."""
    if not token:
        return None

    claims = decode_token(token, expected_type="access")
    if not claims:
        return None

    try:
        user_id = uuid.UUID(claims.sub)
    except ValueError:
        return None

    try:
        user = await session.get(User, user_id)
        return user
    except Exception:
        return None


async def require_authenticated_user(
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    """Require a valid authenticated user, raising 401 UNAUTHORIZED if absent."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or are invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


async def require_admin(
    current_user: User = Depends(require_authenticated_user),
) -> User:
    """Require an authenticated user with 'admin' role, raising 403 FORBIDDEN if not."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: administrative privileges required.",
        )
    return current_user


async def require_auditor_or_admin(
    current_user: User = Depends(require_authenticated_user),
) -> User:
    """Require an authenticated user with 'auditor' or 'admin' role."""
    if current_user.role not in ("admin", "auditor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: auditor or administrative privileges required.",
        )
    return current_user
