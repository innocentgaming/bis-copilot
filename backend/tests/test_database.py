"""Database foundation and model tests for BIS Copilot (Phase 1)."""

import uuid
from datetime import date
import pytest
from sqlalchemy import text, inspect

from backend.app.config import get_settings
from backend.app.database.connection import check_sync_connection, sync_engine
from backend.app.database.session import Base, SyncSessionLocal
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

EXPECTED_TABLES = {
    "users",
    "documents",
    "standards",
    "clauses",
    "document_chunks",
    "products",
    "product_standards",
    "certification_schemes",
    "standard_certification_schemes",
    "certification_requirements",
    "laboratories",
    "test_requirements",
    "laboratory_capabilities",
    "conversations",
    "messages",
    "citations",
    "feedback",
    "hallmarking_info",
    "evaluation_questions",
    "evaluation_runs",
}


# ============================================================================
# 1. ORM & SCHEMA VALIDATION TESTS (Offline / Metadata Verified)
# ============================================================================

def test_all_20_tables_registered_in_metadata():
    """Verify all 20 required Phase 1 logical entities are present in Base.metadata."""
    registered_tables = set(Base.metadata.tables.keys())
    missing_tables = EXPECTED_TABLES - registered_tables
    assert not missing_tables, f"Missing tables in metadata: {missing_tables}"
    assert len(registered_tables) == 20


def test_uuid_primary_keys():
    """Verify all entities define UUID primary keys."""
    for table_name in EXPECTED_TABLES:
        table = Base.metadata.tables[table_name]
        pk_cols = [c.name for c in table.primary_key.columns]
        if table_name == "standard_certification_schemes":
            assert pk_cols == ["standard_id", "scheme_id"], f"Table {table_name} composite PK mismatch"
        else:
            assert pk_cols == ["id"], f"Table {table_name} does not have 'id' as primary key"


def test_indexing_strategy():
    """Verify minimum required indexes are declared in table arguments."""
    tables = Base.metadata.tables

    # users.email unique index
    users_table = tables["users"]
    email_col = users_table.c.email
    assert email_col.unique or any("email" in [c.name for c in idx.columns] for idx in users_table.indexes)

    # clauses composite index (standard_id, clause_number)
    clauses_table = tables["clauses"]
    clause_index_cols = [[c.name for c in idx.columns] for idx in clauses_table.indexes]
    assert ["standard_id", "clause_number"] in clause_index_cols, "Missing composite index (standard_id, clause_number)"

    # document_chunks indexes
    chunk_table = tables["document_chunks"]
    chunk_index_names = [idx.name for idx in chunk_table.indexes]
    assert "ix_document_chunks_embedding_hnsw" in chunk_index_names, "Missing HNSW vector index"
    assert "ix_document_chunks_search_vector_gin" in chunk_index_names, "Missing GIN full-text index"

    # laboratories location indexes
    lab_table = tables["laboratories"]
    lab_cols = {c.name for idx in lab_table.indexes for c in idx.columns}
    assert {"city", "state", "pincode"}.issubset(lab_cols), "Laboratories missing city/state/pincode indexes"


def test_check_constraints_declared():
    """Verify range and value check constraints are present in table definitions."""
    tables = Base.metadata.tables

    # User role & preferred_language constraints
    user_constraints = [c.name for c in tables["users"].constraints]
    assert "ck_users_role" in user_constraints
    assert "ck_users_preferred_language" in user_constraints

    # ProductStandard confidence constraint
    ps_constraints = [c.name for c in tables["product_standards"].constraints]
    assert "ck_product_standards_confidence" in ps_constraints

    # Feedback rating constraint
    fb_constraints = [c.name for c in tables["feedback"].constraints]
    assert "ck_feedback_rating" in fb_constraints

    # Laboratory coordinates constraint
    lab_constraints = [c.name for c in tables["laboratories"].constraints]
    assert "ck_laboratories_latitude" in lab_constraints
    assert "ck_laboratories_longitude" in lab_constraints

    # EvaluationRun metric constraints
    eval_constraints = [c.name for c in tables["evaluation_runs"].constraints]
    assert "ck_eval_runs_citation_accuracy" in eval_constraints
    assert "ck_eval_runs_hallucination_score" in eval_constraints


# ============================================================================
# 2. MODEL INSTANTIATION & RELATIONSHIP INTEGRITY TESTS
# ============================================================================

def test_user_instantiation():
    """Test User model instantiation and attribute integrity."""
    user = User(
        name="Test Engineer",
        email="engineer@test.bis",
        password_hash="hashed_secret",
        role="admin",
        preferred_language="hi",
    )
    assert user.name == "Test Engineer"
    assert user.email == "engineer@test.bis"
    assert user.role == "admin"
    assert user.preferred_language == "hi"


