"""BIS Application Tracking Service."""

import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

DEFAULT_APPLICATIONS = [
    {
        "id": "a0000000-0000-0000-0000-000000000001",
        "application_number": "BIS-2026-000123",
        "service_name": "Product Certification Scheme (ISI Mark - Scheme I)",
        "standard_number": "IS 1293:2019",
        "applicant_name": "Rajesh Kumar",
        "company_name": "ElectroTech Industries Pvt Ltd",
        "contact_email": "rajesh@electrotech.co.in",
        "contact_phone": "+91 98765 43210",
        "current_status": "Technical Review",
        "current_step_index": 3,
        "assigned_department": "Electrotechnical Standards Scrutiny Division",
        "expected_completion_date": (datetime.now() + timedelta(days=12)).isoformat(),
        "created_at": (datetime.now() - timedelta(days=18)).isoformat(),
        "remarks": "Factory inspection scheduled for next week. Test samples drawn.",
        "timeline": [
            {
                "step_name": "Application Submitted",
                "step_status": "COMPLETED",
                "description": "Application Form-1 submitted with fee payment receipt and factory layout dossier.",
                "performed_by": "Applicant (Online Portal)",
                "timestamp": (datetime.now() - timedelta(days=18)).strftime("%d %b %Y, %I:%M %p")
            },
            {
                "step_name": "Document Verification",
                "step_status": "COMPLETED",
                "description": "All mandatory documents including QC equipment calibration and MSME certificate verified.",
                "performed_by": "BIS Scrutiny Officer (New Delhi)",
                "timestamp": (datetime.now() - timedelta(days=10)).strftime("%d %b %Y, %I:%M %p")
            },
            {
                "step_name": "Technical Review",
                "step_status": "IN_PROGRESS",
                "description": "Technical audit of manufacturing process flow and in-house testing capability.",
                "performed_by": "BIS Technical Committee",
                "timestamp": (datetime.now() - timedelta(days=2)).strftime("%d %b %Y, %I:%M %p")
            },
            {
                "step_name": "Laboratory Sample Testing",
                "step_status": "PENDING",
                "description": "Independent verification testing of drawn production samples at BIS Central Laboratory.",
                "performed_by": "BIS Sahibabad Central Lab",
                "timestamp": "Estimated in 5 days"
            },
            {
                "step_name": "Competent Authority Approval",
                "step_status": "PENDING",
                "description": "Final review and approval by Deputy Director General (Certification).",
                "performed_by": "DDG (Certification)",
                "timestamp": "Estimated in 10 days"
            },
            {
                "step_name": "Certificate & CML Number Issued",
                "step_status": "PENDING",
                "description": "Digital Grant of Licence (GoL) and CML number issued with ISI mark artwork.",
                "performed_by": "Automated BIS System",
                "timestamp": "Pending Approval"
            }
        ]
    },
    {
        "id": "a0000000-0000-0000-0000-000000000002",
        "application_number": "BIS-2026-000456",
        "service_name": "Compulsory Registration Scheme (CRS)",
        "standard_number": "IS 16046 (Part 2):2018",
        "applicant_name": "Pooja Sharma",
        "company_name": "Zenith Batteries India LLP",
        "contact_email": "pooja@zenithpower.in",
        "contact_phone": "+91 98111 22334",
        "current_status": "Certificate Issued",
        "current_step_index": 6,
        "assigned_department": "Electronics & IT Certification Bureau",
        "expected_completion_date": datetime.now().isoformat(),
        "created_at": (datetime.now() - timedelta(days=35)).isoformat(),
        "remarks": "Registration granted successfully. Registration Number: R-84001928.",
        "timeline": [
            {
                "step_name": "Application Submitted",
                "step_status": "COMPLETED",
                "description": "CRS application submitted with NABL test report from approved laboratory.",
                "performed_by": "Applicant",
                "timestamp": (datetime.now() - timedelta(days=35)).strftime("%d %b %Y")
            },
            {
                "step_name": "Document Verification",
                "step_status": "COMPLETED",
                "description": "Brand authorization letter and test report validity checked.",
                "performed_by": "BIS Officer",
                "timestamp": (datetime.now() - timedelta(days=28)).strftime("%d %b %Y")
            },
            {
                "step_name": "Technical Review",
                "step_status": "COMPLETED",
                "description": "Evaluation of cell parameters and safety margins against IS 16046.",
                "performed_by": "Technical Auditor",
                "timestamp": (datetime.now() - timedelta(days=20)).strftime("%d %b %Y")
            },
            {
                "step_name": "Laboratory Sample Testing",
                "step_status": "COMPLETED",
                "description": "Lab report conformity verified.",
                "performed_by": "BIS Laboratory Network",
                "timestamp": (datetime.now() - timedelta(days=12)).strftime("%d %b %Y")
            },
            {
                "step_name": "Competent Authority Approval",
                "step_status": "COMPLETED",
                "description": "Approved by Scrutiny Head.",
                "performed_by": "Head (CRS)",
                "timestamp": (datetime.now() - timedelta(days=4)).strftime("%d %b %Y")
            },
            {
                "step_name": "Certificate & CML Number Issued",
                "step_status": "COMPLETED",
                "description": "CRS Registration No. R-84001928 generated.",
                "performed_by": "BIS System",
                "timestamp": (datetime.now() - timedelta(days=1)).strftime("%d %b %Y")
            }
        ]
    },
    {
        "id": "a0000000-0000-0000-0000-000000000003",
        "application_number": "BIS-2026-000789",
        "service_name": "Hallmarking Scheme for Gold & Silver Jewellery",
        "standard_number": "IS 1417:2016",
        "applicant_name": "Amit Varma",
        "company_name": "Varma Jewellers Retail",
        "contact_email": "amit@varmajewellers.com",
        "contact_phone": "+91 97123 45678",
        "current_status": "Document Verification",
        "current_step_index": 2,
        "assigned_department": "Hallmarking Management Cell (Mumbai Region)",
        "expected_completion_date": (datetime.now() + timedelta(days=4)).isoformat(),
        "created_at": (datetime.now() - timedelta(days=3)).isoformat(),
        "remarks": "GST details matching with MCA records. Awaiting outlet map.",
        "timeline": [
            {
                "step_name": "Application Submitted",
                "step_status": "COMPLETED",
                "description": "Online jeweller registration submitted.",
                "performed_by": "Applicant",
                "timestamp": (datetime.now() - timedelta(days=3)).strftime("%d %b %Y")
            },
            {
                "step_name": "Document Verification",
                "step_status": "IN_PROGRESS",
                "description": "Verification of GST and premises proof.",
                "performed_by": "BIS Officer",
                "timestamp": (datetime.now() - timedelta(days=1)).strftime("%d %b %Y")
            },
            {
                "step_name": "Technical Review",
                "step_status": "PENDING",
                "description": "Review of purity grades and AHC alignment.",
                "performed_by": "Assay Officer",
                "timestamp": "Upcoming"
            },
            {
                "step_name": "Approval",
                "step_status": "PENDING",
                "description": "Final grant of registration.",
                "performed_by": "Regional Head",
                "timestamp": "Upcoming"
            }
        ]
    }
]


