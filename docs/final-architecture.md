# BIS Quality / Compliance Copilot — Complete Architecture Specification

**Bureau of Indian Standards (BIS) AI Quality / Compliance Copilot**  
**Smart India Hackathon (SIH) Problem Statement:** 26107  
**Phase 8 Production Reference Architecture**

---

## 1. Overall System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Layer (Next.js 14 App Router)"]
        UI["User Interface (Tailwind + Lucide)"]
        SSE["SSE EventSource Stream Listener"]
        Drawer["Evidence Inspection Drawer"]
    end

    subgraph API["Backend API Layer (FastAPI / Uvicorn ASGI)"]
        Router["/api/v1 Global Router"]
        AuthMiddleware["JWT / RBAC Security Middleware"]
        ChatRoute["/api/v1/chat/stream"]
        SearchRoute["/api/v1/search"]
        StandardsRoute["/api/v1/standards"]
        LabRoute["/api/v1/laboratories"]
    end

    subgraph RetrievalEngine["Knowledge Retrieval Foundation"]
        QNorm["Query Normalizer & Entity Extractor"]
        Embedder["Dense Query Embedder (MiniLM-L6-v2)"]
        HNSW["HNSW Cosine Vector Search"]
        FTS["PostgreSQL FTS (tsvector GIN)"]
        RRF["Reciprocal Rank Fusion (k=60)"]
        Reranker["Cross-Encoder Reranker (FlashRank)"]
        EvPackager["Evidence Context Packager (XML Delimited)"]
    end

    subgraph StorageLayer["Data & Persistence Layer"]
        PG[("PostgreSQL 16 Engine")]
        PGV["pgvector Extension (HNSW Indices)"]
        DocsTable[("documents & document_chunks")]
        StdTable[("standards & clauses")]
        LabTable[("laboratories & certifications")]
        UserTable[("users & conversations")]
    end

    subgraph GenerationEngine["Answer Generation & Orchestration"]
        PromptEngine["Prompt Engineering (Anti-Hallucination)"]
        LLM["LLM Provider (Groq / Deterministic Fallback)"]
        CiteVal["Citation Integrity Validator"]
        GroundVal["Deterministic Grounding Validator"]
        Confidence["Confidence Calibration Engine"]
    end

    UI -->|HTTPS Requests| Router
    SSE -->|SSE Stream Connection| ChatRoute
    Router --> AuthMiddleware
    AuthMiddleware --> ChatRoute
    AuthMiddleware --> SearchRoute
    AuthMiddleware --> StandardsRoute
    AuthMiddleware --> LabRoute

    ChatRoute --> QNorm
    SearchRoute --> QNorm
    QNorm --> Embedder
    QNorm --> FTS
    Embedder --> HNSW

    HNSW --> PGV
    FTS --> PG
    PGV --> DocsTable
    PG --> DocsTable

    HNSW --> RRF
    FTS --> RRF
    RRF --> Reranker
    Reranker --> EvPackager
    EvPackager --> PromptEngine

    PromptEngine --> LLM
    LLM --> CiteVal
    CiteVal --> GroundVal
    GroundVal --> Confidence
    Confidence -->|Token by Token SSE| SSE
    CiteVal -->|Authoritative Citations| Drawer
```

---

## 2. Document Ingestion Pipeline

```mermaid
flowchart TD
    PDF["Authoritative BIS Standard PDF"] --> HeaderProbe["Header & MIME Validation (%PDF-)"]
    HeaderProbe --> SHA["SHA-256 Checksum Calculation"]
    SHA --> Dedupe{"Duplicate Checksum?"}
    Dedupe -->|Yes| Skip["Skip Ingestion / Log Conflict"]
    Dedupe -->|No| Extractor["PyMuPDF Native Text Extraction"]

    Extractor --> CheckOCR{"OCR Required? (Scanned PDF)"}
    CheckOCR -->|Yes| Tesseract["PyTesseract OCR Extraction"]
    CheckOCR -->|No| Normalizer["Unicode NFKC Text Normalizer"]
    Tesseract --> Normalizer

    Normalizer --> HeaderStrip["Strip Running Headers & Footers (>70% match)"]
    HeaderStrip --> ClauseParse["Hierarchical Clause Parser (Regex & Numbering)"]
    ClauseParse --> Tree["Construct Nested Clause Tree"]

    Tree --> Chunker["Clause-Aware Sliding Window Chunking"]
    Chunker --> ContextPrefix["Inject Context Headers (Standard, Clause, Title)"]
    ContextPrefix --> Vectorize["Batch Embeddings Generation (384-dim)"]

    Vectorize --> DBInsert[("Insert into PostgreSQL")]
    DBInsert --> ChunksTbl["document_chunks (content, embedding)"]
    DBInsert --> ClausesTbl["clauses (hierarchy, page ranges)"]
    DBInsert --> StandardsTbl["standards (metadata, ICS, gazette)"]
```

---

## 3. Hybrid RAG Retrieval Pipeline

```mermaid
flowchart LR
    Query["User Query"] --> Norm["Query Normalizer"]
    
    subgraph VectorBranch["Dense Vector Retrieval"]
        Norm --> QEmbed["Generate 384-dim Query Vector"]
        QEmbed --> HNSWSearch["pgvector HNSW Cosine Search"]
        HNSWSearch --> TopVector["Top-K Vector Candidates"]
    end

    subgraph KeywordBranch["Sparse Keyword Retrieval"]
        Norm --> FTSQuery["plainto_tsquery('english')"]
        FTSQuery --> GINSearch["PostgreSQL GIN FTS Match"]
        GINSearch --> TopKeyword["Top-K FTS Candidates"]
    end

    TopVector --> RRF["Reciprocal Rank Fusion RRF (k=60)"]
    TopKeyword --> RRF
    RRF --> Rerank["FlashRank Cross-Encoder Reranker"]
    Rerank --> Diversify["Maximal Marginal Relevance (MMR)"]
    Diversify --> EvidencePack["Packaged Authoritative Evidence (<EVIDENCE>)"]
