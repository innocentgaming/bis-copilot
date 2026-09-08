"""BIS Compliance Engine API Routes."""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from backend.app.api.dependencies import get_request_id
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.services.compliance_service import ComplianceService

router = APIRouter(prefix="/compliance", tags=["Compliance"])


class EvaluateComplianceRequest(BaseModel):
    product_name: str = Field(..., description="Product name (e.g., LED Light, Circuit Breaker)")
    standard_number: str = Field(..., description="Standard number (e.g., IS 10500:2012, IS 1293:2019)")
    industry: Optional[str] = Field(None, description="Industry sector")


@router.get(
    "/records",
    response_model=ResponseEnvelope[List[Dict[str, Any]]],
    summary="List user compliance records and checklists",
)
async def list_compliance_records(
    req_id: str = Depends(get_request_id),
):
    """Retrieve compliance overview and active checklists."""
    records = ComplianceService.list_records()
    return ResponseEnvelope(
        success=True,
        data=records,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/evaluate",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Evaluate product compliance against Indian Standards",
)
async def evaluate_compliance(
    body: EvaluateComplianceRequest,
    req_id: str = Depends(get_request_id),
):
    """Generate dynamic compliance requirements, checklist, and action items."""
    result = ComplianceService.evaluate_product(
        product_name=body.product_name,
        standard_number=body.standard_number,
        industry=body.industry,
    )
    return ResponseEnvelope(
        success=True,
        data=result,
        meta=ResponseMeta(request_id=req_id),
    )
