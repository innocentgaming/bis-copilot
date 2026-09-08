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
  ShieldCheck,
  Sparkles,
  Mic,
  Camera,
  Globe2,
  Clock,
  Search,
  Upload,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { AdminStatisticsResponse } from "@/types/admin";
import { Footer } from "@/components/layout/Footer";

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
      title: "Know Your Standards",
      description:
        "Instant IS Number lookup across 7,000+ Indian Standards covering all 14 sectional divisions with full scope and applicability.",
      icon: BookOpen,
      href: "/standards",
      color: "from-blue-600 to-indigo-700",
      badge: "7,000+ IS",
    },
    {
      title: "AI Compliance Assistant",
      description:
        "Evidence-grounded RAG chatbot answering technical queries with exact clause citations, units, and non-hallucinatory boundaries.",
      icon: Bot,
      href: "/assistant",
      color: "from-amber-500 to-amber-700",
      badge: "24×7 AI",
    },
    {
      title: "BIS Services Directory",
      description:
        "Explore ISI Mark Scheme-I, Compulsory Registration (CRS), Hallmarking, FMCS, and Tatkal licensing turnarounds.",
      icon: Layers,
      href: "/services",
      color: "from-emerald-600 to-teal-700",
      badge: "Schemes",
    },
    {
      title: "Testing Laboratories Network",
      description:
        "Locate accredited testing laboratories across India filtered by Indian Standard numbers, test parameters, and regions.",
      icon: Microscope,
      href: "/laboratories",
      color: "from-violet-600 to-purple-700",
      badge: "Labs",
    },
    {
      title: "Application Status Tracking",
      description:
        "Real-time multi-stage status tracking and inspection timeline for manufacturing and import licences.",
      icon: Clock,
      href: "/applications",
      color: "from-sky-600 to-blue-700",
      badge: "Timeline",
    },
    {
      title: "Document AI Inspector",
      description:
        "Upload specification PDFs, factory manuals, or test reports to extract requirements, dates, fees, and audit checklists.",
      icon: Upload,
      href: "/documents",
      color: "from-rose-600 to-pink-700",
      badge: "OCR AI",
    },
  ];

  const trustIndicators = [
    { title: "24×7 AI Assistance", desc: "Always available guidance", icon: Bot },
    { title: "Source-backed Answers", desc: "Every response cited to IS clauses", icon: ShieldCheck },
    { title: "Multilingual Support", desc: "Hindi, English & Regional languages", icon: Globe2 },
    { title: "Voice & Image Queries", desc: "Speech & product label inspection", icon: Camera },
  ];

  const sampleQuestions = [
    {
      q: "What is the minimum breaking load and test temperature under Clause 5.2 in IS 1786?",
      desc: "Tests quantitative physical parameter extraction with exact units and temperature limits.",
    },
    {
      q: "How do I apply for an ISI mark licence under Scheme-I for electric sockets?",
      desc: "Demonstrates end-to-end application procedure, required factory documents, and fee schedule.",
    },
    {
      q: "What are the mandatory testing methods in IS 10500 for packaged drinking water?",
      desc: "Retrieves microbiological limits, chemical parameters, and testing laboratory requirements.",
    },
    {
      q: "What is the 6-digit HUID code and how does a consumer verify gold hallmark purity?",
      desc: "Explains BIS Hallmarking regulations, laser mark decoding, and BIS Care verification.",
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 md:p-14 shadow-2xl border border-slate-800/80">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Smart India Hackathon 2024 — Problem Statement 107</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Your Intelligent Assistant for{" "}
              <span className="bg-gradient-to-r from-amber-400 via-white to-emerald-400 bg-clip-text text-transparent">
                Indian Standards & BIS Services
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
              Get instant, accurate, and trusted guidance for 7,000+ Indian Standards,
              ISI Mark certifications, Compulsory Registration (CRS), Hallmarking, and compliance — powered by anti-hallucinatory AI.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/assistant"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl hover:shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI Assistant</span>
              </Link>

              <Link
                href="/standards"
                className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Explore Standards</span>
              </Link>
            </div>
          </div>

          {/* Right Column Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="p-6 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  BIS Copilot Live Engine
                </span>
              </div>

              {/* Chat Simulation */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700/60 flex items-start gap-2">
                  <span className="font-bold text-amber-400 shrink-0">User:</span>
                  <span>What is the breaking load under Clause 5.2 in IS 1786?</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 to-indigo-500/10 border border-amber-500/20 space-y-2 text-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" /> BIS AI Assistant
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      High Confidence
                    </span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    Under <strong>Clause 5.2 of IS 1786:2008</strong>, high strength deformed steel bars Fe 500 must maintain a minimum proof stress of <strong>500 N/mm²</strong> with tensile strength $\ge$ 545 N/mm².
                  </p>
                  <div className="pt-1.5 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-mono text-amber-300">Source: IS 1786:2008 (Page 4, Clause 5.2)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/80 text-slate-300 text-xs">
          {trustIndicators.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800/80 text-amber-400 border border-slate-700/80 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="space-y-6">
        <div className="space-y-1 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complete Digital Ecosystem for Indian Standards
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Engineered specifically to solve SIH Problem Statement 107 with enterprise-grade accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <Link
                key={i}
                href={cap.href}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/50 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cap.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {cap.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sample Evaluation Prompts Section */}
      <section className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Empirical Evaluation Benchmarks
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Try Technical Grounding Inquiries
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleQuestions.map((q, idx) => (
            <Link
              key={idx}
              href={`/assistant?q=${encodeURIComponent(q.q)}`}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-500/40 transition group space-y-1.5 block"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  &quot;{q.q}&quot;
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 shrink-0 mt-0.5" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {q.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
