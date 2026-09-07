"""Minimal development seed script for BIS Copilot.

IMPORTANT:
All data created here is explicitly fake and tagged:
- source_name = "DEVELOPMENT_SAMPLE"
- status = "draft"
- titles/names clearly indicate DEVELOPMENT SAMPLE
"""

import os
import sys
import uuid
from datetime import date
from sqlalchemy import text

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.config import get_settings
from backend.app.database.session import SyncSessionLocal
from backend.app.models import (
    User,
    Document,
    Standard,
    Clause,
    DocumentChunk,
    Product,
    ProductStandard,
    CertificationScheme,
    StandardCertificationScheme,
    CertificationRequirement,
    Laboratory,
    TestRequirement,
    LaboratoryCapability,
    Conversation,
    Message,
    Citation,
    Feedback,
    HallmarkingInfo,
    EvaluationQuestion,
    EvaluationRun,
)

settings = get_settings()


def seed_development_data():
    """Seed clearly marked development sample records."""
    print("Starting development data seeding...")
    session = SyncSessionLocal()

    try:
        # 1. User
        dev_user = session.query(User).filter_by(email="dev.user@sample.test").first()
        if not dev_user:
            dev_user = User(
                name="Development Test User",
                email="dev.user@sample.test",
                password_hash="pbkdf2_fake_hash_development_only",
                role="user",
                preferred_language="en",
            )
            session.add(dev_user)
            session.flush()
            print(f"Created sample User: {dev_user.email}")

        # 2. Document
        dev_doc = session.query(Document).filter_by(title="[DEV SAMPLE] Test Standard Document Specification").first()
        if not dev_doc:
            dev_doc = Document(
                title="[DEV SAMPLE] Test Standard Document Specification",
                document_type="standard",
                source_name="DEVELOPMENT_SAMPLE",
                source_url="https://sample.bis.gov.in.test/docs/dev-sample-001.pdf",
                version="0.1-draft",
                publication_date=date(2025, 1, 1),
                status="draft",
                checksum="dev_sample_checksum_abcdef0123456789",
            )
            session.add(dev_doc)
            session.flush()
            print(f"Created sample Document: {dev_doc.title}")

        # 3. Standard
        dev_std = session.query(Standard).filter_by(standard_number="IS-SAMPLE-99999:2025").first()
        if not dev_std:
            dev_std = Standard(
                standard_number="IS-SAMPLE-99999:2025",
                title="[DEV SAMPLE] Indian Standard Specification for Sample Electrical Heating Appliances",
                short_title="Sample Electrical Heating Appliances",
                scope="Development testing prototype scope. Not an authoritative standard.",
                edition="1st Draft Edition",
                publication_date=date(2025, 1, 1),
                status="draft",
                document_id=dev_doc.id,
            )
            session.add(dev_std)
            session.flush()
            print(f"Created sample Standard: {dev_std.standard_number}")

        # 4. Clauses (Hierarchical: Clause 1, Clause 1.1, Clause 1.2)
        dev_clause_parent = session.query(Clause).filter_by(
            standard_id=dev_std.id, clause_number="1"
        ).first()
        if not dev_clause_parent:
            dev_clause_parent = Clause(
                standard_id=dev_std.id,
                document_id=dev_doc.id,
                clause_number="1",
                heading="[DEV SAMPLE] General Safety Requirements",
                content="Appliances shall be constructed to ensure personal safety during normal operation and abnormal surge conditions.",
                page_start=1,
                page_end=2,
            )
            session.add(dev_clause_parent)
            session.flush()

        dev_clause_child = session.query(Clause).filter_by(
            standard_id=dev_std.id, clause_number="1.1"
        ).first()
        if not dev_clause_child:
            dev_clause_child = Clause(
                standard_id=dev_std.id,
                document_id=dev_doc.id,
                clause_number="1.1",
                heading="[DEV SAMPLE] Temperature Rise Limits",
                content="External surfaces accessible to users shall not exceed a temperature rise of 60 Kelvin during rated operation.",
                page_start=2,
                page_end=3,
                parent_clause_id=dev_clause_parent.id,
            )
            session.add(dev_clause_child)
            session.flush()
            print("Created sample hierarchical Clauses: 1 and 1.1")

        # 5. Document Chunk with Vector & Full-Text Search
        sample_vector = [0.01 * (i % 50) for i in range(settings.EMBEDDING_DIMENSION)]
        dev_chunk = session.query(DocumentChunk).filter_by(clause_id=dev_clause_child.id).first()
        if not dev_chunk:
            dev_chunk = DocumentChunk(
                document_id=dev_doc.id,
                standard_id=dev_std.id,
                clause_id=dev_clause_child.id,
                chunk_index=0,
                content="[DEV SAMPLE] Clause 1.1: External surface temperature rise shall not exceed 60K for electrical heating appliances under IS-SAMPLE-99999:2025.",
                page_start=2,
                page_end=3,
                metadata_json={
                    "section": "Safety Limits",
                    "clause_number": "1.1",
                    "document_version": "2025-draft",
                    "language": "en",
                    "source_type": "DEVELOPMENT_SAMPLE",
                },
                embedding=sample_vector,
            )
            session.add(dev_chunk)
            session.flush()
            # Set search vector via text query if supported
            try:
                session.execute(
                    text("UPDATE document_chunks SET search_vector = to_tsvector('english', content) WHERE id = :id"),
                    {"id": dev_chunk.id},
                )
            except Exception:
                pass
            print("Created sample DocumentChunk with vector embedding")

        # 6. Product & Product-Standard link
        dev_product = session.query(Product).filter_by(name="[DEV SAMPLE] Sample 2-Slice Electric Toaster").first()
        if not dev_product:
            dev_product = Product(
                name="[DEV SAMPLE] Sample 2-Slice Electric Toaster",
                category="Kitchen Heating Appliances",
                description="Development sample electric toaster rated at 230V 800W for prototype testing.",
                attributes={
                    "voltage": "230V",
                    "power": "800W",
                    "material": "stainless steel",
                    "capacity": "2-slice",
                },
                embedding=sample_vector,
            )
            session.add(dev_product)
            session.flush()

            prod_std = ProductStandard(
                product_id=dev_product.id,
                standard_id=dev_std.id,
                applicability="applicable",
                reasoning="Development sample reasoning: Toaster operates under domestic electrical heating appliance criteria.",
                confidence=0.92,
                source_clause_id=dev_clause_child.id,
            )
            session.add(prod_std)
            session.flush()
            print("Created sample Product and ProductStandard link")

        # 7. Certification Scheme & Requirement
        dev_scheme = session.query(CertificationScheme).filter_by(code="SAMPLE-SCHEME-X").first()
        if not dev_scheme:
            dev_scheme = CertificationScheme(
                name="[DEV SAMPLE] Product Certification Scheme Sample",
                code="SAMPLE-SCHEME-X",
                description="Draft sample certification scheme for development testing.",
                scope="Electrical products prototype scope.",
                document_id=dev_doc.id,
                status="draft",
            )
            session.add(dev_scheme)
            session.flush()

            # Link standard to scheme
            std_scheme = StandardCertificationScheme(
                standard_id=dev_std.id,
                scheme_id=dev_scheme.id,
                applicability="mandatory",
            )
            session.add(std_scheme)

            cert_req = CertificationRequirement(
                scheme_id=dev_scheme.id,
                requirement_type="testing",
                title="[DEV SAMPLE] Type Test Report Submission",
                description="Submit accredited laboratory test report covering Clause 1.1 temperature limits.",
                sequence_order=1,
                mandatory=True,
                source_clause_id=dev_clause_child.id,
            )
            session.add(cert_req)
            session.flush()
            print("Created sample CertificationScheme and CertificationRequirement")

        # 8. Laboratory & Capabilities
        dev_lab = session.query(Laboratory).filter_by(name="[DEV SAMPLE] National Testing Laboratory Sample").first()
        if not dev_lab:
            dev_lab = Laboratory(
                name="[DEV SAMPLE] National Testing Laboratory Sample",
                address="Plot 101, Industrial Area Phase 2, Sample City",
                city="New Delhi",
                state="Delhi",
                pincode="110001",
                latitude=28.6139,
                longitude=77.2090,
                phone="+91-11-23230000",
                email="lab.sample@bis.test",
                website="https://sample-lab.test",
                status="active",
                source_document_id=dev_doc.id,
            )
            session.add(dev_lab)
            session.flush()

            test_req = TestRequirement(
                standard_id=dev_std.id,
                test_name="[DEV SAMPLE] Temperature Rise Test",
                test_description="Verify surface heating under Clause 1.1 requirements.",
                test_method="Thermocouple Method",
                mandatory=True,
                source_clause_id=dev_clause_child.id,
            )
            session.add(test_req)
            session.flush()

            lab_cap = LaboratoryCapability(
                laboratory_id=dev_lab.id,
                standard_id=dev_std.id,
                test_requirement_id=test_req.id,
                capability_name="[DEV SAMPLE] Heating Element & Surface Temperature Measurement",
                description="Equipped with calibrated data loggers and multi-channel thermocouples.",
                source_document_id=dev_doc.id,
            )
            session.add(lab_cap)
            session.flush()
            print("Created sample Laboratory, TestRequirement, and LaboratoryCapability")

        # 9. Conversation, Message, Citation, Feedback
        dev_conv = session.query(Conversation).filter_by(title="[DEV SAMPLE] Test Consultation Session").first()
        if not dev_conv:
            dev_conv = Conversation(
                user_id=dev_user.id,
                title="[DEV SAMPLE] Test Consultation Session",
                language="en",
            )
            session.add(dev_conv)
            session.flush()

            user_msg = Message(
                conversation_id=dev_conv.id,
                role="user",
                content="What is the maximum permissible surface temperature for electric toasters?",
                intent="standard_search",
                confidence=0.95,
            )
            session.add(user_msg)
            session.flush()

            asst_msg = Message(
                conversation_id=dev_conv.id,
                role="assistant",
                content="According to [DEV SAMPLE] IS-SAMPLE-99999:2025 Clause 1.1, external accessible surfaces must not exceed a temperature rise of 60 Kelvin during rated operation.",
                intent="standard_recommendation",
                confidence=0.98,
                response_time_ms=250,
            )
            session.add(asst_msg)
            session.flush()

            citation = Citation(
                message_id=asst_msg.id,
                document_id=dev_doc.id,
                standard_id=dev_std.id,
                clause_id=dev_clause_child.id,
                chunk_id=dev_chunk.id,
                citation_text="IS-SAMPLE-99999:2025, Clause 1.1 (Temperature Rise Limits), page 2",
                page_number=2,
                relevance_score=0.97,
            )
            session.add(citation)

            fb = Feedback(
                message_id=asst_msg.id,
                user_id=dev_user.id,
                rating=1,
                is_correct=True,
                comment="Sample positive feedback: accurate clause-level citation.",
            )
            session.add(fb)
            session.flush()
            print("Created sample Conversation, Message, Citation, and Feedback")

        # 10. Hallmarking Information
        dev_hallmark = session.query(HallmarkingInfo).filter_by(title="[DEV SAMPLE] Gold Hallmarking Basics").first()
        if not dev_hallmark:
            dev_hallmark = HallmarkingInfo(
                title="[DEV SAMPLE] Gold Hallmarking Basics",
                description="Overview of 6-digit alphanumeric HUID marking system.",
                category="gold",
                content="The BIS Hallmark consists of 3 marks: BIS Standard mark, Purity/Fineness grade, and 6-digit alphanumeric HUID.",
                source_document_id=dev_doc.id,
                source_clause_id=dev_clause_child.id,
                status="draft",
            )
            session.add(dev_hallmark)
            session.flush()
            print("Created sample HallmarkingInfo")

        # 11. Evaluation Question & Run
        dev_eval_q = session.query(EvaluationQuestion).filter_by(
            question="What is the allowable temperature rise under IS-SAMPLE-99999:2025 Clause 1.1?"
        ).first()
        if not dev_eval_q:
            dev_eval_q = EvaluationQuestion(
                question="What is the allowable temperature rise under IS-SAMPLE-99999:2025 Clause 1.1?",
                language="en",
                expected_intent="standard_search",
                expected_standard_id=dev_std.id,
                expected_clause_id=dev_clause_child.id,
                expected_answer="60 Kelvin maximum temperature rise.",
            )
            session.add(dev_eval_q)
            session.flush()

            eval_run = EvaluationRun(
                question_id=dev_eval_q.id,
                generated_answer="Under Clause 1.1 of IS-SAMPLE-99999:2025, the maximum surface temperature rise is 60 Kelvin.",
                retrieved_chunks=[{"chunk_id": str(dev_chunk.id), "similarity": 0.94}],
                citation_accuracy=1.0,
                retrieval_score=0.96,
                answer_score=0.98,
                hallucination_score=0.0,
                latency_ms=310,
            )
            session.add(eval_run)
            session.flush()
            print("Created sample EvaluationQuestion and EvaluationRun")

        session.commit()
        print("Development data seeding completed successfully!")
    except Exception as exc:
        session.rollback()
        print(f"Error during development data seeding: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_development_data()
