"""Schemas for accredited testing laboratories and capabilities."""

import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class LaboratoryCapabilityDetail(BaseModel):
    id: uuid.UUID
    standard_id: Optional[uuid.UUID] = None
    standard_number: Optional[str] = None
    test_name: Optional[str] = None
    is_accredited: bool = True
    valid_until: Optional[str] = None


class LaboratorySummary(BaseModel):
    id: uuid.UUID
    name: str
    city: str
    state: str
    pincode: str
    status: str
    phone: Optional[str] = None
    email: Optional[str] = None


class LaboratoryDetail(LaboratorySummary):
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    website: Optional[str] = None
    capabilities: List[LaboratoryCapabilityDetail] = Field(default_factory=list)
