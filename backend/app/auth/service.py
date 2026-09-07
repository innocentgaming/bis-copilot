"""User authentication and registration service for BIS Copilot."""

import re
import uuid
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.auth.hashing import hash_password, verify_password, needs_rehash
from backend.app.auth.jwt import create_access_token, create_refresh_token, decode_token
from backend.app.config import get_settings
from backend.app.models.user import User

settings = get_settings()

EMAIL_REGEX = re.compile(r"^[^@]+@[^@]+\.[^@]+$")


class AuthService:
    """Core service for user lifecycle and credential authentication."""

    @staticmethod
    async def register_user(
        session: AsyncSession,
        name: str,
        email: str,
        password: str,
        preferred_language: str = "en",
    ) -> Tuple[Optional[User], Optional[str]]:
        """Register a new standard user.
        
        Note: Normal self-registration cannot create an admin account.
        
        Returns:
            Tuple of (User, None) on success, or (None, error_message) on failure.
        """
        clean_name = name.strip()
        clean_email = email.strip().lower()

        if not clean_name:
            return None, "Name cannot be empty."
        if not EMAIL_REGEX.match(clean_email):
            return None, "Invalid email address format."
        if len(password) < 8:
            return None, "Password must be at least 8 characters long."
        if preferred_language not in ("en", "hi", "mr"):
            return None, "Language must be one of: 'en', 'hi', 'mr'."

        # Check existing user
        stmt = select(User).where(User.email == clean_email)
        existing = await session.execute(stmt)
        if existing.scalar_one_or_none():
            return None, f"User with email '{clean_email}' already exists."

        pwd_hash = hash_password(password)
        new_user = User(
            name=clean_name,
            email=clean_email,
            password_hash=pwd_hash,
            role="user",  # Strict enforcement
            preferred_language=preferred_language,
        )
        session.add(new_user)
        await session.flush()
        await session.refresh(new_user)
        return new_user, None

    @staticmethod
    async def authenticate_user(
        session: AsyncSession,
        email: str,
        password: str,
    ) -> Optional[User]:
        """Authenticate user credentials and return user if valid."""
        clean_email = email.strip().lower()
        stmt = select(User).where(User.email == clean_email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        # Rehash if algorithm parameters evolved
        if needs_rehash(user.password_hash):
            user.password_hash = hash_password(password)
            session.add(user)
            await session.flush()

        return user

    @staticmethod
    def generate_tokens(user: User) -> dict:
        """Create paired access and refresh tokens for an authenticated user."""
        access_token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role,
        )
        refresh_token = create_refresh_token(
            user_id=user.id,
            email=user.email,
            role=user.role,
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    @staticmethod
    async def refresh_user_tokens(
        session: AsyncSession,
        refresh_token: str,
    ) -> Tuple[Optional[dict], Optional[str]]:
        """Validate a refresh token and issue a new token pair."""
        claims = decode_token(refresh_token, expected_type="refresh")
        if not claims:
            return None, "Invalid or expired refresh token."

        try:
            user_id = uuid.UUID(claims.sub)
        except ValueError:
            return None, "Invalid user identifier in token."

        user = await session.get(User, user_id)
        if not user:
            return None, "User account no longer exists."

        tokens = AuthService.generate_tokens(user)
        return tokens, None
