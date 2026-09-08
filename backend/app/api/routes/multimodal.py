"""Multimodal AI API Routes for Voice, Vision, and Document AI."""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field

from backend.app.api.dependencies import get_request_id
from backend.app.api.schemas.common import ResponseEnvelope, ResponseMeta
from backend.app.services.multimodal_service import MultimodalService

router = APIRouter(prefix="/multimodal", tags=["Multimodal AI"])


class VoiceQueryRequest(BaseModel):
    transcript: str = Field(..., description="Transcribed audio or speech query text")
    language: str = Field("en", description="Language code: en, hi, etc.")


class VisionQueryRequest(BaseModel):
    image_name: str = Field(..., description="Image filename or label description")
    image_type: str = Field("product_label", description="Image type: product_label, hallmark, crs_label, general")


@router.post(
    "/voice",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Process voice speech query in English or Hindi",
)
async def process_voice(
    body: VoiceQueryRequest,
    req_id: str = Depends(get_request_id),
):
    """Process speech query, detect language & standard, and generate response."""
    result = MultimodalService.process_voice_query(
        audio_transcript=body.transcript,
        language=body.language,
    )
    return ResponseEnvelope(
        success=True,
        data=result,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/vision",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Analyze product label, ISI mark, or hallmark certificate image",
)
async def analyze_vision(
    body: VisionQueryRequest,
    req_id: str = Depends(get_request_id),
):
    """Perform computer vision analysis on product image/label."""
    result = MultimodalService.analyze_image_query(
        image_name=body.image_name,
        image_type=body.image_type,
    )
    return ResponseEnvelope(
        success=True,
        data=result,
        meta=ResponseMeta(request_id=req_id),
    )


@router.post(
    "/document-ai",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Analyze uploaded standard specification or compliance PDF document",
)
async def analyze_document(
    file: Optional[UploadFile] = File(None),
    filename: Optional[str] = Form(None),
    req_id: str = Depends(get_request_id),
):
    """Deep Document AI analysis extracting requirements, dates, fees, and action items."""
    target_name = (file.filename if file else filename) or "Standard_Document.pdf"
    result = MultimodalService.analyze_document(filename=target_name)
    return ResponseEnvelope(
        success=True,
        data=result,
        meta=ResponseMeta(request_id=req_id),
    )
