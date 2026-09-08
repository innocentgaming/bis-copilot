"""FastAPI routes for Hallmarking guidance, HUID verification, and AHC search."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from backend.app.services.hallmarking_service import (
    AHCCenter,
    HUIDVerificationResult,
    HallmarkingService,
)

router = APIRouter(prefix="/hallmarking", tags=["Hallmarking & Precious Metals"])


@router.get(
    "/verify/{huid}",
    response_model=HUIDVerificationResult,
    summary="Verify Hallmark Unique Identification (HUID) 6-character code",
)
async def verify_huid(huid: str):
    """Verify HUID authenticity, jewelry article type, purity, and authorized assaying center."""
    result = HallmarkingService.verify_huid(huid)
    return result


@router.get(
    "/centers",
    response_model=List[AHCCenter],
    summary="Search BIS recognized Assaying and Hallmarking Centers (AHCs)",
)
async def list_ahc_centers(
    state: Optional[str] = Query(None, description="Filter by state (e.g. Delhi, Maharashtra)"),
    city: Optional[str] = Query(None, description="Filter by city (e.g. Mumbai, Bengaluru)"),
):
    """Retrieve list of authorized AHC centers."""
    return HallmarkingService.list_centers(state=state, city=city)
