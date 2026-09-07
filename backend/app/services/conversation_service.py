"""Conversation management service enforcing user isolation."""

from typing import List, Optional, Tuple
import uuid
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.api.errors import NotFoundException
from backend.app.api.schemas.conversation import (
    CitationDetail,
    ConversationDetail,
    MessageDetail,
)
from backend.app.models.chat import Citation, Conversation, Message
from backend.app.models.user import User


class ConversationService:
    """Manages chat conversation sessions and message history."""

    @staticmethod
    async def list_conversations(
        session: AsyncSession,
        user: User,
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[ConversationDetail], int]:
        """List conversations belonging to the authenticated user."""
        query = select(Conversation)
        count_query = select(func.count(Conversation.id))

        if user.role != "admin":
            query = query.where(Conversation.user_id == user.id)
            count_query = count_query.where(Conversation.user_id == user.id)

        query = query.order_by(Conversation.updated_at.desc()).limit(limit).offset(offset)

        total_res = await session.execute(count_query)
        total = total_res.scalar_one()

        res = await session.execute(query)
        conversations = res.scalars().all()

        details = []
        for c in conversations:
            # Count messages
            msg_count_res = await session.execute(
                select(func.count(Message.id)).where(Message.conversation_id == c.id)
            )
            msg_count = msg_count_res.scalar_one()
            details.append(
                ConversationDetail(
                    id=c.id,
                    title=c.title,
                    language=c.language,
                    user_id=c.user_id,
                    created_at=c.created_at.isoformat() if c.created_at else None,
                    updated_at=c.updated_at.isoformat() if c.updated_at else None,
                    message_count=msg_count,
                )
            )

        return details, total

    @staticmethod
    async def get_conversation(
        session: AsyncSession,
        conversation_id: uuid.UUID,
        user: User,
    ) -> Optional[ConversationDetail]:
        """Retrieve a specific conversation if accessible by the user."""
        conv = await session.get(Conversation, conversation_id)
        if not conv:
            return None

        if user.role != "admin" and conv.user_id is not None and conv.user_id != user.id:
            return None

        msg_count_res = await session.execute(
            select(func.count(Message.id)).where(Message.conversation_id == conv.id)
        )
        msg_count = msg_count_res.scalar_one()

        return ConversationDetail(
            id=conv.id,
            title=conv.title,
            language=conv.language,
            user_id=conv.user_id,
            created_at=conv.created_at.isoformat() if conv.created_at else None,
            updated_at=conv.updated_at.isoformat() if conv.updated_at else None,
            message_count=msg_count,
        )

    @staticmethod
    async def create_conversation(
        session: AsyncSession,
        user: User,
        title: str = "New Conversation",
        language: str = "en",
    ) -> ConversationDetail:
        """Create a new user conversation."""
        conv = Conversation(
            user_id=user.id,
            title=title,
            language=language,
        )
        session.add(conv)
        await session.flush()
        await session.refresh(conv)

        return ConversationDetail(
            id=conv.id,
            title=conv.title,
            language=conv.language,
            user_id=conv.user_id,
            created_at=conv.created_at.isoformat() if conv.created_at else None,
            updated_at=conv.updated_at.isoformat() if conv.updated_at else None,
            message_count=0,
        )

    @staticmethod
    async def delete_conversation(
        session: AsyncSession,
        conversation_id: uuid.UUID,
        user: User,
    ) -> bool:
        """Delete conversation and cascaded messages/citations."""
        conv = await session.get(Conversation, conversation_id)
        if not conv:
            return False

        if user.role != "admin" and conv.user_id is not None and conv.user_id != user.id:
            return False

        await session.delete(conv)
        return True

    @staticmethod
    async def get_messages(
        session: AsyncSession,
        conversation_id: uuid.UUID,
        user: User,
    ) -> Optional[List[MessageDetail]]:
        """Get ordered messages and authentic citations for a conversation."""
        conv = await session.get(Conversation, conversation_id)
        if not conv:
            return None

        if user.role != "admin" and conv.user_id is not None and conv.user_id != user.id:
            return None

        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .options(selectinload(Message.citations))
            .order_by(Message.created_at.asc())
        )
        res = await session.execute(stmt)
        messages = res.scalars().all()

        out = []
        for m in messages:
            citations = [
                CitationDetail(
                    id=c.id,
                    citation_text=c.citation_text,
                    standard_id=c.standard_id,
                    clause_id=c.clause_id,
                    page_number=c.page_number,
                    relevance_score=c.relevance_score,
                )
                for c in m.citations
            ]
            out.append(
                MessageDetail(
                    id=m.id,
                    role=m.role,
                    content=m.content,
                    intent=m.intent,
                    confidence=m.confidence,
                    created_at=m.created_at.isoformat() if m.created_at else None,
                    citations=citations,
                )
            )

        return out
