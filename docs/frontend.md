# BIS Copilot — Phase 6: Frontend / User Interface / SIH Demo Experience

## 1. Overview
Phase 6 delivers the production-grade, authoritative web user interface for **BIS Copilot** (SIH Problem Statement 26107). Built using the Next.js App Router, TypeScript, and Tailwind CSS, the application consumes the Phase 5 FastAPI REST and Server-Sent Events (SSE) streaming API (`/api/v1`) without creating artificial client-side RAG mocks.

### Core Experience Philosophy
- **Trust & Compliance**: Designed as a serious compliance workstation with high-contrast, clean slate typography and semantic status indicators.
- **Traceability First**: Every AI compliance claim is tied directly to authoritative standard citations (`[IS 99999:2025, Clause 5.2, pp. 5–6]`) with an interactive slide-over Evidence Drawer showing verbatim text excerpts.
- **Strict Anti-Hallucination Safe Refusal**: If evidence is insufficient or outside Indian Standards, the system renders an explicit Safe Refusal card with recommended compliance actions.
- **High Concurrency & Real Streaming**: Native SSE streaming reader rendering tokens in real-time paired with final payload verification (citations, confidence, and timings).

---

## 2. Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | Strict TypeScript (ES2020) |
| **Styling** | Tailwind CSS with BIS enterprise design tokens |
| **Icons** | Lucide React |
| **API Client** | Native typed fetch client with automatic JWT injection, error mapping, and SSE stream parser |
| **State Management** | React Context (`AuthProvider`, `ToastProvider`) and custom hooks |
| **Testing** | Vitest (Unit & Formatters) |

---

## 3. Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx                # App shell, fonts, ToastProvider, AuthProvider
│   ├── page.tsx                  # Landing dashboard (Hero, capability cards, sample queries)
│   ├── login/page.tsx            # Officer / Admin authentication
│   ├── register/page.tsx         # Account registration (English, Hindi, Marathi)
│   ├── chat/page.tsx             # Primary AI Compliance Assistant & streaming chat
│   ├── conversations/page.tsx    # Multi-turn conversational history & session resume
│   ├── standards/
│   │   ├── page.tsx              # Indian Standards directory & keyword search
│   │   └── [id]/page.tsx         # Standard specification & ClauseTree viewer
│   ├── search/page.tsx           # Direct hybrid retrieval (pgvector + FTS) without LLM
│   ├── laboratories/page.tsx     # BIS-recognized test laboratories directory
│   ├── certification/page.tsx    # Certification schemes (ISI Mark, CRS, Hallmarking)
│   ├── admin/
│   │   ├── page.tsx              # System volume metrics & telemetry dashboard
│   │   ├── documents/page.tsx    # PDF upload, job dispatch, and ingestion tracker
│   │   └── evaluation/page.tsx   # Benchmark question bank and test execution
│   ├── demo/page.tsx             # Dedicated SIH 3–5 minute presentation guide
│   ├── profile/page.tsx          # User profile & preferred language
│   └── settings/page.tsx         # Preferences & API endpoint parameters
├── components/
│   ├── layout/                   # AppShell, Sidebar, TopBar, MobileNav
│   ├── chat/                     # ChatInput, ChatMessage, ThinkingIndicator, RefusalCard, FeedbackControl
│   ├── citations/                # CitationCard, EvidencePanel (slide-over drawer)
│   ├── standards/                # ClauseTree (hierarchical 5 -> 5.1 -> Annex), StandardCard
│   └── common/                   # Badge, Skeleton, EmptyState, Toast, ErrorBoundary
├── lib/
│   ├── api/                      # client.ts, auth.ts, chat.ts, standards.ts, laboratories.ts, documents.ts, admin.ts
│   ├── auth/                     # context.tsx (centralized AuthContext)
│   └── utils/                    # cn.ts, formatters.ts, error-mapper.ts
├── types/                        # api.ts, auth.ts, chat.ts, standards.ts, laboratories.ts, documents.ts, admin.ts
├── tests/                        # Vitest unit test suite
└── vitest.config.ts              # Vitest path alias configuration
```

---

## 4. SIH Demonstration Workflow (3–5 Minutes)

Access the dedicated demo guide at `/demo` or follow this flow:
1. **Executive Overview (`/`)**: Highlight problem statement 26107, capability cards, and live telemetry.
2. **AI Compliance Query (`/chat`)**: Ask:
   > *"What is the minimum breaking load and test temperature under Clause 5.2 in IS 99999?"*
   Observe real SSE token streaming, exact quantitative parameters (450 N at 25°C), HIGH confidence badge, and verified citation.
3. **Inspect Verbatim Evidence Drawer**: Click the citation badge `[IS 99999:2025, Clause 5.2, pp. 5–6]` to open the slide-over Evidence Drawer showing exact clause text, page range, and database chunk ID.
4. **Strict Anti-Hallucination Safe Refusal**: Ask an out-of-scope query:
   > *"What is the recipe for baking chocolate cake?"*
   Observe the **Insufficient Evidence** refusal card offering refined compliance prompts.
5. **Direct Hybrid Search (`/search`)**: Run `"breaking load"` to view ranked chunk hits with cosine similarity and cover-density scores.
6. **Clause Hierarchy Navigation (`/standards`)**: Open `IS 99999:2025` and expand the recursive `ClauseTree` (Clause 5 -> 5.1 -> 5.2, Annex A).
7. **Laboratory & Certification Explorer (`/laboratories`, `/certification`)**: Filter accredited labs by city/standard and inspect ISI Mark and Compulsory Registration Schemes.
8. **Document Ingestion (`/admin/documents`)**: Drag-and-drop a synthetic standard PDF to trigger Phase 2 PyMuPDF extraction, chunking, and pgvector embeddings.

---

## 5. Running the Application

### Development
```bash
# Terminal 1: Backend API (FastAPI)
.venv/Scripts/uvicorn backend.app.main:app --reload --port 8000

# Terminal 2: Frontend (Next.js)
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification
```bash
# Frontend Unit Tests
cd frontend
npm test

# Production Build
npm run build
```
