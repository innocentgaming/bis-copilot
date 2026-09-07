"""JSON Web Token (JWT) encoding, decoding, and validation for BIS Copilot."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import uuid
import jwt
from pydantic import BaseModel

from backend.app.config import get_settings

settings = get_settings()


class TokenClaims(BaseModel):
    """Decoded and validated claims present within a valid JWT."""
    sub: str  # User UUID string
    email: str
    role: str
    token_type: str  # "access" or "refresh"
    exp: int
    iat: int
    jti: str  # Unique token ID for revocation tracking


def create_access_token(
    user_id: uuid.UUID,
    email: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate signed JWT access token.
    
    Args:
        user_id: Primary key UUID of user.
        email: User email address.
        role: Assigned role ('user' or 'admin').
        expires_delta: Optional custom expiry duration.
        
    Returns:
        Encoded JWT string.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "token_type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    user_id: uuid.UUID,
    email: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate signed JWT refresh token with longer duration."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "token_type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str, expected_type: str = "access") -> Optional[TokenClaims]:
    """Decode and strictly validate a JWT token string.
    
    Args:
        token: Raw JWT bearer token.
        expected_type: 'access' or 'refresh'.
        
    Returns:
        TokenClaims object if valid, None if invalid or expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["sub", "exp", "iat", "token_type"]},
        )
        if payload.get("token_type") != expected_type:
            return None
        return TokenClaims(**payload)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError):
        return None
