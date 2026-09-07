"""Unit tests for ConversationManager using mock session."""

import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest

from backend.app.generation.conversation import ConversationManager
from backend.app.generation.models import AnswerCitation


@pytest.mark.asyncio
async def test_conversation_manager_save_message_and_citations():
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    conv_id = uuid.uuid4()
    msg_id = uuid.uuid4()

    # Save message
    msg = await ConversationManager.save_message(
        session=mock_session,
        conversation_id=conv_id,
        role="assistant",
        content="Test answer content",
        intent="clause_lookup",
        confidence=0.92,
        response_time_ms=120,
    )
    assert msg.role == "assistant"
    assert msg.confidence == 0.92
    assert mock_session.add.called
    assert mock_session.flush.called

    # Save citations
    citations = [
        AnswerCitation(
            standard="IS 99999:2025",
            clause="5.2",
            pages="pp. 5–6",
            citation_text="[IS 99999:2025, Clause 5.2]",
        )
    ]
    saved_cites = await ConversationManager.save_citations(
        session=mock_session,
        message_id=msg_id,
        citations=citations,
    )
    assert len(saved_cites) == 1
    assert saved_cites[0].citation_text == "[IS 99999:2025, Clause 5.2]"
    assert saved_cites[0].page_number == 5


@pytest.mark.asyncio
async def test_conversation_manager_feedback():
    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    msg_id = uuid.uuid4()

    fb = await ConversationManager.record_feedback(
        session=mock_session,
        message_id=msg_id,
        rating=1,
        comment="Accurate clause reference",
    )
    assert fb.rating == 1
    assert fb.comment == "Accurate clause reference"