```

---

## 4. Anti-Hallucination Generation Pipeline

```mermaid
flowchart TD
    Ev["Packaged Evidence Blocks"] --> Prompt["Construct Anti-Hallucination Prompt"]
    UserQ["User Query & Target Language (en/hi/mr)"] --> Prompt

    Prompt --> LLM["LLM Generation"]
    LLM --> RawJSON["Parsed JSON Response"]

    RawJSON --> CiteCheck["Citation Integrity Validator"]
    CiteCheck --> VerifyChunks{"Citations match real chunks?"}
    VerifyChunks -->|Mismatch| RepairPurge["Purge fabricated citations / repair clause"]
    VerifyChunks -->|Match| GroundCheck["Deterministic Grounding Validator"]
    RepairPurge --> GroundCheck

    GroundCheck --> CheckLimits{"All values & clauses in evidence?"}
    CheckLimits -->|No| FallbackRefusal["Emit Safe Refusal / Caveat"]
    CheckLimits -->|Yes| ConfCalc["Confidence Calibration (0.0 - 1.0)"]

    FallbackRefusal --> SSEOut["Stream SSE Output to Next.js UI"]
    ConfCalc --> SSEOut
```

---

## 5. Authentication & Role-Based Access Control (RBAC)

```mermaid
flowchart TD
    UserReq["Client Request"] --> ExtractToken["Extract 'Authorization: Bearer <token>'"]
    ExtractToken --> HasToken{"Token present?"}

    HasToken -->|No| PublicRoute{"Public Endpoint? (/health, /standards, /search)"}
    PublicRoute -->|Yes| AllowPublic["Allow Execution"]
    PublicRoute -->|No| Reject401["HTTP 401 Unauthorized"]

    HasToken -->|Yes| Decode["Verify JWT Signature (HMAC-SHA256)"]
    Decode --> ValidSig{"Valid Signature & Unexpired?"}
    ValidSig -->|No| RejectToken["HTTP 401 Invalid Token"]
    ValidSig -->|Yes| ExtractRole["Extract User Claims (sub, email, role)"]

    ExtractRole --> AdminRoute{"Admin Endpoint? (/admin/*, /documents/ingest)"}
    AdminRoute -->|Yes| CheckAdmin{"role == 'admin'?"}
    CheckAdmin -->|Yes| AllowAdmin["Allow Admin Operation"]
    CheckAdmin -->|No| Reject403["HTTP 403 Forbidden"]
    AdminRoute -->|No| AllowUser["Allow User Operation"]
```

---

## 6. Containerized Deployment Architecture

```mermaid
flowchart TD
    subgraph Host["Production Host / Cloud VM"]
        subgraph DockerCompose["Docker Compose Stack"]
            PostgresContainer["db: PostgreSQL 16 + pgvector:0.7.0 (Port 5432)"]
            BackendContainer["backend: Python 3.11 + FastAPI (Port 8000)"]
            FrontendContainer["frontend: Node 20 + Next.js 14 (Port 3000)"]
        end
        VolPG[("pgdata Volume (Persistent Database)")]
        VolUploads[("uploads Volume (Raw PDFs)")]
    end

    PostgresContainer --- VolPG
    BackendContainer --- VolUploads
    BackendContainer -->|DATABASE_URL| PostgresContainer
    FrontendContainer -->|NEXT_PUBLIC_API_URL| BackendContainer
    UserBrowser["Evaluator Web Browser"] -->|Port 3000| FrontendContainer
```

---

## 7. SIH Evaluator Demonstration Flow

```mermaid
sequenceDiagram
    autonumber
    actor Evaluator as SIH Evaluator / Jury
    participant Frontend as Next.js UI (/demo)
    participant FastAPI as Backend API (/api/v1)
    participant RAG as Retrieval & Hybrid Engine
    participant DB as PostgreSQL + pgvector
    participant LLM as Anti-Hallucination LLM
    participant Drawer as Evidence Inspection Drawer

    Evaluator->>Frontend: Selects "Scenario A: Cement (IS 12269)"
    Frontend->>FastAPI: POST /api/v1/chat/stream {query, stream: true}
    FastAPI->>RAG: Retrieve context for "IS 12269 53 Grade"
    RAG->>DB: Vector Cosine Match + FTS English Query
    DB-->>RAG: Authentic Chunks (Clause 6.2, p. 2)
    RAG-->>FastAPI: Ranked <EVIDENCE> Context
    FastAPI->>LLM: Prompt with Evidence Constraints
    LLM-->>FastAPI: Streamed Tokens + Citation E1
    FastAPI-->>Frontend: SSE event: "53.0 MPa at 28 days..."
    Frontend-->>Evaluator: Renders Answer with [IS 12269:2015, Cl. 6.2]
    Evaluator->>Frontend: Clicks Citation Badge
    Frontend->>Drawer: Opens Evidence Drawer
    Drawer-->>Evaluator: Displays Verbatim Clause Text & Document Match
```
