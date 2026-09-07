"""Conversation history and message inspection routes."""

from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import (
    get_db_session,
    get_pagination,
    get_request_id,
    require_authenticated_user,
)
from backend.app.api.errors import NotFoundException
from backend.app.api.schemas.common import (
    PaginatedResponse,
    PaginationParams,
    ResponseEnvelope,
    ResponseMeta,
)
from backend.app.api.schemas.conversation import (
    ConversationCreateRequest,
    ConversationDetail,
    MessageDetail,
)
from backend.app.models.user import User
from backend.app.services.conversation_service import ConversationService

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get(
    "",
    response_model=ResponseEnvelope[PaginatedResponse[ConversationDetail]],
    summary="List conversations belonging to current user",
)
async def list_conversations(
    pagination: PaginationParams = Depends(get_pagination),
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_authenticated_user),
    req_id: str = Depends(get_request_id),
):
    """Retrieve paginated list of chat conversations for the authenticated user."""
    items, total = await ConversationService.list_conversations(
        session=session,
        user=current_user,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    paginated = PaginatedResponse(
        items=items,
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
        has_more=(pagination.offset + len(items)) < total,
    )
    return ResponseEnvelope(
        success=True,
        data=paginated,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "",
    response_model=ResponseEnvelope[ConversationDetail],
    summary="Create a new chat conversation",
)
async def create_conversation(
    request: ConversationCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_authenticated_user),
    req_id: str = Depends(get_request_id),
):
    """Initialize a new conversation session for the authenticated user."""
    conv = await ConversationService.create_conversation(
        session=session,
        user=current_user,
        title=request.title or "New Conversation",
        language=request.language,
    )
    return ResponseEnvelope(
        success=True,
        data=conv,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{conversation_id}",
    response_model=ResponseEnvelope[ConversationDetail],
    summary="Retrieve details for a specific conversation",
)
async def get_conversation(
    conversation_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_authenticated_user),
    req_id: str = Depends(get_request_id),
):
    """Get metadata for a conversation session. Enforces user isolation."""
    conv = await ConversationService.get_conversation(
        session=session,
        conversation_id=conversation_id,
        user=current_user,
    )
    if not conv:
        raise NotFoundException("Conversation", conversation_id)

    return ResponseEnvelope(
        success=True,
        data=conv,
        meta=ResponseMeta(request_id=req_id),
    )


@router.delete(
    "/{conversation_id}",
    response_model=ResponseEnvelope[dict],
    summary="Delete a conversation and its messages",
)
async def delete_conversation(
    conversation_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_authenticated_user),
    req_id: str = Depends(get_request_id),
):
    """Delete conversation session and all associated messages."""
    deleted = await ConversationService.delete_conversation(
        session=session,
        conversation_id=conversation_id,
        user=current_user,
    )
    if not deleted:
        raise NotFoundException("Conversation", conversation_id)

    return ResponseEnvelope(
        success=True,
        data={"message": f"Conversation {conversation_id} deleted successfully."},
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=ResponseEnvelope[List[MessageDetail]],
    summary="Retrieve chronological messages with authentic citations",
)
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_authenticated_user),
    req_id: str = Depends(get_request_id),
):
    """Fetch all user and assistant messages for a conversation session."""
    messages = await ConversationService.get_messages(
        session=session,
        conversation_id=conversation_id,
        user=current_user,
    )
    if messages is None:
        raise NotFoundException("Conversation", conversation_id)

    return ResponseEnvelope(
        success=True,
        data=messages,
        meta=ResponseMeta(request_id=req_id),
    )
