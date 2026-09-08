"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Sparkles,
  Target,
  Rocket,
  Zap,
  Search,
  Building2,
  Users,
  Landmark,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Layers,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  ExternalLink,
  Cpu,
  BadgeCheck,
  FileCheck2,
  Scale,
} from "lucide-react";

const OUTCOME_METRICS = [
  {
    icon: Clock,
    title: "Time Saving",
    stat: "Up to 70%*",
    statLabel: "Target Faster Retrieval",
    color: "from-blue-600 to-cyan-600",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "hover:border-blue-500/50",
    desc: "Save up to 70% of time spent manually searching through lengthy BIS gazettes, standard PDF catalogs, and certification tables.",
    badge: "Target Outcome",
  },
  {
    icon: BookOpen,
    title: "Standards Adoption",
    stat: "7,000+ IS",
    statLabel: "Grounded Standards Catalog",
    color: "from-indigo-600 to-blue-600",
    textColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "hover:border-indigo-500/50",
    desc: "Make Indian Standards easier to discover, interpret at the clause level, and apply across diverse industrial manufacturing workflows.",
    badge: "Knowledge Discovery",
  },
  {
    icon: Sparkles,
    title: "User Satisfaction",
    stat: "11 Languages",
    statLabel: "Inclusive Citizen Access",
    color: "from-purple-600 to-pink-600",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "hover:border-purple-500/50",
    desc: "Provide simple, conversational, and source-backed answers in regional Indian languages instead of confusing bureaucratic manuals.",
    badge: "Citizen Centric",
  },
  {
    icon: Target,
    title: "Efficiency & Accuracy",
    stat: "100%*",
    statLabel: "Evidence-Grounded Citations",
    color: "from-emerald-600 to-teal-600",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "hover:border-emerald-500/50",
    desc: "Reduce repetitive manual enquiries while maintaining high retrieval precision with verifiable gazette and clause citations.",
    badge: "Zero Fabrication",
  },
  {
    icon: Rocket,
    title: "Scalable & Future-Ready",
    stat: "24x7",
    statLabel: "Autonomous Assistance",
    color: "from-amber-600 to-orange-600",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "hover:border-amber-500/50",
    desc: "A modern hybrid RAG platform engineered to scale seamlessly across MSMEs, large industries, testing laboratories, and consumers.",
    badge: "Enterprise AI",
  },
];

const IMPACT_PILLARS = [
  {
    step: "01",
    icon: Zap,
    title: "Faster Access to Standards & Services",
    desc: "Users instantly discover applicable IS numbers, certification schemes, testing procedures, and official gazette notifications in sub-second queries.",
    badge: "Speed & Access",
  },
  {
    step: "02",
    icon: Search,
    title: "Improved Compliance & Transparency",
    desc: "Source-backed answers ensure manufacturers and importers clearly understand mandatory Quality Control Orders (QCOs) and test parameters.",
    badge: "Governance",
  },
  {
    step: "03",
    icon: Clock,
    title: "Reduced Manual Work & Delays",
    desc: "Automated clause retrieval and intelligent document parsing eliminate weeks of manual document review and administrative bottlenecking.",
    badge: "Productivity",
  },
  {
    step: "04",
    icon: Building2,
    title: "Empowered Industries & Consumers",
    desc: "MSMEs gain equal access to regulatory knowledge, while citizens can effortlessly verify ISI marks, check HUID codes, and file complaints.",
    badge: "Empowerment",
  },
  {
    step: "05",
    icon: Scale,
    title: "Supports Make in India & Digital India",
    desc: "Fosters quality manufacturing benchmarks, bolsters ease of doing business, and democratizes standards knowledge across the nation.",
    badge: "National Impact",
  },
];

