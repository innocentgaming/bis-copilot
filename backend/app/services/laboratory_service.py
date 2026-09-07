"""Laboratory directory and test capability search service."""

from typing import List, Optional, Tuple
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.api.schemas.laboratories import (
    LaboratoryCapabilityDetail,
    LaboratoryDetail,
    LaboratorySummary,
)
from backend.app.models.laboratory import Laboratory, LaboratoryCapability
from backend.app.models.standard import Standard


class LaboratoryService:
    """Provides querying over accredited BIS testing laboratories."""

    @staticmethod
    async def list_laboratories(
        session: AsyncSession,
        city: Optional[str] = None,
        state: Optional[str] = None,
        pincode: Optional[str] = None,
        status_filter: Optional[str] = "active",
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[LaboratorySummary], int]:
        """List laboratories filtered by location attributes."""
        query = select(Laboratory)
        count_query = select(func.count(Laboratory.id))

        if status_filter:
            query = query.where(Laboratory.status == status_filter)
            count_query = count_query.where(Laboratory.status == status_filter)
        if city:
            query = query.where(Laboratory.city.ilike(f"%{city}%"))
            count_query = count_query.where(Laboratory.city.ilike(f"%{city}%"))
        if state:
            query = query.where(Laboratory.state.ilike(f"%{state}%"))
            count_query = count_query.where(Laboratory.state.ilike(f"%{state}%"))
        if pincode:
            query = query.where(Laboratory.pincode == pincode)
            count_query = count_query.where(Laboratory.pincode == pincode)

        query = query.order_by(Laboratory.name.asc()).limit(limit).offset(offset)

        total = (await session.execute(count_query)).scalar_one()
        labs = (await session.execute(query)).scalars().all()

        summaries = [
            LaboratorySummary(
                id=l.id,
                name=l.name,
                city=l.city,
                state=l.state,
                pincode=l.pincode,
                status=l.status,
                phone=l.phone,
                email=l.email,
            )
            for l in labs
        ]
        return summaries, total

    @staticmethod
    async def get_laboratory(
        session: AsyncSession,
        laboratory_id: uuid.UUID,
    ) -> Optional[LaboratoryDetail]:
        """Get full laboratory detail including accredited test capabilities."""
        lab = await session.get(Laboratory, laboratory_id)
        if not lab:
            return None

        # Fetch capabilities
        stmt = (
            select(LaboratoryCapability)
            .where(LaboratoryCapability.laboratory_id == lab.id)
            .options(selectinload(LaboratoryCapability.standard))
        )
        caps = (await session.execute(stmt)).scalars().all()

        cap_details = [
            LaboratoryCapabilityDetail(
                id=c.id,
                standard_id=c.standard_id,
                standard_number=c.standard.standard_number if c.standard else None,
                test_name=c.test_name,
                is_accredited=c.is_accredited,
                valid_until=c.valid_until.isoformat() if c.valid_until else None,
            )
            for c in caps
        ]

        return LaboratoryDetail(
            id=lab.id,
            name=lab.name,
            address=lab.address,
            city=lab.city,
            state=lab.state,
            pincode=lab.pincode,
            latitude=lab.latitude,
            longitude=lab.longitude,
            phone=lab.phone,
            email=lab.email,
            website=lab.website,
            status=lab.status,
            capabilities=cap_details,
        )

    @staticmethod
    async def search_laboratories(
        session: AsyncSession,
        query: str,
        limit: int = 20,
    ) -> List[LaboratorySummary]:
        """Search laboratories matching by name, test capability, or standard number."""
        term = f"%{query}%"
        stmt = (
            select(Laboratory)
            .outerjoin(LaboratoryCapability, LaboratoryCapability.laboratory_id == Laboratory.id)
            .outerjoin(Standard, LaboratoryCapability.standard_id == Standard.id)
            .where(
                Laboratory.name.ilike(term)
                | LaboratoryCapability.test_name.ilike(term)
                | Standard.standard_number.ilike(term)
            )
            .distinct()
            .limit(limit)
        )
        labs = (await session.execute(stmt)).scalars().all()
        return [
            LaboratorySummary(
                id=l.id,
                name=l.name,
                city=l.city,
                state=l.state,
                pincode=l.pincode,
                status=l.status,
                phone=l.phone,
                email=l.email,
            )
            for l in labs
        ]
