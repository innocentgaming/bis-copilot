"""Standard and clause exploration service."""

from typing import List, Optional, Tuple
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.api.schemas.standards import (
    ClauseDetail,
    ClauseSummary,
    StandardDetail,
    StandardSummary,
)
from backend.app.models.clause import Clause
from backend.app.models.standard import Standard


class StandardService:
    """Provides querying over Indian Standards and hierarchical clauses."""

    @staticmethod
    async def list_standards(
        session: AsyncSession,
        search: Optional[str] = None,
        status_filter: Optional[str] = "active",
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[StandardSummary], int]:
        """List standards with optional text search and status filter."""
        query = select(Standard)
        count_query = select(func.count(Standard.id))

        if status_filter:
            query = query.where(Standard.status == status_filter)
            count_query = count_query.where(Standard.status == status_filter)

        if search:
            term = f"%{search}%"
            cond = Standard.standard_number.ilike(term) | Standard.title.ilike(term)
            query = query.where(cond)
            count_query = count_query.where(cond)

        query = query.order_by(Standard.standard_number.asc()).limit(limit).offset(offset)

        total = (await session.execute(count_query)).scalar_one()
        stds = (await session.execute(query)).scalars().all()

        summaries = [
            StandardSummary(
                id=s.id,
                standard_number=s.standard_number,
                title=s.title,
                short_title=s.short_title,
                edition=s.edition,
                status=s.status,
                publication_date=s.publication_date.isoformat() if s.publication_date else None,
            )
            for s in stds
        ]
        return summaries, total

    @staticmethod
    async def get_standard(
        session: AsyncSession,
        standard_id: uuid.UUID,
    ) -> Optional[StandardDetail]:
        """Fetch standard metadata along with top-level clauses."""
        std = await session.get(Standard, standard_id)
        if not std:
            return None

        # Count total clauses
        count_res = await session.execute(
            select(func.count(Clause.id)).where(Clause.standard_id == std.id)
        )
        clause_count = count_res.scalar_one()

        # Fetch top-level clauses (parent_clause_id is None)
        clause_query = (
            select(Clause)
            .where(Clause.standard_id == std.id)
            .order_by(Clause.clause_number.asc())
            .limit(100)
        )
        clauses = (await session.execute(clause_query)).scalars().all()

        clause_summaries = [
            ClauseSummary(
                id=c.id,
                clause_number=c.clause_number,
                heading=c.heading,
                page_start=c.page_start,
                page_end=c.page_end,
                parent_clause_id=c.parent_clause_id,
            )
            for c in clauses
        ]

        return StandardDetail(
            id=std.id,
            standard_number=std.standard_number,
            title=std.title,
            short_title=std.short_title,
            edition=std.edition,
            status=std.status,
            publication_date=std.publication_date.isoformat() if std.publication_date else None,
            scope=std.scope,
            document_id=std.document_id,
            clauses_count=clause_count,
            clauses=clause_summaries,
        )

    @staticmethod
    async def get_clause(
        session: AsyncSession,
        clause_id: uuid.UUID,
    ) -> Optional[ClauseDetail]:
        """Fetch full clause content and its immediate children."""
        clause = await session.get(Clause, clause_id)
        if not clause:
            return None

        # Fetch children
        child_stmt = select(Clause).where(Clause.parent_clause_id == clause.id).order_by(Clause.clause_number.asc())
        children = (await session.execute(child_stmt)).scalars().all()

        child_summaries = [
            ClauseSummary(
                id=ch.id,
                clause_number=ch.clause_number,
                heading=ch.heading,
                page_start=ch.page_start,
                page_end=ch.page_end,
                parent_clause_id=ch.parent_clause_id,
            )
            for ch in children
        ]

        return ClauseDetail(
            id=clause.id,
            standard_id=clause.standard_id,
            clause_number=clause.clause_number,
            heading=clause.heading,
            content=clause.content,
            page_start=clause.page_start,
            page_end=clause.page_end,
            parent_clause_id=clause.parent_clause_id,
            children=child_summaries,
        )