const BENEFICIARIES = [
  {
    id: "industries",
    icon: Building2,
    title: "Industries & Manufacturers",
    subtitle: "Enterprise & Factory Compliance",
    color: "from-blue-600 to-indigo-600",
    desc: "Quickly understand applicable standards, certification requirements, testing protocols, and product-related BIS compliances.",
    benefits: [
      "Faster Indian Standards discovery & clause lookup",
      "End-to-end Scheme-I & FMCS certification guidance",
      "Clear mandatory Quality Control Order (QCO) timelines",
      "Reduced regulatory research overhead and delays",
      "Elevated quality benchmark & export readiness",
    ],
    ctaText: "Explore Standards Catalog",
    ctaLink: "/standards",
  },
  {
    id: "msmes",
    icon: Rocket,
    title: "MSMEs & Startups",
    subtitle: "Affordable Quality Adoption",
    color: "from-purple-600 to-pink-600",
    desc: "Make BIS standards and compliance pathways accessible, understandable, and cost-effective for emerging startups and small businesses.",
    benefits: [
      "Plain-language explanations of complex standards",
      "Fee calculators & step-by-step grant roadmaps",
      "Compulsory Registration Scheme (CRS) guidance",
      "Dismantles bureaucratic information barriers",
      "Accelerated go-to-market & product launching",
    ],
    ctaText: "Ask BIS AI Copilot",
    ctaLink: "/assistant",
  },
  {
    id: "consumers",
    icon: Users,
    title: "Consumers & Citizens",
    subtitle: "Product Safety & Rights",
    color: "from-emerald-600 to-teal-600",
    desc: "Help citizens verify genuine ISI marks, check gold & silver 6-character HUID hallmarking, and easily report fake or defective products.",
    benefits: [
      "Instant 7-digit CM/L licence verification",
      "Laser-etched 6-digit HUID hallmark authenticity checker",
      "Awareness of mandatory product safety standards",
      "Guided 6-step complaint filing with live tracking",
      "24x7 guidance in 11 native Indian languages",
    ],
    ctaText: "Verify a Product",
    ctaLink: "/product-verification",
  },
  {
    id: "officials",
    icon: Landmark,
    title: "BIS Officials & Regulators",
    subtitle: "Administrative Efficiency",
    color: "from-amber-600 to-orange-600",
    desc: "Support faster information retrieval, regulatory consistency, automated document analysis, and responsive citizen service delivery.",
    benefits: [
      "Rapid cross-standard clause referencing",
      "Automated PDF circular parsing & summary generator",
      "Centralized complaint categorization & analytics",
      "Substantial reduction in repetitive public enquiries",
      "Data-driven quality enforcement telemetry",
    ],
    ctaText: "Explore Admin Dashboard",
    ctaLink: "/admin",
  },
];

const STORY_STEPS = [
  {
    step: "1. ASK",
    title: "Citizen or Business Query",
    example: '"Is ISI mark mandatory for electric immersion water heaters?"',
    color: "bg-blue-600 text-white",
  },
  {
    step: "2. UNDERSTAND",
    title: "AI Detects Intent & Entities",
    example: "Identifies Electrical Appliances, Safety Standard (IS 302-2-201), and Mandatory QCO Order.",
    color: "bg-indigo-600 text-white",
  },
  {
    step: "3. SEARCH",
    title: "Hybrid Knowledge Retrieval",
    example: "Scans 7,000+ IS standards, Gazette orders, and CM/L database via pgvector + FTS5.",
    color: "bg-purple-600 text-white",
  },
  {
    step: "4. ANALYZE",
    title: "Extracts Mandatory Clauses",
    example: "Pinpoints Clause 7 (Marking), Clause 8 (Protection against electric shock), and licence rules.",
    color: "bg-amber-600 text-white",
  },
  {
    step: "5. ANSWER",
    title: "Source-Backed Guidance",
    example: "Delivers direct answer, plain explanation, official citations, and 'Why this answer?' drawer.",
    color: "bg-emerald-600 text-white",
  },
  {
    step: "6. ACTION",
    title: "Empowered Next Steps",
    example: "User clicks [Verify Licence], applies for certification, or reports an uncertified unit.",
    color: "bg-rose-600 text-white",
  },
];

