"""FastAPI routes for consumer complaints and violation reporting."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from backend.app.services.complaint_service import (
    ComplaintCreate,
    ComplaintRecord,
    ComplaintService,
)

router = APIRouter(prefix="/complaints", tags=["Complaints & Consumer Protection"])


@router.post(
    "",
    response_model=ComplaintRecord,
    status_code=status.HTTP_201_CREATED,
    summary="File a new consumer grievance or standards violation complaint",
)
async def file_complaint(payload: ComplaintCreate):
    """Register a new complaint for fake ISI mark, hallmark issue, or defective standard product."""
    try:
        record = ComplaintService.file_complaint(payload)
        return record
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to register complaint: {str(e)}",
        )


@router.get(
    "/{tracking_id}",
    response_model=ComplaintRecord,
    summary="Get complaint details and status timeline by tracking ID",
)
async def get_complaint(tracking_id: str):
    """Retrieve complaint details, investigation stage, and next steps."""
    complaint = ComplaintService.get_complaint(tracking_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with tracking ID '{tracking_id}' not found.",
        )
    return complaint


@router.get(
    "",
    response_model=List[ComplaintRecord],
    summary="List complaints by email or category filter",
)
async def list_complaints(
    email: Optional[str] = Query(None, description="Filter by complainant email"),
    category: Optional[str] = Query(None, description="Filter by complaint category"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
):
    """List complaints matching search filters."""
    return ComplaintService.list_complaints(
        email=email,
        category=category,
        status=status_filter,
    )
