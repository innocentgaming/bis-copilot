# BIS Quality / Compliance Copilot — Offline & Network Failure Continuity Plan

**SIH Evaluator Presentation Resilience Strategy**  
Smart India Hackathon competition environments frequently experience venue network outages, captive WiFi portals, proxy firewalls, or internet dropouts. This document defines the exact operational hierarchy, dependency boundaries, and fallback procedures.

---

## 1. System Component Dependency Matrix

| Component | Requires Internet? | Requires Model Download? | Requires External API Key? | Completely Offline Capable? | Fallback Mechanism if Offline |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **PostgreSQL + pgvector** | **NO** | **NO** | **NO** | **YES** | Runs in local Docker container or localhost background daemon. |
| **Document Ingestion** | **NO** | **NO** | **NO** | **YES** | PyMuPDF extracts text locally without network calls. |
| **Query Embedding** | **NO** (after cache) | Once on first setup | **NO** | **YES** | `DeterministicEmbeddingProvider` generates normalized vectors offline without PyTorch or external servers. |
| **FTS Keyword Search** | **NO** | **NO** | **NO** | **YES** | PostgreSQL native `tsvector` and `plainto_tsquery('english')`. |
| **Cross-Encoder Reranking** | **NO** (after cache) | Optional | **NO** | **YES** | `NoOpReranker` falls back seamlessly to Reciprocal Rank Fusion (RRF) scores. |
| **LLM Generation** | **Conditional** | **NO** | Only if using OpenAI/Anthropic/Gemini | **YES** | `DeterministicLLMProvider` generates authentic, grounded answers directly from evidence chunks without external APIs. |
| **Next.js Frontend UI** | **NO** | **NO** | **NO** | **YES** | Production standalone build serves from `localhost:3000`. |
| **Laboratory Locator** | **NO** | **NO** | **NO** | **YES** | Stored directly in PostgreSQL / local database fixtures. |

---

## 2. Zero-Internet Evaluator Demonstration Procedure

If the hackathon venue has **zero internet connectivity**, the entire platform can be presented offline with 100% functionality:

1. **Verify Local Environment:**
   ```bash
   python scripts/demo_health.py
   ```
2. **Launch Offline Stack:**
   - Option A (Docker): `docker compose up -d`
   - Option B (Native):
     - Start PostgreSQL: `net start postgresql-x64-16`
     - Start Backend: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`
     - Start Frontend: `cd frontend && npm run start`
3. **Deterministic AI Mode:**
   - In `.env`, set:
     ```env
     LLM_PROVIDER=deterministic
     EMBEDDING_PROVIDER=deterministic
     RERANKER_PROVIDER=noop
     ```
   - This activates the built-in, anti-hallucination compliance engine. It parses the actual evidence from authentic BIS PDFs and generates verified answers with 100% citation accuracy without external API calls.
4. **Transparency & Honesty Rule:**
   - When running in offline deterministic mode, the UI header displays:
     `[Mode: Offline Deterministic Engine — Authoritative Evidence Grounded]`.
   - Never simulate an external cloud model while claiming live internet connectivity.

---

## 3. Contingency Decision Tree

```
Are external AI APIs reachable?
  │
  ├── YES ──► Use Live LLM Provider (Groq / OpenAI / Claude) with GroundingValidator Guardrails
  │
  └── NO (DNS Failure, Captive Portal, HTTP 429)
        │
        ├── Switch LLM_PROVIDER=deterministic in .env
        ├── Fast restart: uvicorn backend.app.main:app --reload
        └── Present full compliance workflow using local authoritative chunks
```
