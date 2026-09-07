"""Conversation management and database persistence layer."""

import logging
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.chat import Citation, Conversation, Feedback, Message
from backend.app.generation.models import AnswerCitation

logger = logging.getLogger(__name__)


class ConversationManager:
    """Manages chat conversations, message histories, and citation records."""

    @classmethod
    async def get_or_create_conversation(
        cls,
        session: AsyncSession,
        conversation_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        title: str = "New Conversation",
        language: str = "en",
    ) -> Conversation:
        """Retrieve an existing conversation or instantiate a new one."""
        if conversation_id:
            stmt = select(Conversation).where(Conversation.id == conversation_id)
            res = await session.execute(stmt)
            conv = res.scalar_one_or_none()
            if conv:
                return conv

        new_conv = Conversation(
            id=conversation_id or uuid4(),
            user_id=user_id,
            title=title[:255],
            language=language,
        )
        session.add(new_conv)
        await session.flush()
        return new_conv

    @classmethod
    async def save_message(
        cls,
        session: AsyncSession,
        conversation_id: UUID,
        role: str,
        content: str,
        intent: Optional[str] = None,
        confidence: Optional[float] = None,
        response_time_ms: Optional[int] = None,
    ) -> Message:
        """Persist a user or assistant message to the database."""
        msg = Message(
            id=uuid4(),
            conversation_id=conversation_id,
            role=role,
            content=content,
            intent=intent[:100] if intent else None,
            confidence=confidence,
            response_time_ms=response_time_ms,
        )
        session.add(msg)
        await session.flush()
        return msg

    @classmethod
    async def save_citations(
        cls,
        session: AsyncSession,
        message_id: UUID,
        citations: List[AnswerCitation],
    ) -> List[Citation]:
        """Persist evidence citations linked to an assistant message."""
        entities = []
        for c in citations:
            # Parse page number integer if single page
            p_num = None
            if c.pages:
                try:
                    p_clean = c.pages.replace("pp.", "").replace("p.", "").strip().split("–")[0].split("-")[0]
                    p_num = int(p_clean)
                except Exception:
                    p_num = None

            cite_entity = Citation(
                id=uuid4(),
                message_id=message_id,
                chunk_id=c.chunk_id,
                document_id=c.document_id,
                citation_text=c.citation_text,
                page_number=p_num,
                relevance_score=c.relevance_score,
            )
            session.add(cite_entity)
            entities.append(cite_entity)

        await session.flush()
        return entities

    @classmethod
    async def record_feedback(
        cls,
        session: AsyncSession,
        message_id: UUID,
        rating: int,
        user_id: Optional[UUID] = None,
        is_correct: Optional[bool] = None,
        comment: Optional[str] = None,
    ) -> Feedback:
        """Record user feedback and quality rating (-1 or 1)."""
        fb = Feedback(
            id=uuid4(),
            message_id=message_id,
            user_id=user_id,
            rating=1 if rating > 0 else -1,
            is_correct=is_correct,
            comment=comment,
        )
        session.add(fb)
        await session.flush()
        return fb

    @classmethod
    async def get_conversation_history(
        cls,
        session: AsyncSession,
        conversation_id: UUID,
    ) -> List[Message]:
        """Fetch all messages and citations for a conversation."""
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .options(selectinload(Message.citations))
            .order_by(Message.created_at.asc())
        )
        res = await session.execute(stmt)
        return list(res.scalars().all())
