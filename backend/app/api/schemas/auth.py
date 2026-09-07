"""Authentication request and response schemas."""

import uuid
from typing import Optional
from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of the user")
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", description="Unique email address")
    password: str = Field(..., min_length=8, description="Password (at least 8 characters)")
    preferred_language: str = Field("en", pattern="^(en|hi|mr)$", description="Preferred language (en, hi, mr)")


class UserLoginRequest(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", description="Registered email address")
    password: str = Field(..., description="User password")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid refresh token")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    preferred_language: str
    created_at: Optional[str] = None
