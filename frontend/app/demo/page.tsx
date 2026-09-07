"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle,
  Clock,
  FileCheck2,
  FileSearch,
  FolderLock,
  Microscope,
  Presentation,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function DemoPage() {
  const router = useRouter();

  const demoSteps = [
    {
      step: "1",
      title: "Executive System Introduction",
      summary: "Explain the anti-hallucinatory compliance philosophy designed for SIH Problem Statement 26107.",
      actionLabel: "Open Dashboard",
      action: () => router.push("/"),
      icon: Presentation,
      highlight: false,
    },
    {
      step: "2",
      title: "Evidence-Grounded AI Compliance Query",
      summary: "Demonstrates real SSE token streaming, exact breaking load (450 N at 25°C), HIGH confidence badge, and verified citation.",
      query: "What is the minimum breaking load and test temperature under Clause 5.2 in IS 99999?",
      actionLabel: "Execute Query in Chat",
      action: () =>
        router.push(
          `/chat?q=${encodeURIComponent(
            "What is the minimum breaking load and test temperature under Clause 5.2 in IS 99999?"
          )}`
        ),
      icon: Bot,
      highlight: true,
    },
    {
      step: "3",
      title: "Inspect Verbatim Evidence Trace",
      summary: "Click the citation card to open the slide-over Evidence Drawer showing exact clause text, page range, and chunk ID.",
      actionLabel: "Open Evidence via Chat",
      action: () => router.push("/chat"),
      icon: ShieldCheck,
      highlight: false,
    },
    {
      step: "4",
      title: "Strict Anti-Hallucination Safe Refusal",
      summary: "Ask an irrelevant/unsupported question to trigger the 'Insufficient Evidence' guard refusing to extrapolate.",
      query: "What is the recipe for baking chocolate cake?",
      actionLabel: "Test Safe Refusal",
      action: () =>
        router.push(
          `/chat?q=${encodeURIComponent(
            "What is the recipe for baking chocolate cake?"
          )}`
        ),
      icon: ShieldAlert,
      highlight: true,
    },
    {
      step: "5",
      title: "Direct Hybrid Search (pgvector + FTS)",
      summary: "Retrieve scored standard chunks with cosine similarity and keyword ranking without LLM synthesis.",
      actionLabel: "Open Hybrid Search",
      action: () => router.push("/search"),
      icon: FileSearch,
      highlight: false,
    },
    {
      step: "6",
      title: "Explore Multi-Level ClauseTree",
      summary: "Inspect hierarchical clause breakdown (5 -> 5.1 -> 5.2) and Annex sampling specifications.",
      actionLabel: "Open Standards Catalog",
      action: () => router.push("/standards"),
      icon: BookOpen,
      highlight: false,
    },
    {
      step: "7",
      title: "Testing Laboratories & Certification",
      summary: "Filter BIS-accredited testing labs by city/state and review mandatory certification schemes.",
      actionLabel: "View Laboratories",
      action: () => router.push("/laboratories"),
      icon: Microscope,
      highlight: false,
    },
    {
      step: "8",
      title: "PDF Document Ingestion & Pipeline",
      summary: "Review drag-and-drop document upload, SHA-256 deduplication, and chunk indexing status.",
      actionLabel: "Open Admin Ingestion",
      action: () => router.push("/admin/documents"),
      icon: FolderLock,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white border border-amber-500/30 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
          <Presentation className="w-3.5 h-3.5" />
          <span>SIH 26107 Presentation Workflow</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          3–5 Minute Evaluation & Demonstration Guide
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          This interactive walkthrough guides judges and evaluators through the complete evidence-grounded BIS compliance assistant workflow, from inquiry to citation verification and administrative pipeline ingestion.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {demoSteps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                s.highlight
                  ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0 border border-slate-800 shadow-xs">
                  {s.step}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                    {s.summary}
                  </p>
                  {s.query && (
                    <span className="inline-block font-mono text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 mt-1">
                      Query: &ldquo;{s.query}&rdquo;
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={s.action}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 shadow-xs ${
                  s.highlight
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                }`}
              >
                <span>{s.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
