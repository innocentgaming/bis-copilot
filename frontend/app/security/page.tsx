"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Database,
  KeyRound,
  UserCheck,
  FileCode2,
  AlertTriangle,
  Server,
  Fingerprint,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
  Cpu,
} from "lucide-react";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<"access" | "validation" | "privacy" | "architecture">("access");

  return (
    <div className="space-y-10 pb-16 animate-in fade-in-50">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-8 md:p-12 text-white border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Enterprise-Grade Trust &amp; Safety Framework
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Security, Privacy &amp; Source Validation Center
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Engineered with a Zero-Trust architecture, 100% citation grounding verification, and full compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
          </p>
        </div>

        {/* Security Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black text-emerald-400 block">100.0%</span>
            <span className="text-xs text-slate-300 font-medium">Citation Validity</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black text-blue-400 block">SHA-256</span>
            <span className="text-xs text-slate-300 font-medium">Document Checksums</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black text-amber-400 block">3-Tier RBAC</span>
            <span className="text-xs text-slate-300 font-medium">Controlled Access</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black text-purple-400 block">DPDP 2023</span>
            <span className="text-xs text-slate-300 font-medium">Privacy Compliance</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("access")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "access"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700 font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>1. Controlled Access &amp; RBAC</span>
        </button>
        <button
          onClick={() => setActiveTab("validation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "validation"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700 font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>2. Source Validation &amp; Grounding</span>
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "privacy"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700 font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>3. Secure Data Handling &amp; DPDP</span>
        </button>
        <button
          onClick={() => setActiveTab("architecture")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === "architecture"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700 font-extrabold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>4. Threat Defense &amp; Architecture</span>
        </button>
      </div>

      {/* TAB 1: CONTROLLED ACCESS */}
      {activeTab === "access" && (
        <div className="space-y-6 animate-in fade-in-30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Role Based Access */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                3-Tier Role-Based Access (RBAC)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Fine-grained permission boundaries restrict access across administrative, inspection, and public interfaces.
              </p>
              <div className="space-y-2 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white">Citizen (Public):</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    Standards lookup, AI consultation, ISI &amp; HUID verification, complaint submission.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white">Auditor (BIS Official):</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    Grievance queues, laboratory accreditation audits, document AI compliance summaries.
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white">Administrator:</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    System configuration, benchmark evaluation triggers, gazette indexing pipelines.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Stateless JWT */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                HMAC-SHA256 JWT Authentication
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cryptographically signed stateless tokens with strict short lifespans and automatic token rotation.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>60-minute access token expiry</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Secure hashed refresh tokens</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Route dependencies: <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">require_admin()</code></span>
                </li>
              </ul>
            </div>

            {/* Card 3: Rate Limiter */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Sliding-Window Rate Limiting
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                In-memory and Redis-ready sliding window rate limiters prevent automated scraping, bot attacks, and denial-of-service.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>60 requests / minute per client IP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>HTTP 429 Too Many Requests response</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Correlation tracking with <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">X-Request-ID</code></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCE VALIDATION */}
      {activeTab === "validation" && (
        <div className="space-y-6 animate-in fade-in-30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grounding Gate */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                100% Citation Grounding Verification Gate
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every AI answer is cross-checked before delivery. The system purges any citation or factual assertion that does not map directly to an authoritative database chunk.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-emerald-500 font-bold">&lt;EVIDENCE id=&quot;E1&quot;&gt;</div>
                <div className="pl-3">Standard: IS 12269:2015</div>
                <div className="pl-3">Clause: 6.2 (Compressive Strength)</div>
                <div className="pl-3">Citation: [IS 12269:2015, Clause 6.2, pp. 2–3]</div>
                <div className="text-emerald-500 font-bold">&lt;/EVIDENCE&gt;</div>
              </div>
            </div>

            {/* Checksum & Ingestion Verification */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <FileCode2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cryptographic Checksums &amp; Magic Bytes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All indexed standards and user-uploaded PDFs undergo deep binary inspection to prevent malicious file uploads and ensure document integrity.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>SHA-256 Hashing:</strong> Automated checksum validation detects any upstream modification in gazetted standards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Magic-Byte Verification:</strong> Binary validation checks for valid PDF headers (<code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1">%PDF-1.x</code>), blocking disguised executables.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Controlled Safe Refusal:</strong> Triggers clean refusal response if no official standard chunks support the query.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURE DATA HANDLING & PRIVACY */}
      {activeTab === "privacy" && (
        <div className="space-y-6 animate-in fade-in-30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DPDP Act 2023 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                DPDP Act 2023 Compliance
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Adheres strictly to India&apos;s Digital Personal Data Protection Act, 2023. User data is processed solely for purpose-bound regulatory queries.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Purpose-limited data processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero unauthorized data sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tenant UUID session isolation</span>
                </li>
              </ul>
            </div>

            {/* PII & Token Redaction */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Automated PII &amp; Secret Redaction
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Integrated safety interceptors scrub API keys, bearer tokens, and inadvertent credential disclosures from logs and client token streams.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                Bearer: <span className="text-rose-500 font-bold">[REDACTED TOKEN]</span><br />
                Key: <span className="text-rose-500 font-bold">[REDACTED KEY]</span>
              </div>
            </div>

            {/* SQL Injection Defense */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                100% Parameterized Database Queries
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Database queries use SQLAlchemy 2.0 Async ORM and asyncpg with strict parameterization, eliminating SQL Injection vulnerabilities.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Pydantic v2 type &amp; regex validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>TLS 1.3 in transit + AES-256 at rest</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Prompt Injection regex shield (DAN, Jailbreaks)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE & THREAT MODEL */}
      {activeTab === "architecture" && (
        <div className="space-y-6 animate-in fade-in-30">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              <span>Multi-Layered Defense-in-Depth Pipeline</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <pre>{`[Incoming Request: Client / Browser]
        │
        ├──► 1. TLS 1.3 Transport Security (HTTPS)
        ├──► 2. Sliding-Window Rate Limiter (60 req/min per IP)
        ├──► 3. JWT HMAC-SHA256 Token & RBAC Guard (Citizen / Auditor / Admin)
        ├──► 4. Prompt Injection & Adversarial Scanner (SafetyChecker)
        │
[FastAPI Asynchronous Gateway]
        │
        ├──► 5. Dense Vector Search (pgvector HNSW) + Full-Text Search
        ├──► 6. Reciprocal Rank Fusion (RRF, k=60) + FlashRank Cross-Encoder
        │
[Anti-Hallucination Execution Gate]
        │
        ├──► 7. Delimited XML Context (<EVIDENCE id="...">)
        ├──► 8. Automated Citation Verification Audit (Purges unverified facts)
        ├──► 9. Automated PII & Secret Redaction Filter
        │
[Client Response] ──► SSE Token Stream + Verbatim Citation Evidence Drawer`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-xl font-black">Experience the Verified BIS AI Copilot</h3>
          <p className="text-xs text-blue-100 max-w-xl">
            Ask any question regarding Indian Standards, ISI certification, or Hallmarking with 100% grounded evidence.
          </p>
        </div>
        <Link
          href="/assistant"
          className="px-6 py-3 rounded-2xl bg-white text-blue-900 font-bold text-xs shadow-lg hover:bg-blue-50 transition flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Launch AI Assistant</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
