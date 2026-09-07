"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  FileCheck2,
  FileSearch,
  Layers,
  Microscope,
  Presentation,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { AdminStatisticsResponse } from "@/types/admin";

export default function LandingDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatisticsResponse | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await adminApi.getStatistics();
        setStats(res);
      } catch {
        // Degraded / offline or unauthenticated fallback
      }
    }
    loadStats();
  }, []);

  const capabilities = [
    {
      title: "Standards Intelligence",
      description:
        "Full-text and semantic vector indexing over Indian Standards (IS), cross-referencing amendments, editions, and schedules.",
      icon: BookOpen,
      href: "/standards",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Clause-Level Traceability",
      description:
        "Precise clause hierarchy (5 -> 5.1 -> 5.1.1, Annexes) ensuring answers directly pinpoint the exact legal clause.",
      icon: Layers,
      href: "/standards",
      color: "from-amber-500 to-amber-700",
    },
    {
      title: "Strict Evidence & Citations",
      description:
        "Every claim carries verifiable citations with page boundaries and verbatim excerpts. Zero tolerance for hallucinations.",
      icon: ShieldCheck,
      href: "/chat",
      color: "from-emerald-500 to-teal-700",
    },
    {
      title: "Testing & Laboratory Match",
      description:
        "Locate BIS-accredited testing laboratories across India filtered by required standard capabilities and parameters.",
      icon: Microscope,
      href: "/laboratories",
      color: "from-violet-500 to-purple-700",
    },
    {
      title: "Certification & Conformity",
      description:
        "Navigate mandatory certification schemes including ISI Mark Scheme-I, CRS, and Hallmarking regulations.",
      icon: FileCheck2,
      href: "/certification",
      color: "from-sky-500 to-blue-700",
    },
  ];

  const sampleQuestions = [
    {
      q: "What is the minimum breaking load and test temperature under Clause 5.2 in IS 99999?",
      desc: "Tests quantitative physical parameter extraction with exact units and temperature limits.",
    },
    {
      q: "Which testing methods are specified in Annex A for structural component sampling?",
      desc: "Demonstrates multi-page Annex retrieval, sample size formulas, and testing procedures.",
    },
    {
      q: "What are the mandatory marking and labeling requirements for certified products?",
      desc: "Checks compliance packaging requirements and standard certification scheme rules.",
    },
    {
      q: "What is the recipe for baking chocolate cake?",
      desc: "Demonstrates safe refusal with 'Insufficient Evidence' guard when query is outside Indian Standards.",
    },
  ];

  const handleSampleClick = (question: string) => {
    router.push(`/chat?q=${encodeURIComponent(question)}`);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-8 md:p-14 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart India Hackathon (SIH Problem Statement 26107)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            AI-Powered Indian Standards <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Compliance Assistant
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            Find requirements, clauses, testing methods, certification information and laboratory guidance using evidence-backed answers strictly grounded in authoritative Bureau of Indian Standards documents.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-98"
            >
              <Bot className="w-4 h-4" />
              <span>Ask the Compliance Assistant</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/standards"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-medium text-sm border border-slate-700 transition"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Explore Standards Catalog</span>
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-sm border border-amber-500/30 transition"
            >
              <Presentation className="w-4 h-4" />
              <span>SIH Demo Guide</span>
            </Link>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Metrics Strip */}
      {stats && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Indexed Standards
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.volumes.standards}
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Extracted Clauses
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.volumes.clauses}
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Indexed Knowledge Chunks
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats.volumes.chunks}
            </span>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              User Satisfaction
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {Math.round(stats.feedback.satisfaction_rate * 100)}%
            </span>
          </div>
        </section>
      )}

      {/* Core Capabilities */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Compliance Intelligence Capabilities
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Engineered specifically to fulfill SIH Problem Statement 26107 with high evidence fidelity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <Link
                key={i}
                href={cap.href}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/80 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cap.color} text-white flex items-center justify-center shadow-xs shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center text-xs font-semibold text-amber-600 group-hover:translate-x-0.5 transition">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sample Compliance Inquiries */}
      <section className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Example Compliance Inquiries
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Click any prompt to launch a live compliance inquiry against the Phase 5 backend API.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSampleClick(sq.q)}
              className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-amber-500 hover:bg-white dark:hover:bg-slate-900 transition group space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 transition leading-snug">
                  &ldquo;{sq.q}&rdquo;
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition shrink-0 mt-0.5" />
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                {sq.desc}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
