"""Administrative oversight, statistics, and system routes (Admin only)."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    check_rate_limit,
    get_db_session,
    get_pagination,
    get_request_id,
    require_admin,
)
from backend.app.api.schemas.admin import AdminStatisticsResponse, SystemInfoResponse
from backend.app.api.schemas.auth import UserResponse
from backend.app.api.schemas.common import (
    PaginatedResponse,
    PaginationParams,
    ResponseEnvelope,
    ResponseMeta,
)
from backend.app.config import get_settings
from backend.app.database.connection import check_async_connection
from backend.app.models.chat import Conversation, Feedback, Message
from backend.app.models.clause import Clause
from backend.app.models.document import Document
from backend.app.models.document_chunk import DocumentChunk
from backend.app.models.standard import Standard
from backend.app.models.user import User

settings = get_settings()
router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(check_rate_limit(max_requests=60, window_seconds=60))],
)


@router.get(
    "/statistics",
    response_model=ResponseEnvelope[AdminStatisticsResponse],
    summary="Fetch administrative system statistics (Admin only)",
)
async def get_statistics(
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Aggregate core entity volumes and user feedback statistics."""
    total_users = (await session.execute(select(func.count(User.id)))).scalar_one()
    total_docs = (await session.execute(select(func.count(Document.id)))).scalar_one()
    active_docs = (
        await session.execute(select(func.count(Document.id)).where(Document.status == "active"))
    ).scalar_one()
    total_stds = (await session.execute(select(func.count(Standard.id)))).scalar_one()
    total_clauses = (await session.execute(select(func.count(Clause.id)))).scalar_one()
    total_chunks = (await session.execute(select(func.count(DocumentChunk.id)))).scalar_one()
    total_convs = (await session.execute(select(func.count(Conversation.id)))).scalar_one()
    total_msgs = (await session.execute(select(func.count(Message.id)))).scalar_one()
    total_fb = (await session.execute(select(func.count(Feedback.id)))).scalar_one()
    pos_fb = (
        await session.execute(select(func.count(Feedback.id)).where(Feedback.rating == 1))
    ).scalar_one()
    neg_fb = (
        await session.execute(select(func.count(Feedback.id)).where(Feedback.rating == -1))
    ).scalar_one()

    stats = AdminStatisticsResponse(
        total_users=total_users,
        total_documents=total_docs,
        active_documents=active_docs,
        total_standards=total_stds,
        total_clauses=total_clauses,
        total_chunks=total_chunks,
        total_conversations=total_convs,
        total_messages=total_msgs,
        total_feedbacks=total_fb,
        positive_feedback_count=pos_fb,
        negative_feedback_count=neg_fb,
    )
    return ResponseEnvelope(
        success=True,
        data=stats,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/users",
    response_model=ResponseEnvelope[PaginatedResponse[UserResponse]],
    summary="List registered users (Admin only)",
)
async def list_users(
    pagination: PaginationParams = Depends(get_pagination),
    session: AsyncSession = Depends(get_db_session),
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Retrieve paginated list of registered users."""
    total = (await session.execute(select(func.count(User.id)))).scalar_one()
    stmt = select(User).order_by(User.created_at.desc()).limit(pagination.limit).offset(pagination.offset)
    users = (await session.execute(stmt)).scalars().all()

    user_responses = [
        UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            preferred_language=u.preferred_language,
            created_at=u.created_at.isoformat() if u.created_at else None,
        )
        for u in users
    ]
    paginated = PaginatedResponse(
        items=user_responses,
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
        has_more=(pagination.offset + len(users)) < total,
    )
    return ResponseEnvelope(
        success=True,
        data=paginated,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/system",
    response_model=ResponseEnvelope[SystemInfoResponse],
    summary="Retrieve system diagnostics and engine configuration (Admin only)",
)
async def get_system_info(
    admin_user: User = Depends(require_admin),
    req_id: str = Depends(get_request_id),
):
    """Fetch configuration parameters and system operational settings."""
    db_ok = await check_async_connection()
    info = SystemInfoResponse(
        environment=settings.ENVIRONMENT,
        version="0.1.0",
        database_status="connected" if db_ok else "offline",
        vector_dimension=settings.EMBEDDING_DIMENSION,
        embedding_model=settings.EMBEDDING_MODEL,
        llm_provider=settings.LLM_PROVIDER,
        llm_model=settings.LLM_MODEL,
        caching_enabled=settings.CACHE_ENABLED,
        rate_limiting_enabled=settings.RATE_LIMIT_ENABLED,
    )
    return ResponseEnvelope(
        success=True,
        data=info,
        meta=ResponseMeta(request_id=req_id),
    )
