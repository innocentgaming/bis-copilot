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
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="space-y-10 pb-12">
      {/* Header Banner */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-700/60 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          Smart India Hackathon 2024 — Problem Statement 107
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          AI-Powered Intelligent Assistant for Indian Standards & BIS Services
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
          Empowering Indian industries, MSMEs, startups, manufacturers, consumers, and regulatory officials
          with 24x7 evidence-grounded AI guidance over Bureau of Indian Standards (BIS) regulations,
          7,000+ Indian Standards (IS), laboratory testing networks, and conformity schemes.
        </p>
      </div>

      {/* Core Objectives */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Key Platform Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Anti-Hallucinatory RAG Architecture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every factual answer is directly cited to official Indian Standards, clause numbers, and BIS schedules. Zero tolerance for fabricated regulatory claims.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Multimodal & Multilingual Interaction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Accepts text, voice speech in Hindi/English, product label images, ISI marking inspection, and full compliance PDF uploads.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              End-to-End Application Tracking
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time multi-stage status timeline tracking for ISI Mark, CRS, and Hallmarking applications from submission to licence grant.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
