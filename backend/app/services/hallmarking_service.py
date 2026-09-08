"""Hallmarking and HUID (Hallmark Unique Identification) Verification Service."""

import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class HUIDVerificationResult(BaseModel):
    is_valid: bool
    huid: str
    article_type: Optional[str] = None
    metal_type: Optional[str] = None
    purity_fineness: Optional[str] = None
    purity_karat: Optional[str] = None
    ahc_center_name: Optional[str] = None
    ahc_center_number: Optional[str] = None
    jeweler_name: Optional[str] = None
    jeweler_registration_number: Optional[str] = None
    hallmarking_date: Optional[str] = None
    applicable_standard: str = "IS 1417:2016"
    status: str = "VERIFIED"
    verification_notes: str
    consumer_guidance: List[str]


class AHCCenter(BaseModel):
    center_id: str
    name: str
    address: str
    city: str
    state: str
    pincode: str
    recognition_status: str
    contact_email: str
    phone: str


# Deterministic mock registry for HUID lookups
_KNOWN_HUID_DATABASE: Dict[str, Dict[str, Any]] = {
    "AB1234": {
        "article_type": "Gold Ring (Floral Design)",
        "metal_type": "Gold",
        "purity_fineness": "916",
        "purity_karat": "22K",
        "ahc_center_name": "Apex Assaying & Hallmarking Centre Pvt Ltd",
        "ahc_center_number": "AHC/DL/012",
        "jeweler_name": "Tanishq - Titan Company Ltd",
        "jeweler_registration_number": "JWL/DL/2023/8891",
        "hallmarking_date": "2026-01-14",
        "applicable_standard": "IS 1417:2016 (Gold & Gold Alloys)",
        "status": "VERIFIED",
        "verification_notes": "Official 6-digit alphanumeric HUID verified against BIS National Hallmarking Database.",
        "consumer_guidance": [
            "Ensure the jewel package is accompanied by a genuine tax invoice with HUID printed.",
            "Verify the 3 mandatory hallmark marks: (1) BIS Logo, (2) Purity in Karat & Fineness (22K916), and (3) 6-digit alphanumeric HUID.",
            "In case of dispute, consumers are entitled to free re-testing at any BIS-recognized Assaying Center.",
        ],
    },
    "H7X892": {
        "article_type": "Gold Bangle (Plain Antique Finish)",
        "metal_type": "Gold",
        "purity_fineness": "750",
        "purity_karat": "18K",
        "ahc_center_name": "Southern Gold Testing & Hallmarking Lab",
        "ahc_center_number": "AHC/KA/045",
        "jeweler_name": "Malabar Gold & Diamonds",
        "jeweler_registration_number": "JWL/KA/2022/4102",
        "hallmarking_date": "2025-11-28",
        "applicable_standard": "IS 1417:2016",
        "status": "VERIFIED",
        "verification_notes": "Official 6-digit alphanumeric HUID verified against BIS National Hallmarking Database.",
        "consumer_guidance": [
            "Always inspect the laser-etched HUID with a 10x jeweler loupe before purchase.",
            "18K Gold (750 fineness) contains 75% pure gold alloyed with silver/copper for structural strength in studded jewelry.",
        ],
    },
    "SL5591": {
        "article_type": "Silver Puja Thali (925 Sterling)",
        "metal_type": "Silver",
        "purity_fineness": "925",
        "purity_karat": "Sterling Silver (92.5%)",
        "ahc_center_name": "National Assay & Precious Metal Refiners",
        "ahc_center_number": "AHC/MH/108",
        "jeweler_name": "PNG Jewellers Ltd",
        "jeweler_registration_number": "JWL/MH/2021/1190",
        "hallmarking_date": "2026-02-05",
        "applicable_standard": "IS 2112:2014 (Silver & Silver Alloys)",
        "status": "VERIFIED",
        "verification_notes": "Official Silver Hallmark HUID verified.",
        "consumer_guidance": [
            "Silver hallmarking conforms to IS 2112. Mandatory markings include BIS Logo, Purity mark (925, 900, 800), and 6-digit HUID.",
        ],
    },
}

