"""Schemas for BIS Certification Schemes and compliance requirements."""

import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class CertificationRequirementSummary(BaseModel):
    id: uuid.UUID
    clause_id: Optional[uuid.UUID] = None
    clause_number: Optional[str] = None
    title: str
    requirement_type: str
    is_mandatory: bool
    description: Optional[str] = None


class CertificationSchemeSummary(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    status: str
    description: Optional[str] = None
    scope: Optional[str] = None


class CertificationSchemeDetail(CertificationSchemeSummary):
    document_id: Optional[uuid.UUID] = None
    requirements: List[CertificationRequirementSummary] = Field(default_factory=list)
