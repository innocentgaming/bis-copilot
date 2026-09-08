"""FastAPI routes for BIS product certification verification and licence cross-checking."""

from fastapi import APIRouter, HTTPException, Query, status

from backend.app.services.product_verification_service import (
    ProductVerificationRequest,
    ProductVerificationResult,
    ProductVerificationService,
)

router = APIRouter(prefix="/verification", tags=["Product Verification & Quality Marks"])


@router.post(
    "/product",
    response_model=ProductVerificationResult,
    summary="Verify product certification, CM/L license number, or image data",
)
async def verify_product(payload: ProductVerificationRequest):
    """Verify BIS certification validity, genuine ISI mark status, and manufacturer details."""
    try:
        result = ProductVerificationService.verify_product(payload)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Verification failed: {str(e)}",
        )


@router.get(
    "/licence/{cml_number}",
    response_model=ProductVerificationResult,
    summary="Lookup BIS licence validity directly by CM/L number",
)
async def verify_licence_by_number(cml_number: str):
    """Direct licence verification by 7-digit CM/L number."""
    req = ProductVerificationRequest(cml_license_number=cml_number)
    return ProductVerificationService.verify_product(req)
