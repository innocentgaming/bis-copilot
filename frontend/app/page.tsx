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
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  ShieldAlert,
  SearchCode,
  FileCheck,
  Cpu,
  BadgeCheck,
} from "lucide-react";
import { ISLookupSection } from "@/components/standards/ISLookupSection";
import { OutcomesAndImpactSection } from "@/components/home/OutcomesAndImpactSection";
import { VoiceModal } from "@/components/multimodal/VoiceModal";
import { VisionModal } from "@/components/multimodal/VisionModal";
import { SUPPORTED_LANGUAGES } from "@/types/bis_platform";

const POPULAR_PROMPTS = [
  "What BIS certification do I need for manufacturing LED lights?",
  "Is IS 1293 mandatory for 3-pin power plugs in India?",
  "How to verify a 6-digit HUID code on 22K gold jewelry?",
  "What is the penalty for selling products with fake ISI mark?",
  "What documents are required for Compulsory Registration Scheme (CRS)?",
  "How to verify CM/L-8472910 on packaged drinking water?",
];

const WORKFLOW_STEPS = [
  {
    step: "STEP 1",
    title: "USER QUERY",
    tagline: "Multimodal Input",
    desc: "Ask via Text, Speech (Hindi/English), Product Packaging Image, or PDF Gazette upload.",
    icon: Mic,
    color: "from-blue-600 to-cyan-600",
  },
  {
    step: "STEP 2",
    title: "AI UNDERSTANDS INTENT",
    tagline: "NLP Categorization",
    desc: "Detects product category, standard IS code, certification requirements, or safety violations.",
    icon: Cpu,
    color: "from-indigo-600 to-blue-600",
  },
  {
    step: "STEP 3",
    title: "SEARCH BIS REPOSITORY",
    tagline: "Hybrid RAG Engine",
    desc: "Scans 7,000+ Indian Standards, gazette QCOs, and CM/L license registries with sub-second retrieval.",
    icon: SearchCode,
    color: "from-purple-600 to-indigo-600",
  },
  {
    step: "STEP 4",
    title: "EXTRACT & ANALYZE",
    tagline: "Evidence Grounding",
    desc: "Pinpoints mandatory safety clauses, test parameters, quality limits, and authorized manufacturers.",
    icon: FileCheck,
    color: "from-amber-600 to-orange-600",
  },
  {
    step: "STEP 5",
    title: "RESPONSE WITH SOURCES",
    tagline: "Zero-Hallucination",
    desc: "Generates clear AI Answer, 'Why this answer?' reasoning, and direct links to official BIS clauses.",
    icon: ShieldCheck,
    color: "from-emerald-600 to-teal-600",
  },
  {
    step: "STEP 6",
    title: "ACCURATE GUIDANCE & ACTION",
    tagline: "Actionable Resolution",
    desc: "One-click actions: [Verify Now], [Report a Problem], [Checklist], or [Ask Follow-up].",
    icon: BadgeCheck,
    color: "from-rose-600 to-pink-600",
  },
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
    link: "/hallmark-verification",
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
    a: "Every genuine ISI mark contains a 7-digit licence number (CM/L-XXXXXXX) printed below or beside the standard mark. You can enter this CM/L number or IS standard in our Product Verification tool or AI Assistant to verify its authenticity instantly.",
  },
  {
    q: "What does the 6-character HUID on gold jewelry mean?",
    a: "HUID stands for Hallmark Unique Identification. It is a 6-character alphanumeric code laser-etched on each piece of jewelry at an authorized Assaying and Hallmarking Centre (AHC), enabling complete traceability and verification of gold purity (e.g. 22K916, 18K750).",
  },
  {
    q: "How does the BIS AI Assistant provide accurate answers without hallucination?",
    a: "BIS AI uses an advanced Retrieval-Augmented Generation (RAG) architecture grounded strictly in 7,000+ official Indian Standards, gazette Quality Control Orders (QCOs), and BIS procedural guidelines with verifiable clause citations and 'Why this answer?' transparency drawers.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [heroQuery, setHeroQuery] = useState("");
  const [cmlInput, setCmlInput] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleHeroSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!heroQuery.trim()) return;
    router.push(`/assistant?q=${encodeURIComponent(heroQuery.trim())}`);
  };

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmlInput.trim()) return;
    router.push(`/product-verification?cml=${encodeURIComponent(cmlInput.trim())}`);
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 md:p-16 text-white shadow-2xl border border-blue-900/40">
        {/* Glow effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-bold text-blue-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered BIS Knowledge Assistant</span>
          </div>

          {/* 3-Line Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Understand BIS Standards. <br />
            <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
              Verify Products.
            </span> <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
              Stay Safe.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AI assistant for Indian Standards, ISI mark verification, hallmarking, compliance &amp; consumer protection. 100% evidence-grounded with official gazette citations.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/assistant"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl hover:shadow-blue-500/25 transition transform active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask BIS AI</span>
            </Link>
            <Link
              href="/product-verification"
              className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl hover:shadow-emerald-500/25 transition transform active:scale-95 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Verify a Product</span>
            </Link>
            <Link
              href="/complaints"
              className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 shadow-md backdrop-blur-md transition flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>File Complaint</span>
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
              placeholder="Ask anything (e.g., 'Is ISI mark mandatory for helmet?', 'Verify CM/L-8472910')..."
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
                <span>Ask</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400">Try asking:</span>
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

          {/* Quick License Verification Strip */}
          <div className="pt-4 border-t border-white/10 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Quick ISI Licence Verification:
              </span>
              <span>Enter 7-digit CM/L number printed on packaging</span>
            </div>
            <form onSubmit={handleQuickVerify} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={cmlInput}
                onChange={(e) => setCmlInput(e.target.value)}
                placeholder="e.g. CM/L-8472910"
                className="px-3 py-1.5 rounded-xl bg-white/10 text-white placeholder-slate-400 text-xs focus:outline-none border border-white/20 uppercase w-36 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. HOW BIS AI COPILOT WORKS (CONNECTED 6-STEP WORKFLOW) */}
      <section className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            End-to-End System Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            How BIS AI Copilot Works
          </h2>
          <p className="text-xs text-slate-500">
            From multimodal question to authoritative resolution with zero-hallucination source transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white">
                    {item.step}
                  </span>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {item.tagline}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Stage {idx + 1} of 6</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition text-blue-500" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TARGET AUDIENCE PATHWAYS */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Tailored Assistance
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            Who is BIS AI Copilot Built For?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Consumers */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Consumers &amp; Citizens
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verify ISI mark authenticity, check gold HUID codes, learn mandatory product safety rules, and file complaints.
              </p>
            </div>
            <Link
              href="/consumer-help"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-2"
            >
              <span>Consumer Hub</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* MSMEs & Manufacturers */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-500/50 transition">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                MSMEs &amp; Manufacturers
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Discover applicable IS codes, calculate certification fees, understand laboratory testing, and get grant checklists.
              </p>
            </div>
            <Link
              href="/certifications"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-2"
            >
              <span>Certification Roadmap</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Startups & Importers */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-500/50 transition">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Startups &amp; Importers
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Navigate Compulsory Registration Scheme (CRS) for electronics, FMCS for overseas factories, and customs clearance rules.
              </p>
            </div>
            <Link
              href="/services/compulsory-registration-scheme-crs"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 pt-2"
            >
              <span>CRS Guidance</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Inspectors & Students */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-amber-500/50 transition">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inspectors &amp; Students
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Research Indian Standards clauses, summarize complex technical documents, analyze Quality Control Orders (QCOs).
              </p>
            </div>
            <Link
              href="/documents"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 pt-2"
            >
              <span>Document Assistant</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
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
              Schemes &amp; Conformity
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
              <span>Gold &amp; Silver Purity</span>
            </div>
            <h3 className="text-2xl font-black">
              Verify 6-Character Hallmark HUID
            </h3>
            <p className="text-xs text-amber-100 leading-relaxed">
              Ensure your gold jewelry matches mandatory purity markings (22K916, 18K750, 14K585) and check the registered Assaying &amp; Hallmarking Centre.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/hallmark-verification"
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
              Lodge an official grievance against sub-standard products, counterfeit marks, or misleading claims through our guided 6-step complaint wizard.
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

      {/* 8. EXPECTED OUTCOMES & IMPACT SECTION */}
      <OutcomesAndImpactSection />

      {/* 9. PLATFORM STATS & TRUST INDICATORS */}
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
            <span>Launch BIS AI Copilot</span>
          </Link>
          <Link
            href="/product-verification"
            className="px-8 py-3.5 rounded-2xl bg-black/20 text-white font-bold text-sm border border-white/20 hover:bg-black/30 transition"
          >
            Verify Product ISI Mark
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
