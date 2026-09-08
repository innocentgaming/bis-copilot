"""BIS Application Tracking API Routes."""

from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.app.api.dependencies import get_request_id
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications"])


class CreateApplicationRequest(BaseModel):
    service_name: str
    standard_number: Optional[str] = None
    applicant_name: str
    company_name: str
    contact_email: str
    contact_phone: Optional[str] = None


@router.get(
    "",
    response_model=ResponseEnvelope[List[Dict[str, Any]]],
    summary="List applications with status filters",
)
async def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    req_id: str = Depends(get_request_id),
):
    """Retrieve applications."""
    apps = ApplicationService.list_applications(status_filter=status_filter)
    return ResponseEnvelope(
        success=True,
        data=apps,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/track/{application_number}",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Track application status and timeline by Application Number",
)
async def track_application(
    application_number: str,
    req_id: str = Depends(get_request_id),
):
    """Fetch complete live status timeline for an application number."""
    app = ApplicationService.get_by_number(application_number)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_number}' not found. Verify your application number."
        )

    return ResponseEnvelope(
        success=True,
        data=app,
        meta=ResponseMeta(request_id=req_id),
    )


@router.get(
    "/{app_id}",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Retrieve application by ID",
)
async def get_application(
    app_id: str,
    req_id: str = Depends(get_request_id),
):
    """Fetch application record by UUID or application number."""
    app = ApplicationService.get_by_id(app_id) or ApplicationService.get_by_number(app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application ID '{app_id}' not found."
        )

    return ResponseEnvelope(
        success=True,
        data=app,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "",
    response_model=ResponseEnvelope[Dict[str, Any]],
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new BIS certification / licence application",
)
async def submit_application(
    body: CreateApplicationRequest,
    req_id: str = Depends(get_request_id),
):
    """Create a new demo application with automated tracking timeline."""
    new_app = ApplicationService.create_application(body.dict())
    return ResponseEnvelope(
        success=True,
        data=new_app,
        meta=ResponseMeta(request_id=req_id),
    )
