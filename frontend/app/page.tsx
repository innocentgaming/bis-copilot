"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  Search,
  Mic,
  Camera,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Layers,
  Award,
  Gem,
  AlertTriangle,
  FileText,
  Clock,
  Languages,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  BarChart3,
  Flame,
  Check,
  Zap,
} from "lucide-react";
import { ISLookupSection } from "@/components/standards/ISLookupSection";
import { VoiceModal } from "@/components/multimodal/VoiceModal";
import { VisionModal } from "@/components/multimodal/VisionModal";
import { SUPPORTED_LANGUAGES } from "@/types/bis_platform";

const POPULAR_PROMPTS = [
  "What BIS certification do I need for manufacturing LED lights?",
  "Is IS 1293 mandatory for 3-pin power plugs in India?",
  "How to verify a 6-digit HUID code on 22K gold jewelry?",
  "What is the penalty for selling products with fake ISI mark?",
  "What documents are required for Compulsory Registration Scheme (CRS)?",
  "How long does it take to obtain a BIS Scheme-I licence?",
];

const BIS_POPULAR_SERVICES = [
  {
    title: "Product Certification (Scheme-I)",
    tag: "ISI Mark",
    desc: "Conformity assessment granting use of the prestigious ISI Mark across 1,000+ mandatory & voluntary products.",
    link: "/certifications",
  },
  {
    title: "Compulsory Registration (CRS)",
    tag: "Electronics & IT",
    desc: "Self-declaration of conformity for laptops, mobile phones, power adapters, and electronic appliances.",
    link: "/services/compulsory-registration-scheme-crs",
  },
  {
    title: "Hallmarking Scheme",
    tag: "Gold & Silver",
    desc: "Mandatory purity certification with 6-digit laser-etched HUID codes for precious jewelry.",
    link: "/hallmarking",
  },
  {
    title: "Foreign Manufacturers (FMCS)",
    tag: "Import / Global",
    desc: "Certification scheme enabling overseas manufacturing plants to export certified goods into India.",
    link: "/services/foreign-manufacturers-certification-scheme-fmcs",
  },
  {
    title: "ECO Mark Scheme",
    tag: "Green Products",
    desc: "Environmental labeling for products meeting quality standards and stringent ecological criteria.",
    link: "/services",
  },
  {
    title: "Laboratory Testing Services",
    tag: "Accredited Testing",
    desc: "Testing facilities across central and regional BIS laboratories for third-party quality verification.",
    link: "/laboratories",
  },
];

