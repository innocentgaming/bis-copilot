"""Hierarchical clause exploration routes."""

from typing import List
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.api.dependencies import get_db_session, get_request_id
from backend.app.api.errors import NotFoundException
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.api.schemas.standards import ClauseDetail, ClauseSummary
from backend.app.services.standard_service import StandardService

router = APIRouter(prefix="/clauses", tags=["Clauses"])


@router.get(
    "/{clause_id}",
    response_model=ResponseEnvelope[ClauseDetail],
    summary="Retrieve clause content and child sub-clauses",
)
async def get_clause(
    clause_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Fetch text content, heading, page boundaries, and child sub-clauses."""
    clause = await StandardService.get_clause(session, clause_id)
    if not clause:
        raise NotFoundException("Clause", clause_id)

    return ResponseEnvelope(
        success=True,
        data=clause,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{clause_id}/children",
    response_model=ResponseEnvelope[List[ClauseSummary]],
    summary="List immediate sub-clauses of a parent clause",
)
async def get_clause_children(
    clause_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    req_id: str = Depends(get_request_id),
):
    """Retrieve child clauses for hierarchical navigation."""
    clause = await StandardService.get_clause(session, clause_id)
    if not clause:
        raise NotFoundException("Clause", clause_id)

    return ResponseEnvelope(
        success=True,
        data=clause.children,
        meta=ResponseMeta(request_id=req_id),
    )