export function OutcomesAndImpactSection() {
  const [activeTab, setActiveTab] = useState<"after" | "before">("after");

  return (
    <section className="space-y-16 md:space-y-24">
      {/* SECTION HEADER */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Measurable Transformation &amp; Value Proposition</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Expected Outcomes &amp; Impact
        </h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          How BIS AI Copilot modernizes the discovery, compliance, and enforcement of Indian Standards—delivering high-efficiency outcomes across businesses, citizens, and regulators.
        </p>
      </div>

      {/* 1. MEASURABLE SUCCESS METRICS DASHBOARD STRIP */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Projected Performance Benchmarks
            </span>
            <h3 className="text-lg font-extrabold text-white">
              Target Success &amp; Efficiency Metrics
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 italic">
            *Target/expected outcomes; actual metrics evolve with enterprise deployment.
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">70%*</div>
            <div className="text-xs font-bold text-slate-200">Target Time Saving</div>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5 text-emerald-400">
              <TrendingDown className="w-3 h-3" /> Search Latency
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-blue-400">&lt; 1.2s</div>
            <div className="text-xs font-bold text-slate-200">AI Response Speed</div>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5 text-blue-300">
              <Zap className="w-3 h-3" /> Sub-second RAG
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
            <div className="text-xs font-bold text-slate-200">Source Grounding</div>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5 text-emerald-300">
              <ShieldCheck className="w-3 h-3" /> Official Gazette Citations
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-purple-400">11</div>
            <div className="text-xs font-bold text-slate-200">Indian Languages</div>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5 text-purple-300">
              <TrendingUp className="w-3 h-3" /> Inclusive Reach
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1 col-span-2 md:col-span-1">
            <div className="text-2xl sm:text-3xl font-black text-sky-400">7,000+</div>
            <div className="text-xs font-bold text-slate-200">Standards Indexed</div>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5 text-sky-300">
              <TrendingUp className="w-3 h-3" /> IS Catalog
            </span>
          </div>
        </div>
      </div>

      {/* 2. PART 1 — EXPECTED OUTCOMES CARDS */}
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Target className="w-4 h-4" />
            <span>Part 1 • Expected Outcomes</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Making BIS Information Faster, Simpler &amp; More Accessible
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered to overcome manual search friction, reduce compliance costs, and democratize standards intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OUTCOME_METRICS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 ${item.borderColor} hover:shadow-lg hover:-translate-y-1 transition duration-300 group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition duration-300`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black ${item.textColor}`}>
                        {item.stat}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {item.statLabel}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                      {item.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Target Outcome</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 italic text-center">
          *Target/expected outcome; actual performance depends on implementation environment, query specificity, and user workflow.
        </p>
      </div>

      {/* 3. PART 2 — IMPACT & CONNECTED VALUE TIMELINE */}
      <div className="p-8 md:p-12 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            <span>Part 2 • Systemic Impact</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Transforming How India Discovers, Understands &amp; Uses Standards
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A progressive transformation from fragmented manual lookups to an integrated, AI-driven national standards ecosystem.
          </p>
        </div>

        {/* Connected Impact Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {IMPACT_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-md transition group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                      {pillar.step}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {pillar.badge}
                  </span>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition">
                    {pillar.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-blue-600">
                  <span>Impact Node</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PART 3 — WHO BENEFITS? (4 BENEFICIARY CARDS WITH CENTRAL AI HUB) */}
      <div className="space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>Part 3 • Multi-Stakeholder Ecosystem</span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Who Benefits from BIS AI Copilot?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            One intelligent copilot serving industries, startups, consumers, and regulators with tailored precision.
          </p>
        </div>

        {/* Central Hub Architecture Visual */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white text-center shadow-lg space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-blue-200">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Central Technology Hub</span>
          </div>
          <h4 className="text-xl md:text-2xl font-black tracking-tight">
            BIS AI COPILOT • The Unified Standards Core
          </h4>
          <p className="text-xs md:text-sm text-blue-100 max-w-2xl mx-auto">
            Connecting standards databases, testing laboratories, conformity schemes, and consumer protection into one intelligent conversational platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-semibold">🏭 Industries</span>
            <span className="text-blue-300">↔</span>
            <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-semibold">🚀 MSMEs &amp; Startups</span>
            <span className="text-blue-300">↔</span>
            <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-semibold">👥 Consumers</span>
            <span className="text-blue-300">↔</span>
            <span className="px-3 py-1 rounded-xl bg-white/15 text-xs font-semibold">🏛 Officials</span>
          </div>
        </div>

        {/* 4 Beneficiary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BENEFICIARIES.map((ben) => {
            const Icon = ben.icon;
            return (
              <div
                key={ben.id}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6 hover:border-blue-500/50 hover:shadow-xl transition"
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ben.color} text-white flex items-center justify-center shadow-md shrink-0`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {ben.subtitle}
                      </span>
                      <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {ben.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ben.desc}
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Key Capabilities &amp; Benefits:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {ben.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={ben.ctaLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-xs font-bold transition shadow-sm"
                  >
                    <span>{ben.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. BEFORE VS AFTER COMPARISON */}
      <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Paradigm Shift
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            From Manual Search to AI-Powered Guidance
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare the traditional manual regulatory research burden with the BIS AI Copilot streamlined experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BEFORE CARD */}
          <div className="p-6 md:p-8 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200 dark:border-rose-900/40">
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Traditional Approach
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                BEFORE
              </span>
            </div>

            <div className="space-y-3">
              {[
                { title: "Manual Search", desc: "Search across dozens of portal silos, PDFs, and circulars." },
                { title: "Complex Standard Identification", desc: "Manually decipher applicable IS numbers for a product." },
                { title: "Lengthy Document Reading", desc: "Read 100+ page gazettes to find specific test clauses." },
                { title: "High Research Delay", desc: "MSMEs struggle with weeks of regulatory ambiguity." },
                { title: "Unclear Source Tracing", desc: "Confusion over which amendment or order is current." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                      {item.title}
                    </strong>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="p-6 md:p-8 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-900/40">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                BIS AI Copilot Approach
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                AFTER
              </span>
            </div>

            <div className="space-y-3">
              {[
                { title: "Natural Language Chat", desc: "Ask questions naturally via Text, Speech, Image, or PDF." },
                { title: "Intent & Entity Recognition", desc: "AI automatically identifies product, IS code, and QCO order." },
                { title: "Sub-Second Retrieval", desc: "Hybrid semantic vector + keyword search scans 7,000+ standards." },
                { title: "Synthesized & Grounded Answer", desc: "Direct answers with official gazette and clause citations." },
                { title: "One-Click Next Steps", desc: "Instant verification, complaint wizard, and fee guidance." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                      {item.title}
                    </strong>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. IMPACT STORY FLOW */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            User Journey Story
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            How a Query Becomes Authoritative Action
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {STORY_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2 shadow-xs"
            >
              <div className="space-y-1">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${step.color}`}>
                  {step.step}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 italic leading-snug">
                  {step.example}
                </p>
              </div>
              <div className="text-[10px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1">
                Step {idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. HIGHLIGHTED BANNER — KEY VALUE PROPOSITION */}
      <div className="p-8 md:p-14 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white shadow-2xl space-y-6 text-center">
        <div className="space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Unified Value Proposition
          </span>
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
            ONE PLATFORM. MULTIPLE STAKEHOLDERS. <br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              FASTER ACCESS TO TRUSTED BIS INFORMATION.
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            From standards discovery to product verification, the BIS AI Copilot brings AI-powered search, source-backed answers, and consumer guidance into one accessible platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/assistant"
            className="px-8 py-3.5 rounded-2xl bg-white text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:bg-slate-100 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Ask BIS AI</span>
          </Link>
          <Link
            href="/product-verification"
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg transition flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>Verify Product</span>
          </Link>
          <Link
            href="/about"
            className="px-6 py-3.5 rounded-2xl bg-black/30 hover:bg-black/40 text-slate-200 font-bold text-xs sm:text-sm border border-white/20 transition"
          >
            Explore How It Works
          </Link>
        </div>

        {/* Final Message */}
        <div className="pt-6 border-t border-white/10 max-w-xl mx-auto text-xs text-blue-200">
          <strong className="text-white block font-bold mb-1">
            Making BIS knowledge accessible to everyone.
          </strong>
          <span>
            Whether you are a manufacturer, startup, consumer or BIS stakeholder, BIS AI Copilot helps you find relevant information faster, understand it clearly, and take the right next step.
          </span>
        </div>
      </div>
    </section>
  );
}