const FAQS = [
  {
    q: "What is the difference between ISI Mark (Scheme-I) and CRS Registration?",
    a: "Scheme-I (ISI Mark) involves factory auditing, quality management checks, and independent laboratory testing before granting licence to use the ISI mark. CRS (Compulsory Registration Scheme) is a simplified registration specifically for Electronics & IT goods based on test reports from BIS-recognized laboratories.",
  },
  {
    q: "How can I verify if an ISI mark on a product is genuine or counterfeit?",
    a: "Every genuine ISI mark contains a 7-digit licence number (CM/L-XXXXXXX) printed below or beside the standard mark. You can enter this CM/L number or IS standard in our Smart Standards Search or AI Assistant to verify its authenticity.",
  },
  {
    q: "What does the 6-digit HUID on gold jewelry mean?",
    a: "HUID stands for Hallmark Unique Identification. It is a 6-character alphanumeric code laser-etched on each piece of jewelry at an authorized Assaying and Hallmarking Centre (AHC), enabling complete traceability of gold purity.",
  },
  {
    q: "How does the BIS AI Assistant provide accurate answers without hallucination?",
    a: "BIS AI uses an advanced Retrieval-Augmented Generation (RAG) architecture grounded strictly in 7,000+ official Indian Standards, gazette Quality Control Orders (QCOs), and BIS procedural guidelines with verifiable clause citations.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [heroQuery, setHeroQuery] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleHeroSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!heroQuery.trim()) return;
    router.push(`/assistant?q=${encodeURIComponent(heroQuery.trim())}`);
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 md:p-16 text-white shadow-2xl border border-blue-900/40">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-bold text-blue-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Intelligent Assistant for Indian Standards & BIS Services</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Your Intelligent Assistant for <br />
            <span className="bg-gradient-to-r from-amber-400 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
              BIS Standards & Services
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Get instant, accurate and trusted guidance on Indian Standards, BIS certification, hallmarking, compliance and consumer services.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/assistant"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl hover:shadow-blue-500/25 transition transform active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask BIS AI</span>
            </Link>
            <Link
              href="/standards/search"
              className="px-7 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 shadow-md backdrop-blur-md transition flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search Standards</span>
            </Link>
          </div>

          {/* Search/Chat Input Bar */}
          <form
            onSubmit={handleHeroSubmit}
            className="max-w-3xl mx-auto p-2 rounded-2xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-2"
          >
            <input
              type="text"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Ask anything about BIS, standards, certification or consumer rights..."
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
            />
            <div className="flex items-center gap-1.5 pr-1">
              <button
                type="button"
                onClick={() => setVoiceOpen(true)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition"
                title="Voice Input (Hindi / English)"
              >
                <Mic className="w-4 h-4 text-amber-300" />
              </button>
              <button
                type="button"
                onClick={() => setVisionOpen(true)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition"
                title="Inspect Product Label Image"
              >
                <Camera className="w-4 h-4 text-blue-300" />
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
              >
                <span>Send</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Sample Benchmark Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400">Popular Inquiries:</span>
            {POPULAR_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => router.push(`/assistant?q=${encodeURIComponent(prompt)}`)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 text-xs transition"
              >
                &quot;{prompt}&quot;
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THREE-COLUMN PROBLEM + SOLUTION + KEY FEATURES SECTION */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Problem vs Solution Architecture
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            Transforming Complex Standards into Simple Guidance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COLUMN 1 — WHAT IS THE PROBLEM? */}
          <div className="p-6 md:p-8 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-5">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-extrabold uppercase tracking-wider">
                What is the Problem?
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 space-y-1">
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  1. Difficult Standards Search
                </strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Consumers and industries struggle to find the right Indian Standards across thousands of PDF publications.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 space-y-1">
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  2. Complex Documentation
                </strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Large and confusing documentation makes BIS certification and compliance processes difficult for MSMEs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 space-y-1">
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  3. Delays & Uncertainty
                </strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Users often don&apos;t know application, approval, or compliance status across different portal silos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 space-y-1">
                <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                  4. Lack of Accessible Guidance
                </strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  24x7 guidance in local Indian languages is limited for grassroots citizens and small businesses.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 2 — OUR SOLUTION */}
          <div className="p-6 md:p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-5">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Bot className="w-5 h-5" />
              <h3 className="text-base font-extrabold uppercase tracking-wider">
                Our Solution
              </h3>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white space-y-2 shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block">
                Intelligent Platform
              </span>
              <h4 className="text-lg font-black leading-snug">
                An AI-powered Intelligent Assistant
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                Seamlessly bridges official government databases and everyday citizens with natural language understanding.
              </p>
            </div>

            <div className="space-y-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              {[
                "Indian Standards Search (7,000+ Standards)",
                "BIS Certification & Services Navigator",
                "Compliance & Mandatory QCO Guidance",
                "Application Assistance & Form Fillers",
                "Status Tracking & Live Notifications",
                "11 Indian Languages Multi-language Support",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3 — KEY FEATURES */}
          <div className="p-6 md:p-8 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 space-y-5">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Zap className="w-5 h-5" />
              <h3 className="text-base font-extrabold uppercase tracking-wider">
                Key Features
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { title: "Natural Language Chatbot (24x7)", desc: "Instant answers with authoritative clause citations." },
                { title: "Smart Standards Search", desc: "Sub-millisecond IS number & keyword retrieval engine." },
                { title: "BIS Services Directory", desc: "Eligibility, fees, and steps for all 10+ schemes." },
                { title: "Step-by-Step Guidance", desc: "Interactive 8-stage certification roadmap." },
                { title: "Document Assistant", desc: "PDF upload, circular summarizer & checklist generator." },
                { title: "Status Tracking & Alerts", desc: "Real-time tracking for applications & complaints." },
                { title: "Multi-language Support", desc: "11 Indian languages preset with localized text." },
                { title: "Voice & Image Based Queries", desc: "Microphone speech & product packaging label scanner." },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 space-y-0.5"
                >
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{feat.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5.5">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW BIS AI WORKS (5-STEP WORKFLOW) */}
      <section className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Evidence-Grounded RAG Pipeline
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            How BIS AI Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { step: "1. ASK", title: "Ask Your Question", desc: "Type, speak in Hindi/English, or upload a product packaging image." },
            { step: "2. UNDERSTAND", title: "BIS AI Understands", desc: "Identifies product category, technical parameters, and user intent." },
            { step: "3. SEARCH", title: "Searches Knowledge", desc: "Scans 7,000+ Indian Standards and official BIS scheme guidelines." },
            { step: "4. VERIFY", title: "Verifies Evidence", desc: "Validates clause-level accuracy with strict anti-hallucination guardrails." },
            { step: "5. GUIDE", title: "Step-by-Step Guidance", desc: "Provides actionable checklists, fees, forms, and official portal links." },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
                  {item.step}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. "KNOW YOUR STANDARDS" INTERACTIVE LOOKUP */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Seed Dataset of 7,000 Standards
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Know Your Standards — IS Number Lookup
            </h2>
          </div>
          <Link
            href="/standards/search"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Open Advanced Standards Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ISLookupSection />
      </section>

      {/* 5. POPULAR BIS SERVICES DIRECTORY PREVIEW */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Schemes & Conformity
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Explore Popular BIS Services
            </h2>
          </div>
          <Link
            href="/services"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Services Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BIS_POPULAR_SERVICES.map((srv, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-md transition"
            >
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  {srv.tag}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={srv.link}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Explore Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href={`/assistant?q=${encodeURIComponent(`Explain eligibility and documents for ${srv.title}`)}`}
                  className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ask AI</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HALLMARKING & CONSUMER VIOLATION DUAL BANNER */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hallmarking Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-700 text-white shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-amber-100">
              <Gem className="w-3.5 h-3.5 text-yellow-300" />
              <span>Gold & Silver Purity</span>
            </div>
            <h3 className="text-2xl font-black">
              Verify 6-Digit Hallmark HUID
            </h3>
            <p className="text-xs text-amber-100 leading-relaxed">
              Ensure your gold jewelry matches mandatory purity markings (22K916, 18K750) and check the registered Assaying & Hallmarking Centre.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/hallmarking"
              className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs shadow-md hover:bg-amber-50 transition"
            >
              Verify HUID Code
            </Link>
            <Link
              href="/assistant?q=What are the 3 mandatory hallmark marks on gold?"
              className="px-4 py-3 rounded-2xl bg-black/20 text-white font-bold text-xs hover:bg-black/30 transition"
            >
              Ask BIS AI
            </Link>
          </div>
        </div>

        {/* Consumer Grievance Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-xs font-bold text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Consumer Protection</span>
            </div>
            <h3 className="text-2xl font-black">
              Encountered a Fake ISI Mark or Defect?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Lodge an official grievance against sub-standard products, counterfeit marks, or misleading claims through our guided complaint wizard.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/complaints"
              className="px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-500 transition"
            >
              File a Complaint
            </Link>
            <Link
              href="/consumer-help"
              className="px-4 py-3 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition"
            >
              Consumer Help Center
            </Link>
          </div>
        </div>
      </section>

      {/* 7. 11 INDIAN LANGUAGES SHOWCASE */}
      <section className="p-8 md:p-12 rounded-3xl bg-slate-900 text-white space-y-6 text-center">
        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Inclusive Citizen Access
          </span>
          <h2 className="text-2xl md:text-3xl font-black">
            24x7 Assistance in 11 Indian Languages
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Empowering citizens and MSMEs across all states with instant standards guidance in their native language.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto pt-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Link
              key={lang.code}
              href={`/assistant?lang=${lang.code}`}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-blue-600 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition flex items-center gap-2"
            >
              <span>{lang.nativeLabel}</span>
              <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. PLATFORM STATS & TRUST INDICATORS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Indian Standards", val: "7,000+", icon: BookOpen, color: "text-blue-600" },
          { label: "Sectional Divisions", val: "14 Divisions", icon: Layers, color: "text-indigo-600" },
          { label: "Query Response Time", val: "< 1.2s", icon: Zap, color: "text-amber-600" },
          { label: "Evidence Citations", val: "100% Grounded", icon: ShieldCheck, color: "text-emerald-600" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2"
            >
              <div className={`w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mx-auto ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                {stat.val}
              </div>
              <span className="text-xs text-slate-500 block font-medium">
                {stat.label}
              </span>
            </div>
          );
        })}
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Authoritative Answers
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeFaq === idx ? "rotate-90 text-blue-600" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. HIGH IMPACT CTA */}
      <section className="p-8 md:p-14 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-2xl text-center space-y-6">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Ready to Navigate Indian Standards Effortlessly?
          </h2>
          <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
            Ask any question about certification schemes, mandatory QCOs, testing labs, or consumer rights.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/assistant"
            className="px-8 py-3.5 rounded-2xl bg-white text-slate-950 font-black text-sm shadow-xl hover:bg-slate-100 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Launch 24x7 BIS AI Assistant</span>
          </Link>
          <Link
            href="/standards/search"
            className="px-8 py-3.5 rounded-2xl bg-black/20 text-white font-bold text-sm border border-white/20 hover:bg-black/30 transition"
          >
            Explore Standards
          </Link>
        </div>
      </section>

      {/* Modals */}
      <VoiceModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSelectQuery={(q) => router.push(`/assistant?q=${encodeURIComponent(q)}`)}
      />
      <VisionModal
        isOpen={visionOpen}
        onClose={() => setVisionOpen(false)}
      />
    </div>
  );
}
