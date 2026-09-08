"""BIS Service Catalogue Service."""

import uuid
from typing import List, Optional, Dict, Any

# Realistic default BIS services directory
DEFAULT_BIS_SERVICES = [
    {
        "name": "Product Certification Scheme (ISI Mark - Scheme I)",
        "slug": "isi-mark-scheme-1",
        "category": "Product Certification",
        "description": "Third-party guarantee of quality, safety, and reliability of products to consumers under BIS Act, 2016.",
        "eligibility": "Domestic and foreign manufacturers manufacturing products complying with relevant Indian Standards (IS).",
        "documents_required": [
            "Factory registration / DIC / MSME Udyam certificate",
            "Proof of premises ownership/lease deed",
            "List of manufacturing machinery and equipment",
            "List of in-house testing equipment with calibration certificates",
            "Technical qualification details of QC personnel",
            "Plant layout and process flow chart"
        ],
        "fee_structure": "Application Fee: ₹1,000 | Inspection Fee: ₹7,000/day | Marking Fee: Standard-specific schedule",
        "processing_time_days": 30,
        "how_to_apply": "Submit application online on the Manakonline portal (www.manakonline.in), upload required factory and test documents, pay prescribed fees, and schedule factory audit.",
        "portal_url": "https://www.manakonline.in",
        "is_active": True,
    },
    {
        "name": "Compulsory Registration Scheme (CRS)",
        "slug": "compulsory-registration-scheme",
        "category": "Registration",
        "description": "Mandatory registration for IT and electronic goods under Ministry of Electronics and Information Technology (MeitY) orders.",
        "eligibility": "Manufacturers of designated electronics, IT, solar photovoltaic, and telecom hardware.",
        "documents_required": [
            "Test report from BIS-recognized laboratory (within 90 days validity)",
            "Authorized Indian Representative (AIR) undertaking for foreign manufacturers",
            "Brand authorization / Trademark registration copy",
            "Manufacturing unit legal entity proof"
        ],
        "fee_structure": "Application Fee: ₹10,000 per model series | Processing Fee: ₹50,000",
        "processing_time_days": 20,
        "how_to_apply": "Test product in BIS-approved lab, obtain valid test report, create account on CRS portal, upload report and legal undertakings, receive digital Registration Number (R-Number).",
        "portal_url": "https://www.crsbis.in",
        "is_active": True,
    },
    {
        "name": "Hallmarking Scheme for Gold & Silver Jewellery",
        "slug": "hallmarking-scheme",
        "category": "Hallmarking",
        "description": "Accurate determination and official recording of the proportionate content of precious metal in gold and silver articles.",
        "eligibility": "Jewellers and Assay & Hallmarking Centres (AHC) dealing in precious gold and silver artifacts.",
        "documents_required": [
            "GST Registration Certificate",
            "Proof of outlet address (electricity bill/lease)",
            "Proprietor/Partner/Director ID and address proof",
            "Turnover declaration"
        ],
        "fee_structure": "Zero registration fee for retail jewellers (online registration) | Hallmarking charge: ₹45/gold article, ₹35/silver article",
        "processing_time_days": 5,
        "how_to_apply": "Register online via Manakonline with instant automated generation of registration certificate, send jewellery lots to certified AHCs for XRF/fire assay and laser engraving of 6-digit HUID.",
        "portal_url": "https://www.manakonline.in",
        "is_active": True,
    },
    {
        "name": "Foreign Manufacturers Certification Scheme (FMCS)",
        "slug": "fmcs-scheme",
        "category": "Product Certification",
        "description": "Licence granting for foreign manufacturers intending to use the Standard Mark (ISI) on products exported to India.",
        "eligibility": "Manufacturing units located outside India with appointed Authorized Indian Representative (AIR).",
        "documents_required": [
            "Manufacturing licence in origin country",
            "Nomination of Authorized Indian Representative (AIR)",
            "Process flow chart and quality assurance plan",
            "Laboratory test reports and calibration certificates",
            "Plant equipment details"
        ],
        "fee_structure": "Application Fee: USD 1,000 | Inspection Charges: Actual travel/accommodation + USD 3,000 | Performance Bank Guarantee",
        "processing_time_days": 60,
        "how_to_apply": "Submit Form-1 online, pay application fee, host BIS audit officers for overseas factory inspection, draw samples for testing in India, obtain licence upon compliance.",
        "portal_url": "https://www.bis.gov.in",
        "is_active": True,
    },
    {
        "name": "Laboratory Recognition Scheme (LRS)",
        "slug": "laboratory-recognition-scheme",
        "category": "Laboratory Services",
        "description": "Recognition of commercial, academic, and industrial testing laboratories for third-party conformity testing.",
        "eligibility": "NABL accredited testing laboratories operating across physical, chemical, electrical, or biological disciplines.",
        "documents_required": [
            "NABL accreditation certificate with scope schedule",
            "Quality Manual as per ISO/IEC 17025:2017",
            "Equipment calibration records",
            "Proficiency Testing (PT) / ILC records"
        ],
        "fee_structure": "Application Fee: ₹10,000 | Assessment Fee: ₹25,000/auditor-day | Recognition Fee: ₹50,000",
        "processing_time_days": 45,
        "how_to_apply": "Apply via LIMS portal, upload ISO/IEC 17025 scope mapping to Indian Standards, host BIS assessment team, resolve audit findings.",
        "portal_url": "https://www.bis.gov.in",
        "is_active": True,
    },
    {
        "name": "Management Systems Certification (MSCD)",
        "slug": "management-systems-certification",
        "category": "Certification",
        "description": "Certification of quality, environmental, occupational health, and food safety management systems (ISO 9001, ISO 14001, ISO 22000, ISO 45001).",
        "eligibility": "Any organization (manufacturing or services) with an implemented management system for minimum 3 months.",
        "documents_required": [
            "Management System Manual",
            "Internal audit and Management Review Meeting (MRM) records",
            "Process flow and organizational structure chart"
        ],
        "fee_structure": "Application Fee: ₹5,000 | Audit Fee: ₹12,000/manday",
        "processing_time_days": 30,
        "how_to_apply": "Submit application form with Quality Manual, complete Stage-1 document audit, undergo Stage-2 on-site certification audit.",
        "portal_url": "https://www.bis.gov.in",
        "is_active": True,
    },
    {
        "name": "Tatkal Licensing Scheme",
        "slug": "tatkal-licensing-scheme",
        "category": "Licensing",
        "description": "Fast-track grant of licence for micro, small, and medium enterprises with pre-tested samples.",
        "eligibility": "MSMEs holding valid Udyam Registration applying for products with available testing facilities.",
        "documents_required": [
            "Udyam Registration Certificate",
            "Factory test report and independent lab test report",
            "Self-declaration of conformity"
        ],
        "fee_structure": "Regular application fee + 50% Tatkal facilitation fee (concessions apply for micro enterprises)",
        "processing_time_days": 15,
        "how_to_apply": "Select Tatkal mode on Manakonline, submit complete compliance dossier, undergo priority verification within 15 business days.",
        "portal_url": "https://www.manakonline.in",
        "is_active": True,
    },
    {
        "name": "BIS Care Consumer Complaint & Verification Service",
        "slug": "bis-care-consumer-service",
        "category": "Consumer Services",
        "description": "Citizen service to verify ISI mark authenticity, Hallmarking HUID validity, and register quality grievances.",
        "eligibility": "All citizens, consumers, and purchasing authorities.",
        "documents_required": [
            "Product bill / cash memo (for complaints)",
            "Photographs of product label and ISI/HUID mark"
        ],
        "fee_structure": "Free of cost public service",
        "processing_time_days": 7,
        "how_to_apply": "Download BIS Care Mobile App or access web portal, enter CML licence number or 6-digit HUID code for instant verification, or submit grievance with attached invoice.",
        "portal_url": "https://www.bis.gov.in",
        "is_active": True,
    },
    {
        "name": "Eco Mark Certification Scheme",
        "slug": "eco-mark-certification",
        "category": "Product Certification",
        "description": "Labeling of environment-friendly consumer products meeting specific environmental criteria alongside quality standards.",
        "eligibility": "Manufacturers producing goods complying with both relevant Indian Standards and MoEFCC ecological criteria.",
        "documents_required": [
            "Valid BIS ISI Mark licence or simultaneous application",
            "Consent to Operate (CTO) from State Pollution Control Board (SPCB)",
            "Recyclability and biodegradability analysis reports"
        ],
        "fee_structure": "Application Fee: ₹2,000 | Annual Eco Mark Fee: ₹10,000",
        "processing_time_days": 40,
        "how_to_apply": "Apply under Eco Mark scheme on Manakonline, submit environmental compliance certificates, verify product test parameters against Eco Mark notifications.",
        "portal_url": "https://www.manakonline.in",
        "is_active": True,
    },
    {
        "name": "Standardization Feedback & Technical Committee Participation",
        "slug": "standards-feedback-portal",
        "category": "Inspection",
        "description": "Citizen and industry participation portal for reviewing draft Indian Standards and submitting technical amendments.",
        "eligibility": "Industry associations, research bodies, academic institutions, and individual subject matter experts.",
        "documents_required": [
            "Technical commentary with supporting empirical research/data",
            "Organization affiliation details"
        ],
        "fee_structure": "Free public participation",
        "processing_time_days": 10,
        "how_to_apply": "Browse draft standards on Wide Circulation portal, submit clause-by-clause comments online during the 60-day public review window.",
        "portal_url": "https://www.services.bis.gov.in",
        "is_active": True,
    }
]


class BISServiceCatalogue:
    """In-memory and DB-backed service directory."""

    @classmethod
    def list_services(cls, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve BIS services matching optional filters."""
        results = DEFAULT_BIS_SERVICES
        if category and category.lower() != "all":
            results = [s for s in results if s["category"].lower() == category.lower()]
        if search:
            q = search.lower()
            results = [
                s for s in results
                if q in s["name"].lower() or q in s["description"].lower() or q in s["category"].lower()
            ]
        return results

    @classmethod
    def get_service_by_slug(cls, slug: str) -> Optional[Dict[str, Any]]:
        """Find a single BIS service by slug."""
        for s in DEFAULT_BIS_SERVICES:
            if s["slug"] == slug:
                return s
        return None
