"""Complaint management service for consumer grievances and quality violations."""

import random
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


class ComplaintCreate(BaseModel):
    category: str = Field(..., description="fake_isi | defective_product | hallmark_issue | misleading_claim | standard_violation | other")
    product_name: str
    brand_name: Optional[str] = None
    batch_number: Optional[str] = None
    seller_name: Optional[str] = None
    seller_address: Optional[str] = None
    is_number: Optional[str] = None
    huid_number: Optional[str] = None
    license_number: Optional[str] = None
    description: str
    evidence_urls: List[str] = Field(default_factory=list)
    complainant_name: str
    complainant_email: str
    complainant_phone: Optional[str] = None


class ComplaintRecord(BaseModel):
    id: str
    tracking_id: str
    category: str
    product_name: str
    brand_name: Optional[str] = None
    batch_number: Optional[str] = None
    seller_name: Optional[str] = None
    seller_address: Optional[str] = None
    is_number: Optional[str] = None
    huid_number: Optional[str] = None
    license_number: Optional[str] = None
    description: str
    evidence_urls: List[str] = Field(default_factory=list)
    complainant_name: str
    complainant_email: str
    complainant_phone: Optional[str] = None
    status: str
    status_label: str
    next_action: str
    resolution_notes: Optional[str] = None
    created_at: str
    updated_at: str


# In-memory store for instant zero-dependency responsiveness across restarts / demos
_MOCK_COMPLAINTS: Dict[str, Dict[str, Any]] = {
    "BIS-CMP-2026-004812": {
        "id": "c-001",
        "tracking_id": "BIS-CMP-2026-004812",
        "category": "fake_isi",
        "product_name": "Submersible Water Pump (1.5 HP)",
        "brand_name": "Aquamax India",
        "batch_number": "AQ-2026/02",
        "seller_name": "Apex Hardware Traders",
        "seller_address": "Shop 4, Gandhi Chowk, Nagpur, Maharashtra",
        "is_number": "IS 14220",
        "huid_number": None,
        "license_number": "CM/L-0000000",
        "description": "The product package bears an ISI mark with an invalid 7-digit CML number. On checking the BIS portal, no license exists under this name.",
        "evidence_urls": ["/uploads/pump_packaging_label.jpg"],
        "complainant_name": "Rajesh Sharma",
        "complainant_email": "rajesh.sharma@example.com",
        "complainant_phone": "+91 9876543210",
        "status": "under_investigation",
        "status_label": "Enforcement Cell Investigation",
        "next_action": "Regional BIS enforcement officer assigned for sample seizure and verification.",
        "resolution_notes": None,
        "created_at": "2026-03-01T10:15:00Z",
        "updated_at": "2026-03-03T14:30:00Z",
    },
    "BIS-CMP-2026-009144": {
        "id": "c-002",
        "tracking_id": "BIS-CMP-2026-009144",
        "category": "hallmark_issue",
        "product_name": "22K Gold Bangles (24g)",
        "brand_name": "Shree Jewellers",
        "batch_number": None,
        "seller_name": "Shree Gold & Silver Emporium",
        "seller_address": "Commercial Street, Bengaluru, Karnataka",
        "is_number": "IS 1417",
        "huid_number": "H7X892",
        "license_number": None,
        "description": "The 6-digit HUID code etched on the bangle does not return matching purity details on the BIS Care verification portal.",
        "evidence_urls": ["/uploads/hallmark_macro_lens.jpg"],
        "complainant_name": "Priya Venkatesh",
        "complainant_email": "priya.v@example.com",
        "complainant_phone": "+91 9823456789",
        "status": "evidence_requested",
        "status_label": "Purchase Receipt Requested",
        "next_action": "Please upload a clear copy of the tax invoice / purity certificate.",
        "resolution_notes": None,
        "created_at": "2026-02-20T16:00:00Z",
        "updated_at": "2026-02-22T11:00:00Z",
    },
}


class ComplaintService:
    """Service to process and track consumer complaints."""

    @classmethod
    def generate_tracking_id(cls) -> str:
        num = random.randint(100000, 999999)
        return f"BIS-CMP-2026-{num}"

    @classmethod
    def file_complaint(cls, data: ComplaintCreate) -> ComplaintRecord:
        tracking_id = cls.generate_tracking_id()
        now = datetime.utcnow().isoformat() + "Z"
        complaint_id = str(uuid.uuid4())

        record_dict = {
            "id": complaint_id,
            "tracking_id": tracking_id,
            "category": data.category,
            "product_name": data.product_name,
            "brand_name": data.brand_name,
            "batch_number": data.batch_number,
            "seller_name": data.seller_name,
            "seller_address": data.seller_address,
            "is_number": data.is_number,
            "huid_number": data.huid_number,
            "license_number": data.license_number,
            "description": data.description,
            "evidence_urls": data.evidence_urls,
            "complainant_name": data.complainant_name,
            "complainant_email": data.complainant_email,
            "complainant_phone": data.complainant_phone,
            "status": "submitted",
            "status_label": "Complaint Registered",
            "next_action": "Assigned to BIS Consumer Affairs & Enforcement Division for preliminary review.",
            "resolution_notes": None,
            "created_at": now,
            "updated_at": now,
        }

        _MOCK_COMPLAINTS[tracking_id] = record_dict
        return ComplaintRecord(**record_dict)

    @classmethod
    def get_complaint(cls, tracking_id: str) -> Optional[ComplaintRecord]:
        raw = _MOCK_COMPLAINTS.get(tracking_id.upper().strip())
        if not raw:
            # Check by raw ID
            for c in _MOCK_COMPLAINTS.values():
                if c["id"] == tracking_id or c["tracking_id"].lower() == tracking_id.lower():
                    return ComplaintRecord(**c)
            return None
        return ComplaintRecord(**raw)

    @classmethod
    def list_complaints(
        cls,
        email: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[ComplaintRecord]:
        results = list(_MOCK_COMPLAINTS.values())
        if email:
            results = [c for c in results if c["complainant_email"].lower() == email.lower()]
        if category:
            results = [c for c in results if c["category"] == category]
        if status:
            results = [c for c in results if c["status"] == status]
        return [ComplaintRecord(**c) for c in results]
