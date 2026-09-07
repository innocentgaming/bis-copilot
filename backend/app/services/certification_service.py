"""Certification scheme and compliance requirement service."""

from typing import List, Optional, Tuple
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.api.schemas.certification import (
    CertificationRequirementSummary,
    CertificationSchemeDetail,
    CertificationSchemeSummary,
)
from backend.app.models.certification import (
    CertificationRequirement,
    CertificationScheme,
    StandardCertificationScheme,
)


class CertificationService:
    """Provides querying over BIS certification schemes and technical requirements."""

    @staticmethod
    async def list_schemes(
        session: AsyncSession,
        status_filter: Optional[str] = "active",
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[CertificationSchemeSummary], int]:
        """List certification schemes."""
        query = select(CertificationScheme)
        count_query = select(func.count(CertificationScheme.id))

        if status_filter:
            query = query.where(CertificationScheme.status == status_filter)
            count_query = count_query.where(CertificationScheme.status == status_filter)

        query = query.order_by(CertificationScheme.code.asc()).limit(limit).offset(offset)
        total = (await session.execute(count_query)).scalar_one()
        schemes = (await session.execute(query)).scalars().all()

        summaries = [
            CertificationSchemeSummary(
                id=s.id,
                code=s.code,
                name=s.name,
                status=s.status,
                description=s.description,
                scope=s.scope,
            )
            for s in schemes
        ]
        return summaries, total

    @staticmethod
    async def get_scheme(
        session: AsyncSession,
        scheme_id: uuid.UUID,
    ) -> Optional[CertificationSchemeDetail]:
        """Fetch scheme details along with associated requirements."""
        scheme = await session.get(CertificationScheme, scheme_id)
        if not scheme:
            return None

        # Fetch requirements
        stmt = (
            select(CertificationRequirement)
            .where(CertificationRequirement.scheme_id == scheme.id)
            .options(selectinload(CertificationRequirement.clause))
        )
        reqs = (await session.execute(stmt)).scalars().all()

        req_summaries = [
            CertificationRequirementSummary(
                id=r.id,
                clause_id=r.clause_id,
                clause_number=r.clause.clause_number if r.clause else None,
                title=r.title,
                requirement_type=r.requirement_type,
                is_mandatory=r.is_mandatory,
                description=r.description,
            )
            for r in reqs
        ]

        return CertificationSchemeDetail(
            id=scheme.id,
            code=scheme.code,
            name=scheme.name,
            status=scheme.status,
            description=scheme.description,
            scope=scheme.scope,
            document_id=scheme.document_id,
            requirements=req_summaries,
        )

    @staticmethod
    async def get_requirements_for_standard(
        session: AsyncSession,
        standard_id: uuid.UUID,
    ) -> List[CertificationRequirementSummary]:
        """List certification requirements linked to a standard through certification schemes."""
        stmt = (
            select(CertificationRequirement)
            .join(StandardCertificationScheme, StandardCertificationScheme.scheme_id == CertificationRequirement.scheme_id)
            .where(StandardCertificationScheme.standard_id == standard_id)
            .options(selectinload(CertificationRequirement.clause))
        )
        reqs = (await session.execute(stmt)).scalars().all()

        return [
            CertificationRequirementSummary(
                id=r.id,
                clause_id=r.clause_id,
                clause_number=r.clause.clause_number if r.clause else None,
                title=r.title,
                requirement_type=r.requirement_type,
                is_mandatory=r.is_mandatory,
                description=r.description,
            )
            for r in reqs
        ]
