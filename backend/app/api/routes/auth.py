"""Authentication and user session routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    check_rate_limit,
    get_db_session,
    get_request_id,
)
from backend.app.api.errors import (
    BaseApiException,
    ConflictException,
    ErrorCodes,
)
from backend.app.api.schemas.auth import (
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.auth.dependencies import (
    get_current_user_optional,
    require_authenticated_user,
)
from backend.app.auth.service import AuthService
from backend.app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=ResponseEnvelope[UserResponse],
    summary="Register a new user account",
    dependencies=[Depends(check_rate_limit(max_requests=30, window_seconds=60))],
)
async def register(
    request: UserRegisterRequest,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Create a new standard user account. Self-registration cannot create admin accounts."""
    user, err = await AuthService.register_user(
        session=session,
        name=request.name,
        email=request.email,
        password=request.password,
        preferred_language=request.preferred_language,
    )
    if err:
        if "already exists" in err:
            raise ConflictException(err)
        raise BaseApiException(code=ErrorCodes.INVALID_REQUEST, message=err)

    data = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        preferred_language=user.preferred_language,
        created_at=user.created_at.isoformat() if user.created_at else None,
    )
    return ResponseEnvelope(
        success=True,
        data=data,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/login",
    response_model=ResponseEnvelope[TokenResponse],
    summary="Authenticate user and receive JWT tokens",
    dependencies=[Depends(check_rate_limit(max_requests=30, window_seconds=60))],
)
async def login(
    request: UserLoginRequest,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Authenticate with email and password to receive JWT access and refresh tokens."""
    user = await AuthService.authenticate_user(
        session=session,
        email=request.email,
        password=request.password,
    )
    if not user:
        raise BaseApiException(
            code=ErrorCodes.UNAUTHORIZED,
            message="Invalid email or password credentials.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    tokens = AuthService.generate_tokens(user)
    return ResponseEnvelope(
        success=True,
        data=TokenResponse(**tokens),
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/me",
    response_model=ResponseEnvelope[UserResponse],
    summary="Fetch current authenticated user profile",
)
async def get_me(
    current_user: User = Depends(require_authenticated_user),
    req_id: str = Depends(get_request_id),
):
    """Retrieve profile and role information for currently authenticated token."""
    data = UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        preferred_language=current_user.preferred_language,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
    )
    return ResponseEnvelope(
        success=True,
        data=data,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/refresh",
    response_model=ResponseEnvelope[TokenResponse],
    summary="Refresh access token using refresh token",
)
async def refresh_token(
    request: RefreshTokenRequest,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Exchange a valid refresh token for a newly generated JWT access token."""
    tokens, err = await AuthService.refresh_user_tokens(
        session=session,
        refresh_token=request.refresh_token,
    )
    if err:
        raise BaseApiException(
            code=ErrorCodes.UNAUTHORIZED,
            message=err,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return ResponseEnvelope(
        success=True,
        data=TokenResponse(**tokens),
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/logout",
    response_model=ResponseEnvelope[dict],
    summary="Log out active session",
)
async def logout(
    current_user: User = Depends(require_authenticated_user),
    req_id: str = Depends(get_request_id),
):
    """Log out the current user session (informs client to clear cached credentials)."""
    return ResponseEnvelope(
        success=True,
        data={"message": "Logged out successfully."},
        meta=ResponseMeta(request_id=req_id),
    )