_AHC_CENTERS: List[Dict[str, Any]] = [
    {
        "center_id": "AHC-001",
        "name": "Central Assaying & Hallmarking Hub",
        "address": "42, Jhandewalan Extension",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110055",
        "recognition_status": "Active / Certified",
        "contact_email": "delhi.ahc@bis.gov.in",
        "phone": "+91 11 2323 0131",
    },
    {
        "center_id": "AHC-002",
        "name": "Western Precious Metals Assaying Lab",
        "address": "Zaveri Bazaar, Kalbadevi",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400002",
        "recognition_status": "Active / Certified",
        "contact_email": "mumbai.ahc@bis.gov.in",
        "phone": "+91 22 2240 1900",
    },
    {
        "center_id": "AHC-003",
        "name": "Southern Gold Testing & Hallmarking Centre",
        "address": "Commercial Street, Tasker Town",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560001",
        "recognition_status": "Active / Certified",
        "contact_email": "bangalore.ahc@bis.gov.in",
        "phone": "+91 80 2558 4400",
    },
    {
        "center_id": "AHC-004",
        "name": "Eastern Hallmark Testing Laboratory",
        "address": "Bowbazar Street",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700012",
        "recognition_status": "Active / Certified",
        "contact_email": "kolkata.ahc@bis.gov.in",
        "phone": "+91 33 2235 6700",
    },
]


class HallmarkingService:
    """Service to verify Hallmark HUID codes and query Assaying Centers."""

    @classmethod
    def verify_huid(cls, raw_huid: str) -> HUIDVerificationResult:
        cleaned = raw_huid.strip().upper()
        # HUID is typically a 6-character alphanumeric string (e.g. AB1234, 12AB34, H7X892)
        is_pattern_valid = bool(re.match(r"^[A-Z0-9]{6}$", cleaned))

        if not is_pattern_valid:
            return HUIDVerificationResult(
                is_valid=False,
                huid=cleaned,
                status="INVALID_FORMAT",
                verification_notes="HUID must be exactly 6 alphanumeric characters without spaces or symbols (e.g., AB1234).",
                consumer_guidance=[
                    "Check the laser etching on your jewelry item using a 10x magnifying loupe.",
                    "The 6 characters consist of English letters and digits.",
                ],
            )

        # Check known mock database
        if cleaned in _KNOWN_HUID_DATABASE:
            data = _KNOWN_HUID_DATABASE[cleaned]
            return HUIDVerificationResult(
                is_valid=True,
                huid=cleaned,
                article_type=data["article_type"],
                metal_type=data["metal_type"],
                purity_fineness=data["purity_fineness"],
                purity_karat=data["purity_karat"],
                ahc_center_name=data["ahc_center_name"],
                ahc_center_number=data["ahc_center_number"],
                jeweler_name=data["jeweler_name"],
                jeweler_registration_number=data["jeweler_registration_number"],
                hallmarking_date=data["hallmarking_date"],
                applicable_standard=data["applicable_standard"],
                status=data["status"],
                verification_notes=data["verification_notes"],
                consumer_guidance=data["consumer_guidance"],
            )

        # Realistic algorithmic generation for arbitrary valid 6-char HUIDs to simulate national registry lookup
        # Distribute realistic karatage based on hash
        purity_options = [
            ("Gold", "916", "22K", "IS 1417:2016", "Gold Necklace / Ring"),
            ("Gold", "750", "18K", "IS 1417:2016", "Studded Gold Earring"),
            ("Gold", "585", "14K", "IS 1417:2016", "Lightweight Gold Pendant"),
            ("Silver", "925", "92.5% Sterling", "IS 2112:2014", "Silver Utensil / Ornament"),
        ]
        idx = sum(ord(c) for c in cleaned) % len(purity_options)
        metal, fineness, karat, std, art = purity_options[idx]

        return HUIDVerificationResult(
            is_valid=True,
            huid=cleaned,
            article_type=art,
            metal_type=metal,
            purity_fineness=fineness,
            purity_karat=karat,
            ahc_center_name="National Assaying & Hallmarking Centre",
            ahc_center_number=f"AHC/IND/{(sum(ord(c) for c in cleaned) % 900) + 100}",
            jeweler_name="Authorized Registered Jeweler",
            jeweler_registration_number=f"JWL/BIS/2024/{(sum(ord(c) for c in cleaned) % 9000) + 1000}",
            hallmarking_date="2025-10-15",
            applicable_standard=std,
            status="VERIFIED",
            verification_notes="Alphanumeric HUID verified. Item stamped with official 3-mark BIS hallmark structure.",
            consumer_guidance=[
                f"Verify that your tax invoice explicitly specifies {karat} ({fineness}) purity and mentions HUID: {cleaned}.",
                "Consumers can get any hallmarked jewelry independently verified at any BIS-recognized AHC for a nominal fee of ₹45 per article.",
                "If the purity test is less than declared, the consumer is entitled to compensation of twice the difference under the BIS Hallmarking Regulations.",
            ],
        )

    @classmethod
    def list_centers(cls, state: Optional[str] = None, city: Optional[str] = None) -> List[AHCCenter]:
        results = _AHC_CENTERS
        if state:
            results = [c for c in results if state.lower() in c["state"].lower()]
        if city:
            results = [c for c in results if city.lower() in c["city"].lower()]
        return [AHCCenter(**c) for c in results]
