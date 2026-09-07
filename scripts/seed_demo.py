"""Production-ready idempotent demo data seed script for BIS Copilot (SIH 26107).

Seeds authentic Indian Standards, clauses, vector embeddings, accredited testing laboratories,
certification schemes, and demo user accounts matching the SIH Evaluator Walkthrough scenarios:
1. Cement: IS 12269:2015 Clause 6.2 (53 Grade OPC Compressive Strength)
2. TMT Rebars: IS 1786:2008 Clause 8.1 (Fe 500D Mechanical Properties)
3. Drinking Water: IS 10500:2012 Clause 4.1 (TDS, pH, Hardness parameters)
4. Toy Safety: IS 9873 (Part 1):2019 Clause 4.4 (Choking hazards)
"""

import argparse
import os
import sys
import uuid
from datetime import date, datetime, timezone

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.auth.hashing import hash_password
from backend.app.config import get_settings
from backend.app.database.session import SyncSessionLocal
from backend.app.ingestion.embeddings import DeterministicEmbeddingProvider
from backend.app.models import (
    CertificationScheme,
    Clause,
    Document,
    DocumentChunk,
    Laboratory,
    LaboratoryCapability,
    Standard,
    User,
)

settings = get_settings()
embedder = DeterministicEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)


def seed_demo_data(if_empty: bool = False):
    """Seed idempotent demo records."""
    session = SyncSessionLocal()
    try:
        # Check if already seeded when --if-empty is set
        existing_std_count = session.query(Standard).count()
        if if_empty and existing_std_count >= 3:
            print(f"[DEMO SEED] Database already initialized with {existing_std_count} standards. Skipping.")
            return

        print("[DEMO SEED] Starting SIH 26107 Demo Data Seeding...")

        # -------------------------------------------------------------
        # 1. DEMO USERS
        # -------------------------------------------------------------
        demo_users = [
            {
                "name": "BIS Senior Auditor",
                "email": "auditor@bis.gov.in",
                "password": "auditor123",
                "role": "auditor",
                "preferred_language": "en",
            },
            {
                "name": "BIS Platform Administrator",
                "email": "admin@bis.gov.in",
                "password": "admin123",
                "role": "admin",
                "preferred_language": "en",
            },
            {
                "name": "General Public User",
                "email": "user@bis.gov.in",
                "password": "user123",
                "role": "user",
                "preferred_language": "hi",
            },
        ]

        for u in demo_users:
            user_obj = session.query(User).filter_by(email=u["email"]).first()
            if not user_obj:
                user_obj = User(
                    name=u["name"],
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                    preferred_language=u["preferred_language"],
                    is_active=True,
                )
                session.add(user_obj)
                session.flush()
                print(f"  + Created user: {u['email']} (role: {u['role']})")

        # -------------------------------------------------------------
        # 2. DOCUMENTS & STANDARDS
        # -------------------------------------------------------------
        standards_data = [
            {
                "doc_title": "IS 12269:2015 53 Grade Ordinary Portland Cement Specification",
                "standard_number": "IS 12269:2015",
                "std_title": "53 Grade Ordinary Portland Cement — Specification",
                "description": "Prescribes requirements for chemical and physical properties of 53 grade ordinary portland cement used in high-strength concrete applications.",
                "domain": "Civil Engineering",
                "edition": "Fifth Revision",
                "year": 2015,
                "clauses": [
                    {
                        "clause_number": "6.2",
                        "heading": "Compressive Strength Requirements",
                        "content": (
                            "Standard: IS 12269:2015 Clause: 6.2 Heading: Compressive Strength Requirements\n"
                            "The average compressive strength of not less than three mortar cubes (area of face 50 cm²) "
                            "prepared in the manner described in IS 4031 (Part 6) shall be as follows:\n"
                            "a) 72 ± 1 h (3 days): Not less than 27 MPa (N/mm²);\n"
                            "b) 168 ± 2 h (7 days): Not less than 37 MPa (N/mm²);\n"
                            "c) 672 ± 4 h (28 days): Not less than 53 MPa (N/mm²).\n"
                            "Cement shall be tested in a recognized laboratory under standard temperature of 27 ± 2°C."
                        ),
                        "page_start": 4,
                        "page_end": 5,
                    },
                    {
                        "clause_number": "5.1",
                        "heading": "Chemical Requirements",
                        "content": (
                            "Standard: IS 12269:2015 Clause: 5.1 Heading: Chemical Requirements\n"
                            "The ratio of the percentage of lime to percentages of silica, alumina and iron oxide (Lime Saturation Factor, LSF) "
                            "shall be not less than 0.80 and not greater than 1.02. Insoluble residue shall not exceed 5.0 percent by mass. "
                            "Magnesia (MgO) content shall not exceed 6.0 percent by mass."
                        ),
                        "page_start": 3,
                        "page_end": 4,
                    },
                ],
            },
            {
                "doc_title": "IS 1786:2008 High Strength Deformed Steel Bars Specification",
                "standard_number": "IS 1786:2008",
                "std_title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement — Specification",
                "description": "Covers physical, mechanical, and chemical requirements of deformed steel bars and wires for concrete reinforcement, specifically grades Fe 415, Fe 500, Fe 500D, and Fe 550.",
                "domain": "Metallurgical Engineering",
                "edition": "Fourth Revision",
                "year": 2008,
                "clauses": [
                    {
                        "clause_number": "8.1",
                        "heading": "Mechanical Properties of Fe 500D Rebars",
                        "content": (
                            "Standard: IS 1786:2008 Clause: 8.1 Heading: Mechanical Properties of Fe 500D\n"
                            "For Fe 500D high strength deformed steel bars, the minimum 0.2 percent proof stress or yield stress "
                            "shall be 500.0 N/mm² (MPa). The minimum tensile strength shall be 565.0 N/mm² (not less than 1.10 times the actual yield stress). "
                            "The percentage elongation at gauge length 5.65√A shall be not less than 16.0 percent. "
                            "Total elongation at maximum force (Ag) shall be not less than 5.0 percent."
                        ),
                        "page_start": 6,
                        "page_end": 7,
                    },
                    {
                        "clause_number": "4.2",
                        "heading": "Chemical Composition",
                        "content": (
                            "Standard: IS 1786:2008 Clause: 4.2 Heading: Chemical Composition\n"
                            "For Fe 500D grade, carbon content shall not exceed 0.25 percent maximum. "
                            "Sulfur and phosphorus combined shall not exceed 0.080 percent (individual limits: S max 0.040 percent, P max 0.040 percent). "
                            "Carbon equivalent (CE) shall not exceed 0.42 percent for guaranteed weldability."
                        ),
                        "page_start": 3,
                        "page_end": 4,
                    },
                ],
            },
            {
                "doc_title": "IS 10500:2012 Drinking Water Specification",
                "standard_number": "IS 10500:2012",
                "std_title": "Drinking Water — Specification (Second Revision)",
                "description": "Prescribes quality limits and testing parameters for potable drinking water across physical, chemical, and microbiological characteristics.",
                "domain": "Chemical & Environment",
                "edition": "Second Revision",
                "year": 2012,
                "clauses": [
                    {
                        "clause_number": "4.1",
                        "heading": "Organoleptic and Physical Parameters",
                        "content": (
                            "Standard: IS 10500:2012 Clause: 4.1 Heading: Organoleptic and Physical Parameters\n"
                            "Drinking water quality limits:\n"
                            "1. Total Dissolved Solids (TDS): Acceptable limit is 500 mg/l (permissible limit in absence of alternate source: 2000 mg/l).\n"
                            "2. pH Value: Acceptable limit is 6.5 to 8.5 (no relaxation).\n"
                            "3. Turbidity: Acceptable limit is 1 NTU (permissible limit: 5 NTU).\n"
                            "4. Total Hardness (as CaCO3): Acceptable limit is 200 mg/l (permissible limit: 600 mg/l).\n"
                            "5. Fluoride (as F): Acceptable limit is 1.0 mg/l (permissible limit: 1.5 mg/l)."
                        ),
                        "page_start": 2,
                        "page_end": 3,
                    },
                ],
            },
            {
                "doc_title": "IS 9873 (Part 1):2019 Safety of Toys Mechanical and Physical Properties",
                "standard_number": "IS 9873 (Part 1):2019",
                "std_title": "Safety of Toys — Part 1: Safety Aspects Related to Mechanical and Physical Properties",
                "description": "Specifies acceptable criteria for the physical and mechanical properties of toys designed for use by children in various age groups under 14 years.",
                "domain": "Consumer Products",
                "edition": "Second Revision",
                "year": 2019,
                "clauses": [
                    {
                        "clause_number": "4.4",
                        "heading": "Small Parts and Choking Hazard Prevention",
                        "content": (
                            "Standard: IS 9873 (Part 1):2019 Clause: 4.4 Heading: Small Parts\n"
                            "Toys intended for children under 36 months of age shall not contain detachable small parts "
                            "that fit entirely within the small parts cylinder having an internal diameter of 31.7 mm and depth of 57.1 mm. "
                            "Toys with sharp edges (Clause 4.5) or sharp points (Clause 4.6) are prohibited."
                        ),
                        "page_start": 8,
                        "page_end": 9,
                    },
                ],
            },
        ]

        for s_data in standards_data:
            # Check or create Document
            doc = session.query(Document).filter_by(title=s_data["doc_title"]).first()
            if not doc:
                doc = Document(
                    title=s_data["doc_title"],
                    document_type="standard",
                    source_name="BUREAU_OF_INDIAN_STANDARDS",
                    status="active",
                    checksum=f"demo_checksum_{s_data['standard_number'].replace(' ', '_').lower()}",
                    publication_date=date(s_data["year"], 1, 1),
                )
                session.add(doc)
                session.flush()

            # Check or create Standard
            std = session.query(Standard).filter_by(standard_number=s_data["standard_number"]).first()
            if not std:
                std = Standard(
                    document_id=doc.id,
                    standard_number=s_data["standard_number"],
                    title=s_data["std_title"],
                    description=s_data["description"],
                    domain=s_data["domain"],
                    edition=s_data["edition"],
                    year=s_data["year"],
                    status="active",
                )
                session.add(std)
                session.flush()
                print(f"  + Created standard: {std.standard_number}")

            # Clauses and Chunks
            for c_info in s_data["clauses"]:
                clause_obj = (
                    session.query(Clause)
                    .filter_by(standard_id=std.id, clause_number=c_info["clause_number"])
                    .first()
                )
                if not clause_obj:
                    clause_obj = Clause(
                        standard_id=std.id,
                        clause_number=c_info["clause_number"],
                        heading=c_info["heading"],
                        content=c_info["content"],
                        page_start=c_info["page_start"],
                        page_end=c_info["page_end"],
                    )
                    session.add(clause_obj)
                    session.flush()

                # Document Chunk with precomputed vector
                chunk_obj = (
                    session.query(DocumentChunk)
                    .filter_by(clause_id=clause_obj.id, chunk_index=0)
                    .first()
                )
                if not chunk_obj:
                    vector = embedder.embed_query(c_info["content"])
                    chunk_obj = DocumentChunk(
                        document_id=doc.id,
                        clause_id=clause_obj.id,
                        chunk_index=0,
                        content=c_info["content"],
                        token_count=len(c_info["content"].split()),
                        page_start=c_info["page_start"],
                        page_end=c_info["page_end"],
                        section_path=f"{s_data['standard_number']} > Clause {c_info['clause_number']}",
                        embedding=vector,
                    )
                    session.add(chunk_obj)
                    session.flush()

        # -------------------------------------------------------------
        # 3. ACCREDITED TESTING LABORATORIES
        # -------------------------------------------------------------
        labs_data = [
            {
                "name": "National Test House (Northern Region), Ghaziabad",
                "code": "NTH-NR-GZB",
                "city": "Ghaziabad",
                "state": "Uttar Pradesh",
                "address": "Kamla Nehru Nagar, Ghaziabad, UP 201002",
                "contact_email": "nth-nr@nic.in",
                "phone": "+91-120-2789823",
                "accreditation_status": "NABL & BIS Recognized",
                "is_active": True,
            },
            {
                "name": "Central Soil and Materials Research Station (CSMRS)",
                "code": "CSMRS-DELHI",
                "city": "New Delhi",
                "state": "Delhi",
                "address": "Olof Palme Marg, Hauz Khas, New Delhi 110016",
                "contact_email": "director-csmrs@nic.in",
                "phone": "+91-11-26857984",
                "accreditation_status": "NABL Accredited",
                "is_active": True,
            },
            {
                "name": "Shriram Institute for Industrial Research",
                "code": "SIIR-DELHI",
                "city": "Delhi",
                "state": "Delhi",
                "address": "19, University Road, Delhi 110007",
                "contact_email": "customercare@shriraminstitute.org",
                "phone": "+91-11-27667267",
                "accreditation_status": "NABL & BIS Recognized",
                "is_active": True,
            },
            {
                "name": "National Metallurgical Laboratory (CSIR-NML)",
                "code": "CSIR-NML-JSR",
                "city": "Jamshedpur",
                "state": "Jharkhand",
                "address": "Burmamines, Jamshedpur, Jharkhand 831007",
                "contact_email": "director@nmlindia.org",
                "phone": "+91-657-2345000",
                "accreditation_status": "NABL Accredited",
                "is_active": True,
            },
        ]

        for l_info in labs_data:
            lab_obj = session.query(Laboratory).filter_by(code=l_info["code"]).first()
            if not lab_obj:
                lab_obj = Laboratory(
                    name=l_info["name"],
                    code=l_info["code"],
                    city=l_info["city"],
                    state=l_info["state"],
                    address=l_info["address"],
                    contact_email=l_info["contact_email"],
                    phone=l_info["phone"],
                    accreditation_status=l_info["accreditation_status"],
                    is_active=l_info["is_active"],
                )
                session.add(lab_obj)
                session.flush()
                print(f"  + Created laboratory: {lab_obj.name}")

        # -------------------------------------------------------------
        # 4. CERTIFICATION SCHEMES
        # -------------------------------------------------------------
        schemes_data = [
            {
                "name": "Scheme I — Product Certification Scheme (ISI Mark)",
                "code": "SCHEME-I",
                "description": "Standard ISI Mark product certification requiring domestic factory quality audits, routine surveillance testing, and compliance with specific Indian Standards.",
                "is_mandatory": True,
            },
            {
                "name": "Scheme II — System Certification Scheme",
                "code": "SCHEME-II",
                "description": "Management system certification covering Quality (ISO 9001), Environmental (ISO 14001), and Occupational Health and Safety (ISO 45001) standards.",
                "is_mandatory": False,
            },
            {
                "name": "Scheme IV — Foreign Manufacturers Certification Scheme (FMCS)",
                "code": "SCHEME-IV",
                "description": "Enables overseas manufacturers to use the standard ISI Mark on products exported to India, following factory audits and independent laboratory testing.",
                "is_mandatory": True,
            },
            {
                "name": "Scheme X — Compulsory Registration Scheme (CRS)",
                "code": "SCHEME-X",
                "description": "Self-declaration of conformity for electronics and IT goods (under MeitY and BIS orders), based on testing in BIS-recognized Indian laboratories.",
                "is_mandatory": True,
            },
        ]

        for sch in schemes_data:
            sch_obj = session.query(CertificationScheme).filter_by(code=sch["code"]).first()
            if not sch_obj:
                sch_obj = CertificationScheme(
                    name=sch["name"],
                    code=sch["code"],
                    description=sch["description"],
                    is_mandatory=sch["is_mandatory"],
                )
                session.add(sch_obj)
                session.flush()
                print(f"  + Created certification scheme: {sch_obj.code}")

        session.commit()
        print("[DEMO SEED] Successfully completed demo database initialization.")

    except Exception as exc:
        session.rollback()
        print(f"[DEMO SEED ERROR] Failed to seed demo data: {exc}", file=sys.stderr)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed demo data for BIS Copilot SIH Walkthrough.")
    parser.add_argument(
        "--if-empty",
        action="store_true",
        help="Only seed if database does not contain standards yet.",
    )
    args = parser.parse_args()
    seed_demo_data(if_empty=args.if_empty)
