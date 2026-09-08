"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  Mic,
  Camera,
  FileText,
  Bell,
  Check,
  Server,
  Terminal,
  ShieldAlert,
  ArrowDown,
  Globe,
  Radio,
  FileCheck2,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function AboutArchitecturePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. HEADER BANNER */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white shadow-xl border border-blue-900/40 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BIS AI COPILOT Architecture</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          System Architecture &amp; Technology Stack
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
          Tagline: <strong className="text-white">&quot;AI-Powered BIS Standards, Certification &amp; Consumer Safety Assistant&quot;</strong>.
          Designed as an authoritative, enterprise-grade government AI platform adhering strictly to zero-hallucination citations and official Bureau of Indian Standards (BIS) data.
        </p>
      </div>

      {/* 2. HIGH-LEVEL ARCHITECTURE VISUALIZATION (CONNECTED CARDS) */}
      <section className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            High-Level Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            System Data Flow &amp; Subsystems
          </h2>
          <p className="text-xs text-slate-500">
            End-to-end data pipeline from user multimodal input through AI Assistant Engine to verified BIS knowledge bases and notification channels.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* LEVEL 1: USER LAYER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center font-bold text-sm shadow-md">
            <span>USER (Consumers, MSMEs, Manufacturers, Startups, Inspectors, Regulators)</span>
          </div>

          <div className="flex justify-center text-blue-600">
            <ArrowDown className="w-6 h-6 animate-bounce" />
          </div>

          {/* LEVEL 2: INTERACTION CHANNELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Web / Mobile Responsive UI</h3>
              <p className="text-xs text-slate-500">
                Next.js 14 App Router, Tailwind CSS, 11 Indian Languages, PWA &amp; Accessible Design
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Voice &amp; Vision &amp; OCR Engine</h3>
              <p className="text-xs text-slate-500">
                Web Speech API (Hindi/English), Packaging Label Camera Scanner, PDF Gazette Parser
              </p>
            </div>
          </div>

          <div className="flex justify-center text-blue-600">
            <ArrowDown className="w-6 h-6" />
          </div>

          {/* LEVEL 3: AI ASSISTANT ENGINE */}
          <div className="p-6 md:p-8 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-500/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Cpu className="w-5 h-5" />
                <h3 className="text-base font-extrabold uppercase tracking-wide">AI Assistant Engine</h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                Core NLP &amp; RAG
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 space-y-1">
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  1. NLP &amp; Intent Recognition
                </strong>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Entity extraction (IS number, CML licence, HUID code), intent classifier, query normalizer.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 space-y-1">
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  2. Search &amp; Retrieval Engine
                </strong>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Hybrid keyword search (FTS5) + semantic vector embeddings with Cross-Encoder reranking.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 space-y-1">
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  3. Response Generation (LLM)
                </strong>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Strict grounded prompt synthesis with confidence scoring, source citations, and next-step actions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-blue-600">
            <ArrowDown className="w-6 h-6" />
          </div>

          {/* LEVEL 4: PARALLEL BACKEND SUBSYSTEMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BIS Systems & APIs */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Server className="w-4 h-4" />
                  <h4 className="text-xs font-black uppercase tracking-wider">BIS Systems / APIs</h4>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Gateway Integration
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Product Certification &amp; CM/L Registry</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Hallmarking HUID Assaying Database</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Laboratory Testing Registry (Central &amp; Regional)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Consumer Grievance Intake &amp; Tracking</span>
                </li>
              </ul>
            </div>

            {/* Centralized Knowledge Base */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Database className="w-4 h-4" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Centralized Knowledge Base</h4>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  PostgreSQL 16 + pgvector
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>7,000+ Indian Standards (IS Codes, Titles, Clauses)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>BIS Services &amp; Conformity Schemes Directory</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Gazette Quality Control Orders (Mandatory QCOs)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Procedural FAQs, Fee Guidelines &amp; Manuals</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center text-blue-600">
            <ArrowDown className="w-6 h-6" />
          </div>

          {/* LEVEL 5: NOTIFICATION SERVICE */}
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Multi-Channel Notification Service
                </h4>
                <p className="text-[11px] text-slate-500">
                  In-app notifications, push notifications, and email alerts for application status, QCO revisions &amp; complaint updates.
                </p>
              </div>
            </div>
            <Link
              href="/notifications"
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shrink-0"
            >
              View Alerts
            </Link>
          </div>
        </div>
      </section>

      {/* 3. AI GOVERNANCE & ZERO-HALLUCINATION PRINCIPLES */}
      <section className="p-8 md:p-12 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            AI Safety &amp; Governance
          </span>
          <h2 className="text-2xl md:text-3xl font-black">
            Strict Non-Hallucinatory Principles
          </h2>
          <p className="text-xs text-slate-400">
            How BIS AI Copilot ensures government-grade reliability for citizen and industrial queries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              1. Grounded Context Only
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              The LLM is strictly constrained to answer using only retrieved standard clauses and official documentation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              2. Verifiable Source Links
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every factual answer presents direct links: [View Standard], [View BIS Document], and gazette publication dates.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              3. Honest Confidence &amp; Fallback
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              If information is missing, the system states &quot;I couldn&apos;t find reliable information in the available BIS knowledge base.&quot;
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
