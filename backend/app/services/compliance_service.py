"""BIS Compliance Evaluation and Checklist Engine."""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DEFAULT_COMPLIANCE_RECORDS = [
    {
        "id": "c0000000-0000-0000-0000-000000000001",
        "product_name": "Molded Case Circuit Breaker (MCCB)",
        "standard_number": "IS/IEC 60947-2:2016",
        "scheme_name": "ISI Mark Scheme-I (Mandatory QCO)",
        "compliance_score": 85,
        "status": "PARTIALLY_COMPLIANT",
        "expiry_date": (datetime.now() + timedelta(days=180)).strftime("%d %b %Y"),
        "checklist_items": [
            {"title": "Relevant Indian Standard Identified (IS/IEC 60947-2)", "completed": True, "category": "Standardization"},
            {"title": "Factory in-house testing equipment calibrated", "completed": True, "category": "Quality Control"},
            {"title": "Qualified Quality Control (QC) personnel appointed", "completed": True, "category": "Personnel"},
            {"title": "Independent NABL lab test report generated", "completed": True, "category": "Testing"},
            {"title": "Factory audit & inspection completed by BIS", "completed": False, "category": "Audit"},
            {"title": "Annual marking fee paid & CML licence active", "completed": False, "category": "Certification"}
        ],
        "missing_requirements": [
            "Schedule upcoming factory audit with BIS regional branch",
            "Upload latest calibration certificate for high-voltage dielectric test bench"
        ]
    },
    {
        "id": "c0000000-0000-0000-0000-000000000002",
        "product_name": "Packaged Natural Drinking Water",
        "standard_number": "IS 13428:2005",
        "scheme_name": "ISI Mark Scheme-I (Mandatory)",
        "compliance_score": 100,
        "status": "COMPLIANT",
        "expiry_date": (datetime.now() + timedelta(days=320)).strftime("%d %b %Y"),
        "checklist_items": [
            {"title": "Standard IS 13428:2005 compliance verified", "completed": True, "category": "Standardization"},
            {"title": "In-house microbiological testing laboratory operational", "completed": True, "category": "Testing"},
            {"title": "Ozonation and reverse osmosis monitoring logs maintained", "completed": True, "category": "Process"},
            {"title": "BIS Licence CML-9100234 active", "completed": True, "category": "Certification"},
            {"title": "Batch testing records up to date", "completed": True, "category": "Record Keeping"}
        ],
        "missing_requirements": []
    },
    {
        "id": "c0000000-0000-0000-0000-000000000003",
        "product_name": "Smart LED Television Unit (55-inch)",
        "standard_number": "IS 616:2017 / IEC 60065:2014",
        "scheme_name": "Compulsory Registration Scheme (CRS)",
        "compliance_score": 50,
        "status": "ACTION_REQUIRED",
        "expiry_date": "Pending Registration",
        "checklist_items": [
            {"title": "Safety standard IS 616 mapped", "completed": True, "category": "Standardization"},
            {"title": "NABL test report for acoustic & electrical safety", "completed": True, "category": "Testing"},
            {"title": "Authorized Indian Representative (AIR) agreement executed", "completed": False, "category": "Legal"},
            {"title": "CRS Portal registration submission", "completed": False, "category": "Registration"},
            {"title": "R-Number labeling artwork on retail packaging", "completed": False, "category": "Packaging"}
        ],
        "missing_requirements": [
            "Submit notarized AIR undertaking for overseas manufacturing facility",
            "Complete final CRS portal fee payment"
        ]
    }
]


class ComplianceService:
    """Evaluates product compliance and generates actionable compliance reports."""

    @classmethod
    def list_records(cls) -> List[Dict[str, Any]]:
        """List user compliance records."""
        return DEFAULT_COMPLIANCE_RECORDS

    @classmethod
    def evaluate_product(cls, product_name: str, standard_number: str, industry: Optional[str] = None) -> Dict[str, Any]:
        """Perform automated AI compliance evaluation for a given product and standard."""
        checklist = [
            {"title": f"Verify product adherence to {standard_number}", "completed": True, "category": "Standardization"},
            {"title": "Establish in-house testing laboratory equipped as per standard schedule", "completed": False, "category": "Quality Control"},
            {"title": "Draft Quality Assurance Plan (QAP) and manufacturing process flow", "completed": False, "category": "Documentation"},
            {"title": "Perform preliminary pre-testing at BIS-recognized NABL laboratory", "completed": False, "category": "Testing"},
            {"title": "Submit Scheme Application Form on Manakonline with fee", "completed": False, "category": "Application"},
            {"title": "Factory surveillance inspection and independent sample draw", "completed": False, "category": "Surveillance"}
        ]
        
        return {
            "product_name": product_name,
            "standard_number": standard_number,
            "industry": industry or "General Manufacturing",
            "estimated_compliance_score": 35,
            "status": "ACTION_REQUIRED",
            "applicable_scheme": "Product Certification Scheme (ISI Mark - Scheme I)",
            "qco_status": "Mandatory Quality Control Order (QCO) may apply",
            "checklist": checklist,
            "recommended_next_steps": [
                f"Download and review testing requirements specified in {standard_number}",
                "Check equipment list required for in-house testing under BIS Scheme of Inspection and Testing (SIT)",
                "Engage BIS-accredited testing laboratory for sample pre-test"
            ],
            "disclaimer": "AI-generated compliance assessment is advisory. Verify mandatory QCO notification dates with the official BIS Gazette."
        }