def test_clause_hierarchy_tree_structure():
    """Test self-referential parent-child relationships for hierarchical clauses."""
    parent_clause = Clause(
        id=uuid.uuid4(),
        standard_id=uuid.uuid4(),
        clause_number="5",
        heading="Mechanical Requirements",
        content="General mechanical provisions.",
    )
    sub_clause_1 = Clause(
        id=uuid.uuid4(),
        standard_id=parent_clause.standard_id,
        clause_number="5.1",
        heading="Impact Resistance",
        content="Enclosure shall withstand 0.5J impact.",
        parent_clause=parent_clause,
    )
    sub_clause_2 = Clause(
        id=uuid.uuid4(),
        standard_id=parent_clause.standard_id,
        clause_number="5.1.1",
        heading="Spring Hammer Test",
        content="Test performed with calibrated spring hammer.",
        parent_clause=sub_clause_1,
    )

    # Notice: setting parent_clause automatically associates into sub_clauses via back_populates
    assert sub_clause_1.parent_clause.clause_number == "5"
    assert sub_clause_2.parent_clause.clause_number == "5.1"
    assert len(parent_clause.sub_clauses) == 1
    assert parent_clause.sub_clauses[0].clause_number == "5.1"
    assert len(sub_clause_1.sub_clauses) == 1
    assert sub_clause_1.sub_clauses[0].clause_number == "5.1.1"


def test_evidence_traceability_relationships():
    """Verify the full chain of evidence: Document -> Standard -> Clause -> Chunk -> Citation."""
    doc_id = uuid.uuid4()
    std_id = uuid.uuid4()
    clause_id = uuid.uuid4()
    chunk_id = uuid.uuid4()
    msg_id = uuid.uuid4()

    doc = Document(
        id=doc_id,
        title="IS 1293 Standard Document",
        document_type="standard",
        source_name="BIS Official Portal",
    )
    std = Standard(
        id=std_id,
        standard_number="IS 1293:2019",
        title="Plugs and socket-outlets of rated voltage up to and including 250 volts",
        document=doc,
    )
    clause = Clause(
        id=clause_id,
        standard=std,
        clause_number="12.1",
        heading="Dimension Verification",
        content="Dimensions shall conform to Sheet 1.",
    )
    chunk = DocumentChunk(
        id=chunk_id,
        document=doc,
        standard=std,
        clause=clause,
        content="Clause 12.1: Plugs must conform to standard dimension gauge.",
        embedding=[0.1] * settings.EMBEDDING_DIMENSION,
    )
    msg = Message(
        id=msg_id,
        conversation_id=uuid.uuid4(),
        role="assistant",
        content="Plugs must satisfy standard dimensions specified in IS 1293 Clause 12.1.",
    )
    citation = Citation(
        message=msg,
        document=doc,
        standard=std,
        clause=clause,
        chunk=chunk,
        citation_text="IS 1293:2019 Clause 12.1",
        page_number=14,
        relevance_score=0.96,
    )

    # Verify link chain is intact
    assert citation.document.title == "IS 1293 Standard Document"
    assert citation.standard.standard_number == "IS 1293:2019"
    assert citation.clause.clause_number == "12.1"
    assert citation.chunk.content.startswith("Clause 12.1")
    assert citation.relevance_score == 0.96


def test_product_standard_relationship():
    """Verify Product to ProductStandard mapping with confidence score."""
    prod = Product(
        name="Industrial Switch",
        category="Electrical Equipment",
        attributes={"current_rating": "16A", "poles": 3},
    )
    std = Standard(
        standard_number="IS 13947:Part 3",
        title="Low-voltage switchgear and controlgear",
    )
    prod_std = ProductStandard(
        product=prod,
        standard=std,
        applicability="applicable",
        confidence=0.94,
        reasoning="Rated for AC industrial switching duty.",
    )
    assert prod_std.confidence == 0.94
    assert prod_std.applicability == "applicable"


def test_certification_scheme_and_requirements():
    """Verify CertificationScheme, requirement sequencing, and many-to-many standard relationship."""
    scheme = CertificationScheme(
        name="Scheme I - ISI Mark",
        code="SCHEME-I",
        description="Standard conformity assessment scheme",
    )
    std = Standard(standard_number="IS 15885:Part 2:Sec 13", title="LED drivers")

    link = StandardCertificationScheme(
        standard=std,
        scheme=scheme,
        applicability="mandatory",
    )
    req = CertificationRequirement(
        scheme=scheme,
        requirement_type="application",
        title="Form-I Submission",
        sequence_order=1,
        mandatory=True,
    )
    assert link.applicability == "mandatory"
    assert req.sequence_order == 1
    assert req.mandatory is True