class ApplicationService:
    """Manages application status queries and tracking."""

    @classmethod
    def list_applications(cls, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all applications."""
        if status_filter and status_filter.lower() != "all":
            return [a for a in DEFAULT_APPLICATIONS if a["current_status"].lower() == status_filter.lower()]
        return DEFAULT_APPLICATIONS

    @classmethod
    def get_by_number(cls, app_number: str) -> Optional[Dict[str, Any]]:
        """Look up application by number (e.g. BIS-2026-000123)."""
        clean_num = app_number.strip().upper()
        for app in DEFAULT_APPLICATIONS:
            if app["application_number"].upper() == clean_num:
                return app
        return None

    @classmethod
    def get_by_id(cls, app_id: str) -> Optional[Dict[str, Any]]:
        """Look up application by UUID."""
        for app in DEFAULT_APPLICATIONS:
            if str(app["id"]) == app_id:
                return app
        return None

    @classmethod
    def create_application(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new demo application."""
        new_id = str(uuid.uuid4())
        app_num = f"BIS-2026-{str(len(DEFAULT_APPLICATIONS) + 1).zfill(6)}"
        new_app = {
            "id": new_id,
            "application_number": app_num,
            "service_name": data.get("service_name", "Product Certification Scheme (ISI Mark)"),
            "standard_number": data.get("standard_number", "IS 10500:2012"),
            "applicant_name": data.get("applicant_name", "Applicant"),
            "company_name": data.get("company_name", "Enterprise Co."),
            "contact_email": data.get("contact_email", "contact@enterprise.in"),
            "contact_phone": data.get("contact_phone", "+91 90000 00000"),
            "current_status": "Application Submitted",
            "current_step_index": 1,
            "assigned_department": "Central BIS Scrutiny Cell",
            "expected_completion_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "created_at": datetime.now().isoformat(),
            "remarks": "Application submitted online via AI Assistant Portal. Awaiting preliminary document scrutiny.",
            "timeline": [
                {
                    "step_name": "Application Submitted",
                    "step_status": "COMPLETED",
                    "description": "Application submitted with uploaded preliminary documents.",
                    "performed_by": "Applicant (Online)",
                    "timestamp": datetime.now().strftime("%d %b %Y, %I:%M %p")
                },
                {
                    "step_name": "Document Verification",
                    "step_status": "IN_PROGRESS",
                    "description": "Preliminary scrutiny of uploaded factory and quality documents.",
                    "performed_by": "BIS Scrutiny Officer",
                    "timestamp": "Estimated in 2-3 business days"
                },
                {
                    "step_name": "Technical Review",
                    "step_status": "PENDING",
                    "description": "Technical compliance check with Indian Standard specifications.",
                    "performed_by": "Technical Auditor",
                    "timestamp": "Pending Document Scrutiny"
                },
                {
                    "step_name": "Laboratory Sample Testing",
                    "step_status": "PENDING",
                    "description": "Product sample testing at accredited laboratory.",
                    "performed_by": "BIS Laboratory",
                    "timestamp": "Pending Technical Audit"
                },
                {
                    "step_name": "Approval",
                    "step_status": "PENDING",
                    "description": "Final grant approval and CML / Registration generation.",
                    "performed_by": "Competent Authority",
                    "timestamp": "Pending Testing"
                }
            ]
        }
        DEFAULT_APPLICATIONS.insert(0, new_app)
        return new_app
