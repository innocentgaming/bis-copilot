# Bureau of Indian Standards (BIS) AI Quality / Compliance Copilot
## Evaluator Demonstration Script & Playbook (3–5 Minutes)

**Smart India Hackathon (SIH) Problem Statement:** 26107  
**Evaluator Target Audience:** Technical Evaluators, Industry Compliance Officers, BIS Jury  
**Target Time:** 4 Minutes (Deterministic, Zero-Fluff)

---

### [00:00 – 00:30] Introduction & Problem Framing
**Presenter:**
> *"Namaste esteemed evaluators. Compliance with Bureau of Indian Standards (BIS) is critical for public safety, national infrastructure, and industrial quality. However, standard documents are dense, highly technical, and frequently revised. When engineers, manufacturers, or MSMEs ask compliance questions, traditional keyword search fails to interpret nested clauses, and generic AI models hallucinate non-existent requirements and clauses.*
>
> *Today, we present the **BIS Quality & Compliance Copilot**—an anti-hallucination, hybrid RAG platform engineered with 100% citation traceability, strict evidence grounding, multilingual synthesis, and a live laboratory locator."*

---

### [00:30 – 01:30] Scenario 1: Cement Compliance (IS 12269:2015)
**Action:**
1. Navigate to `http://localhost:3000/demo` (or click **Scenario A** on the demo page).
2. Input Prompt:
   > **"What is the minimum 28-day compressive strength requirement for 53 Grade Ordinary Portland Cement under IS 12269?"**
3. Click **Ask Copilot**.

**What to Point Out on Screen:**
- **Streaming Response:** High-speed SSE token generation with zero UI freezing.
- **Authoritative Answer:** Specifically identifies **53.0 MPa** at 28 days as specified in **Clause 6.2**.
- **Interactive Citation Badge:** Shows `[IS 12269:2015, Clause 6.2, p. 2]`.
- **Evidence Drawer:** Click the citation badge to slide open the **Evidence Inspection Drawer**. Show the verbatim text chunk extracted directly from the authenticated standard PDF.
- **Calibrated Confidence Score:** High confidence score (0.95) based on exact clause match.

---

### [01:30 – 02:00] Scenario 2: Negative Guardrail & Safe Refusal
**Action:**
1. Click **Scenario G** (or paste):
   > **"What is the maximum allowed speed for bullet trains operating under IS 99999?"**
2. Click **Ask Copilot**.

**What to Point Out on Screen:**
- **Controlled Refusal:** The model responds:
  > *"I could not find sufficient evidence in the available Bureau of Indian Standards to answer this question. The standard IS 99999 is not present in the authoritative registry."*
- **Explain to Evaluators:**
  > *"Notice that the Copilot did not invent a speed limit or pretend that an imaginary standard exists. It strictly adheres to our anti-hallucination constraint: if authoritative BIS evidence is absent, the system refuses safely with zero hallucinated clauses or pages."*

---

### [02:00 – 02:45] Scenario 3: Accredited Laboratory Finder
**Action:**
1. Click **Laboratories** in the top navigation bar (`/laboratories`).
2. Type in search bar: `IS 1786` or filter by State: `Maharashtra`.
3. Select a matching accredited laboratory (e.g., *National Test House (WR)* or *Central Materials Testing Laboratory*).

**What to Point Out on Screen:**
- **Accreditation Rigor:** Points out NABL accreditation number, valid validity dates, and authorized testing parameters (Tensile Strength, Bend Test, 0.2% Proof Stress).
- **Contact & Geolocation:** Shows direct physical address, contact telephone, and certified scope.
- **Explain to Evaluators:**
  > *"Our platform doesn't just explain requirements—it bridges the physical compliance gap by guiding manufacturers directly to government and private accredited test facilities."*

---

### [02:45 – 03:30] Scenario 4: Multilingual Compliance in Hindi (हिन्दी)
**Action:**
1. Navigate back to Chat or Demo.
2. Select Language: **हिन्दी (Hindi)**.
3. Input Prompt:
   > **"पेयजल में टर्बिडिटी (गंदलापन) की अधिकतम स्वीकार्य सीमा क्या है?"**
4. Click **Ask Copilot**.

**What to Point Out on Screen:**
- **High-Quality Hindi Explanation:** The narrative is explained in fluent, technical Hindi.
- **Unchanged Technical Latin Identifiers:** Show that critical identifiers remain strictly preserved in Latin notation:
  - `IS 10500:2012`
  - `Clause 4.1` / `Table 1`
  - `1 NTU` (Acceptable limit)
  - `5 NTU` (Permissible limit in absence of alternate source)
- **Authoritative Citation:** Citations remain valid and clickable, linking directly to the authentic clause.

---

### [03:30 – 04:00] Architecture, Verification & Impact
**Action:**
1. Switch to the Architecture / Evaluation tab (`/admin/evaluation`).
2. Conclude:
   > *"Under the hood, every response is backed by PostgreSQL with pgvector and Full-Text Search, merged via Reciprocal Rank Fusion, reranked, and validated by our Citation Integrity Engine which achieves **100% citation accuracy** across all indexed standards.*
   >
   > *With this platform, Indian industry and MSMEs save weeks of regulatory research, ensure zero non-compliance penalties, and uphold the highest standards of Indian quality. Thank you!"*