def test_laboratory_capabilities():
    """Verify Laboratory and LaboratoryCapability linking to standard and test requirements."""
    lab = Laboratory(
        name="National Physical Laboratory Sample",
        address="Dr. K.S. Krishnan Marg",
        city="New Delhi",
        state="Delhi",
        pincode="110012",
        latitude=28.6328,
        longitude=77.1689,
    )
    std = Standard(standard_number="IS 302:Part 1", title="Safety of household appliances")
    test_req = TestRequirement(
        standard=std,
        test_name="Electric Strength Test",
        mandatory=True,
    )
    cap = LaboratoryCapability(
        laboratory=lab,
        standard=std,
        test_requirement=test_req,
        capability_name="High Voltage Dielectric Breakdown",
    )
    assert cap.capability_name == "High Voltage Dielectric Breakdown"
    assert cap.laboratory.city == "New Delhi"


def test_feedback_rating_values():
    """Verify feedback rating permits controlled values."""
    fb_pos = Feedback(
        message_id=uuid.uuid4(),
        rating=1,
        is_correct=True,
        comment="Accurate standard match",
    )
    fb_neg = Feedback(
        message_id=uuid.uuid4(),
        rating=-1,
        is_correct=False,
        comment="Outdated standard cited",
    )
    assert fb_pos.rating == 1
    assert fb_neg.rating == -1


def test_evaluation_run_metrics():
    """Verify evaluation questions and run metric bounds."""
    eq = EvaluationQuestion(
        question="What is the rated voltage in IS 1293?",
        expected_answer="Up to and including 250V",
    )
    run = EvaluationRun(
        question=eq,
        generated_answer="IS 1293 covers appliances up to 250 volts.",
        citation_accuracy=1.0,
        retrieval_score=0.98,
        answer_score=0.99,
        hallucination_score=0.0,
        latency_ms=180,
    )
    assert run.citation_accuracy == 1.0
    assert run.hallucination_score == 0.0
    assert run.latency_ms == 180


# ============================================================================
# 3. LIVE POSTGRESQL + PGVECTOR + FTS INTEGRATION TESTS
# ============================================================================

@pytest.fixture(scope="module")
def postgres_session():
    """Provide a live session if PostgreSQL with pgvector is reachable."""
    if not check_sync_connection():
        pytest.skip(
            "PostgreSQL is not currently reachable on localhost:5432. "
            "To enable live integration tests, run: docker compose up -d postgres"
        )

    session = SyncSessionLocal()
    try:
        # Check pgvector extension
        ext = session.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector';")).fetchone()
        if not ext:
            session.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            session.commit()
        yield session
    finally:
        session.close()


def test_live_pgvector_similarity_search(postgres_session):
    """Insert a test chunk with an embedding and perform cosine distance similarity search."""
    dim = settings.EMBEDDING_DIMENSION
    test_emb_1 = [1.0 / (i + 1) for i in range(dim)]
    test_emb_2 = [-1.0 / (i + 1) for i in range(dim)]

    chunk_1 = DocumentChunk(
        content="[TEST] Electrical safety requirements for household toasters.",
        embedding=test_emb_1,
        chunk_index=0,
    )
    chunk_2 = DocumentChunk(
        content="[TEST] Textile yarn tensile strength specifications.",
        embedding=test_emb_2,
        chunk_index=1,
    )
    postgres_session.add_all([chunk_1, chunk_2])
    postgres_session.commit()

    # Query with test_emb_1: closest match should be chunk_1
    query_vector = str(test_emb_1)
    results = postgres_session.execute(
        text("SELECT id, content, (embedding <=> :qvec) as distance FROM document_chunks ORDER BY embedding <=> :qvec LIMIT 1;"),
        {"qvec": query_vector},
    ).fetchone()

    assert results is not None
    assert results[0] == chunk_1.id
    assert results[2] < 0.001  # Near zero cosine distance for identical vector


def test_live_full_text_search(postgres_session):
    """Insert content, generate tsvector, and verify PostgreSQL FTS query retrieves it."""
    chunk = DocumentChunk(
        content="[TEST FTS] IS 1293 defines the dimensions and safety requirements for three-pin plugs in India.",
        chunk_index=99,
    )
    postgres_session.add(chunk)
    postgres_session.commit()

    # Populate tsvector
    postgres_session.execute(
        text("UPDATE document_chunks SET search_vector = to_tsvector('english', content) WHERE id = :id;"),
        {"id": chunk.id},
    )
    postgres_session.commit()

    # Query for 'three-pin & plugs'
    search_result = postgres_session.execute(
        text("SELECT id, content FROM document_chunks WHERE search_vector @@ to_tsquery('english', 'plugs & dimensions') AND id = :id;"),
        {"id": chunk.id},
    ).fetchone()

    assert search_result is not None
    assert search_result[0] == chunk.id
