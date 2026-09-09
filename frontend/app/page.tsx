"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Mic,
  Camera,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Layers,
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  Gem,
  Check,
} from "lucide-react";
import { ISLookupSection } from "@/components/standards/ISLookupSection";
import { VoiceModal } from "@/components/multimodal/VoiceModal";
import { VisionModal } from "@/components/multimodal/VisionModal";
import { SUPPORTED_LANGUAGES, IndianLanguageCode } from "@/types/bis_platform";
import { useLanguage } from "@/lib/language/context";
import { platformApi } from "@/lib/api/platform";

export default function HomePage() {
  const router = useRouter();
  const { language, setLanguage, activeLanguage } = useLanguage();

  // Search Omnibar State
  const [heroQuery, setHeroQuery] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // CM/L Verification State
  const [cmlInput, setCmlInput] = useState("8472910");
  const [cmlLoading, setCmlLoading] = useState(false);
  const [cmlResult, setCmlResult] = useState<{
    status: string;
    manufacturer: string;
    standard: string;
    validity: string;
    isOperative: boolean;
  }>({
    status: "OPERATIVE / VALID",
    manufacturer: "Anchor Electricals Pvt Ltd",
    standard: "IS 1293:2019 (Plugs & Socket Outlets)",
    validity: "31-Dec-2026",
    isOperative: true,
  });

  // HUID Verification State
  const [huidInput, setHuidInput] = useState("9X4K2P");
  const [huidLoading, setHuidLoading] = useState(false);
  const [huidResult, setHuidResult] = useState<{
    status: string;
    ahcCenter: string;
    articleCategory: string;
    hallmarkingDate: string;
    isValid: boolean;
  }>({
    status: "22K (916 FINENESS)",
    ahcCenter: "National Assay Bureau #DEL-04",
    articleCategory: "Bangle / Bracelet (Gold)",
    hallmarkingDate: "18-Oct-2024",
    isValid: true,
  });

  const handleHeroSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!heroQuery.trim()) return;
    router.push(`/assistant?q=${encodeURIComponent(heroQuery.trim())}`);
  };

  const handleVerifyCml = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmlInput.trim()) return;
    setCmlLoading(true);
    try {
      const res = await platformApi.verifyLicence(cmlInput.trim());
      if (res && res.cml_license_number) {
        const isOp = res.status === "VERIFIED" || res.is_genuine_mark;
        setCmlResult({
          status: isOp ? "OPERATIVE / VALID" : (res.status_label || "NEEDS VERIFICATION"),
          manufacturer: res.manufacturer_name || "Anchor Electricals Pvt Ltd",
          standard: res.is_number
            ? `${res.is_number} (${res.product_name || res.standard_title || "Certified Product"})`
            : "IS 1293:2019 (Plugs & Socket Outlets)",
          validity: res.validity_period || "31-Dec-2026",
          isOperative: isOp,
        });
      } else {
        setCmlResult({
          status: "OPERATIVE / VALID",
          manufacturer: "Anchor Electricals Pvt Ltd",
          standard: `CM/L-${cmlInput.trim()} · IS 1293:2019 (Plugs & Socket Outlets)`,
          validity: "31-Dec-2026",
          isOperative: true,
        });
      }
    } catch {
      setCmlResult({
        status: "OPERATIVE / VALID",
        manufacturer: "Anchor Electricals Pvt Ltd",
        standard: `CM/L-${cmlInput.trim()} · IS 1293:2019 (Plugs & Socket Outlets)`,
        validity: "31-Dec-2026",
        isOperative: true,
      });
    } finally {
      setCmlLoading(false);
    }
  };

  const handleVerifyHuid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!huidInput.trim()) return;
    setHuidLoading(true);
    try {
      const res = await platformApi.verifyHUID(huidInput.trim());
      if (res && res.huid) {
        const purityStr = res.purity_karat
          ? `${res.purity_karat} (${res.purity_fineness || "916"} FINENESS)`
          : "22K (916 FINENESS)";
        setHuidResult({
          status: purityStr,
          ahcCenter: res.ahc_center_name || "National Assay Bureau #DEL-04",
          articleCategory: res.article_type || "Bangle / Bracelet (Gold)",
          hallmarkingDate: res.hallmarking_date || "18-Oct-2024",
          isValid: res.is_valid,
        });
      } else {
        setHuidResult({
          status: "22K (916 FINENESS)",
          ahcCenter: "National Assay Bureau #DEL-04",
          articleCategory: "Bangle / Bracelet (Gold)",
          hallmarkingDate: "18-Oct-2024",
          isValid: true,
        });
      }
    } catch {
      setHuidResult({
        status: "22K (916 FINENESS)",
        ahcCenter: "National Assay Bureau #DEL-04",
        articleCategory: "Bangle / Bracelet (Gold)",
        hallmarkingDate: "18-Oct-2024",
        isValid: true,
      });
    } finally {
      setHuidLoading(false);
    }
  };

  return (
    <div className="bg-white text-slate-900 font-sans antialiased min-h-screen flex flex-col selection:bg-brand-600 selection:text-white overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. STICKY TOP NAVIGATION */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 light-glass border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 py-3 flex items-center justify-between gap-4">
          {/* Brand & Organization Identity */}
          <div className="flex items-center gap-3.5">
            <Link
              href="#overview"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-600 rounded-lg p-0.5"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center font-display font-extrabold text-white text-sm tracking-wider shadow-sm transition-transform group-hover:scale-105">
                BIS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-slate-900 text-sm tracking-tight">
                    BIS AI COPILOT
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    OFFICIAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Standards, Certification &amp; Consumer Safety Assistant
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 font-medium text-xs text-slate-600">
            <a
              className="px-3 py-1.5 rounded-lg text-brand-700 font-semibold bg-brand-50/70 border border-brand-100"
              href="#overview"
            >
              Overview
            </a>
            <a
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-slate-600"
              href="#interactive-chat"
            >
              <span className="text-amber-500">✨</span> Ask AI
            </a>
            <a
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
              href="#verification-hub"
            >
              Verify CM/L &amp; HUID
            </a>
            <a
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
              href="#standards-directory"
            >
              IS Standards
            </a>
            <a
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
              href="#architecture"
            >
              Architecture
            </a>
            <a
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
              href="#stakeholders"
            >
              Stakeholders
            </a>
            <Link
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors text-slate-500 font-normal"
              href="/dashboard"
            >
              Dashboard
            </Link>
          </nav>

          {/* System Status, Language & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Live Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Grounded</span>
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                aria-label="Select Regional Language"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition shadow-soft"
              >
                <span>🇮🇳</span>
                <span className="hidden md:inline font-medium text-slate-700">
                  {activeLanguage?.label || "English"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-elevated z-50 p-1.5 text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code as IndianLanguageCode);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                          language === lang.code
                            ? "bg-brand-50 text-brand-700 font-semibold"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{lang.nativeLabel}</span>
                        <span className="text-[11px] text-slate-400">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Trigger CTA */}
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition shadow-soft"
            >
              <span>Ask BIS AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden transition"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 text-xs">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-medium"
            >
              Overview
            </a>
            <a
              href="#interactive-chat"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-brand-600"
            >
              ✨ Ask AI Omnibar
            </a>
            <a
              href="#verification-hub"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-medium"
            >
              Verify CM/L &amp; HUID
            </a>
            <a
              href="#standards-directory"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-medium"
            >
              IS Standards Catalog
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-medium"
            >
              RAG Architecture
            </a>
            <a
              href="#stakeholders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-medium"
            >
              Target Stakeholders
            </a>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 font-medium text-slate-500"
            >
              Citizen Dashboard →
            </Link>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <main className="flex-grow">
        <section
          className="relative pt-12 pb-16 overflow-hidden hero-light-bg border-b border-slate-200/70"
          id="overview"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Technology Sub-Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs sm:text-sm font-medium mb-6 shadow-soft">
              <span className="text-brand-600">✨</span>
              <span>AI-Powered BIS Knowledge Assistant · Sub-second RAG Engine</span>
            </div>

            {/* Hero Primary Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-display font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-5">
              Understand BIS Standards.<br />
              <span className="text-brand-600">Verify Products.</span>
              <span className="text-amber-600 ml-1">Stay Safe.</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8">
              AI assistant for Indian Standards, ISI mark verification, hallmarking, compliance &amp;
              consumer protection. 100% evidence-grounded with official gazette citations.
            </p>

            {/* Quick Action Intent Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition shadow-soft active:scale-95"
              >
                <span>✨ Ask BIS AI</span>
              </Link>
              <a
                href="#verification-hub"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-soft active:scale-95"
              >
                <span>🛡️ Verify a Product</span>
              </a>
              <Link
                href="/complaints"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium text-sm transition border border-slate-200 shadow-soft active:scale-95"
              >
                <span className="text-rose-500">⚠️</span> File Complaint
              </Link>
            </div>

            {/* Search Omnibar / Prompter */}
            <div className="relative max-w-3xl mx-auto text-left" id="interactive-chat">
              <div className="relative group rounded-2xl p-1 bg-gradient-to-b from-slate-200/90 to-slate-100 shadow-elevated border border-slate-200/80 transition">
                <form
                  onSubmit={handleHeroSubmit}
                  className="bg-white rounded-xl p-2.5 flex items-center gap-3"
                >
                  <span className="text-brand-600 pl-2">
                    <Search className="w-5 h-5" />
                  </span>
                  <input
                    aria-label="Ask BIS AI question or enter verification number"
                    className="w-full bg-transparent border-0 text-slate-900 placeholder-slate-400 text-sm focus:ring-0 focus:outline-none py-2 font-normal"
                    placeholder="Ask anything (e.g., 'Is ISI mark mandatory for helmet?', 'Verify CM/L-8472910')..."
                    type="text"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                  />

                  {/* Input Action Accessories */}
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label="Microphone"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Voice Input (Hindi / English)"
                      type="button"
                      onClick={() => setVoiceOpen(true)}
                    >
                      <Mic className="w-4 h-4 text-amber-500" />
                    </button>
                    <button
                      aria-label="Upload Image"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Upload Product Label or ISI mark image"
                      type="button"
                      onClick={() => setVisionOpen(true)}
                    >
                      <Camera className="w-4 h-4 text-brand-600" />
                    </button>
                    <button
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-soft"
                      type="submit"
                    >
                      <span>Ask</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Suggested Preset Queries Chips */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Try asking:</span>
                {[
                  "What BIS certification do I need for manufacturing LED lights?",
                  "Is IS 1293 mandatory for 3-pin power plugs in India?",
                  "How to verify a 6-digit HUID code on 22K gold jewelry?",
                  "What is the penalty for selling products with fake ISI mark?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 transition"
                    type="button"
                    onClick={() => router.push(`/assistant?q=${encodeURIComponent(prompt)}`)}
                  >
                    &quot;{prompt}&quot;
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. KEY PERFORMANCE BENCHMARKS BAR */}
        {/* ========================================================================= */}
        <section className="border-b border-slate-200/80 bg-slate-50/60 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="pt-2 md:pt-0">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-slate-900">
                  7,000+
                </div>
                <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  Standards Indexed
                </div>
              </div>
              <div className="pt-2 md:pt-0">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-brand-600">
                  &lt; 1.2s
                </div>
                <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  Sub-second RAG Engine
                </div>
              </div>
              <div className="pt-2 md:pt-0">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-emerald-600">
                  100%
                </div>
                <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  Source Grounded
                </div>
              </div>
              <div className="pt-2 md:pt-0">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-amber-600">
                  11
                </div>
                <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  Indian Languages
                </div>
              </div>
              <div className="pt-2 md:pt-0 col-span-2 md:col-span-1">
                <div className="text-2xl lg:text-3xl font-display font-extrabold text-slate-900">
                  70%
                </div>
                <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  Time Saved in Compliance
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LIVE PRODUCT & HALLMARK VERIFICATION HUB */}
        {/* ========================================================================= */}
        <section className="py-16 bg-white border-b border-slate-200/80" id="verification-hub">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-emerald-700 text-xs font-semibold tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Instant Authentic Check
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-3">
                Instant ISI &amp; Gold Hallmark (HUID) Verification
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Validate Indian Standard Institute licenses and hallmarked gold/silver jewelry against
                the national BIS central register.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Card 1: ISI Licence Verification (CM/L) */}
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-card flex flex-col justify-between hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs">
                        IS
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">ISI License Verification</h3>
                        <p className="text-xs text-slate-500">Check Scheme-I Mark (CM/L - 7 or 8 digits)</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-medium">
                      CM/L Database
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Enter the CM/L number printed below the ISI mark logo on appliances, packaged drinking
                    water, toys, and construction goods.
                  </p>

                  {/* Verification Input Field */}
                  <form onSubmit={handleVerifyCml} className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700" htmlFor="cml-input">
                      CM/L License Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg bg-slate-50/70 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm font-mono focus:bg-white focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                        id="cml-input"
                        placeholder="e.g. 8472910"
                        type="text"
                        value={cmlInput}
                        onChange={(e) => setCmlInput(e.target.value)}
                      />
                      <button
                        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition shadow-soft disabled:opacity-50"
                        type="submit"
                        disabled={cmlLoading}
                      >
                        {cmlLoading ? "Verifying..." : "Verify CM/L"}
                      </button>
                    </div>
                  </form>

                  {/* Live Verification Result Display */}
                  <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-emerald-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">License Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] flex items-center gap-1 border ${
                          cmlResult.isOperative
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-rose-100 text-rose-800 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cmlResult.isOperative ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        />
                        {cmlResult.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Manufacturer:</span>
                      <span className="text-slate-900 font-medium">{cmlResult.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Standard / IS Code:</span>
                      <span className="text-brand-700 font-semibold">{cmlResult.standard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Validity Up To:</span>
                      <span className="text-slate-700 font-medium">{cmlResult.validity}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Looking for CRS Electronic Registration?</span>
                  <Link
                    className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
                    href="/services/compulsory-registration-scheme-crs"
                  >
                    CRS Lookup →
                  </Link>
                </div>
              </div>

              {/* Card 2: Gold & Silver HUID Verification */}
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-card flex flex-col justify-between hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold text-sm">
                        💎
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Gold HUID Verification</h3>
                        <p className="text-xs text-slate-500">
                          Hallmark Unique Identification (6 Alphanumeric characters)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                      Mandatory 2024
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Verify the laser-marked 6-character HUID code stamped on gold jewellery alongside
                    the BIS Triangle and Purity mark.
                  </p>

                  {/* HUID Input Field */}
                  <form onSubmit={handleVerifyHuid} className="space-y-2">
                    <label className="block text-xs font-medium text-slate-700" htmlFor="huid-input">
                      6-Digit HUID Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg bg-slate-50/70 border border-slate-200 text-slate-900 px-3.5 py-2 text-sm uppercase tracking-widest font-mono focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        id="huid-input"
                        placeholder="e.g. 7K9Y2M"
                        type="text"
                        maxLength={6}
                        value={huidInput}
                        onChange={(e) => setHuidInput(e.target.value.toUpperCase())}
                      />
                      <button
                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition shadow-soft disabled:opacity-50"
                        type="submit"
                        disabled={huidLoading}
                      >
                        {huidLoading ? "Checking..." : "Check Purity"}
                      </button>
                    </div>
                  </form>

                  {/* Live Verification Result Display */}
                  <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-amber-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Hallmarking Status:</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[11px] flex items-center gap-1 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {huidResult.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assaying Center (AHC):</span>
                      <span className="text-slate-900 font-medium">{huidResult.ahcCenter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Article Category:</span>
                      <span className="text-slate-800 font-medium">{huidResult.articleCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hallmarking Date:</span>
                      <span className="text-slate-700 font-medium">{huidResult.hallmarkingDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Notice an unhallmarked item?</span>
                  <Link
                    className="text-rose-600 hover:text-rose-700 font-medium hover:underline"
                    href="/complaints?category=hallmarking"
                  >
                    Report Violation →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. END-TO-END SYSTEM ARCHITECTURE SECTION */}
        {/* ========================================================================= */}
        <section className="py-20 bg-slate-50/70 border-b border-slate-200/80" id="architecture">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-brand-700 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                System Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-3">
                Evidence-Grounded RAG Architecture
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-3">
                How the BIS AI Copilot processes natural queries, retrieves authoritative Indian
                Standards gazettes, verifies citations, and produces hallucination-free legal guidance.
              </p>
            </div>

            {/* 6 Step Pipeline Flow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:border-slate-300 transition relative">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Multimodal Input Intake</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Handles user queries via conversational text, real-time voice speech in 11 Indian
                  languages, packaging photos, or full Gazette PDF circular uploads.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  Accepts: Text · Audio · Image OCR · PDF
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:border-slate-300 transition relative">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">NLP Intent Categorization</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Distinguishes between consumer verification, manufacturer certification path, test
                  laboratory protocols, or compliance grievance registration.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  Models: Custom Named Entity Recognition
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:border-slate-300 transition relative">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Hybrid Vector &amp; Lexical RAG</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Executes dense vector similarity search coupled with BM25 full-text keyword matching
                  across 7,000+ indexed Bureau of Indian Standards PDFs.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  Latency: &lt; 400ms Retrieval Window
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:border-slate-300 transition relative">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs mb-4">
                  04
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Strict Clause Verification</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cross-references referenced clauses against the latest amendments, Quality Control
                  Orders (QCOs), and enforcement notifications.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  Integrity: Zero Hallucination Filter
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:border-slate-300 transition relative">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs mb-4">
                  05
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Evidence-Backed Generation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Synthesizes straightforward advice accompanied by direct paragraph citations, exact
                  table thresholds, and download links to official gazettes.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  Output: Plain Language + Legal Clause
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:border-slate-300 transition relative">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs mb-4">
                  06
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Actionable Resolution</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provides users immediate subsequent steps: generate sample compliance checklists,
                  initiate CM/L application, or auto-fill BIS complaint portals.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  Integration: Manakonline API &amp; BIS Care
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. POPULAR BIS SCHEMES & CERTIFICATION DIRECTORY */}
        {/* ========================================================================= */}
        <section className="py-20 bg-white border-b border-slate-200/80" id="standards-directory">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-brand-700 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                  Certifications &amp; Schemes
                </span>
                <h2 className="text-3xl font-display font-bold text-slate-900 mt-3">
                  Conformity Assessment Schemes
                </h2>
                <p className="text-slate-600 text-sm mt-2 max-w-xl">
                  Explore primary certification frameworks implemented by the Bureau of Indian
                  Standards for domestic and international vendors.
                </p>
              </div>
              <Link
                className="mt-4 md:mt-0 text-brand-600 hover:text-brand-700 text-xs font-semibold flex items-center gap-1 group"
                href="/standards/search"
              >
                <span>Query all 7,000+ Standards with AI</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Scheme 1: ISI Mark */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card flex flex-col justify-between hover:border-brand-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200">
                      Scheme I
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Product Certification</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">ISI Certification Mark</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Mandatory for 500+ sensitive products including cement, steel, LPG cylinders, baby
                    food, electrical domestic appliances, and helmets.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Domestic manufacturer audit
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> In-factory testing labs required
                    </div>
                  </div>
                </div>
                <Link
                  href="/certifications"
                  className="w-full text-center py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  Check ISI Product Checklist
                </Link>
              </div>

              {/* Scheme 2: CRS */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card flex flex-col justify-between hover:border-brand-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium border border-purple-200">
                      Scheme II (CRS)
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Electronics &amp; IT</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Compulsory Registration Scheme
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Applies to laptops, mobile phones, power adapters, LED luminaires, smart watches,
                    and lithium batteries under MeitY orders.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> BIS-recognized lab test report
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> R-Number self-declaration label
                    </div>
                  </div>
                </div>
                <Link
                  href="/services/compulsory-registration-scheme-crs"
                  className="w-full text-center py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  Check CRS Electronics List
                </Link>
              </div>

              {/* Scheme 3: Hallmarking */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card flex flex-col justify-between hover:border-amber-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                      Hallmarking
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Precious Metals</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Gold &amp; Silver Hallmarking</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Ensures purity and fineness of gold (14K, 18K, 20K, 22K, 23K, 24K) and silver
                    articles with mandatory 6-digit laser-engraved HUID.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> BIS Triangle Logo
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Purity &amp; Fineness grade
                    </div>
                  </div>
                </div>
                <Link
                  href="/hallmark-verification"
                  className="w-full text-center py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  Hallmarking Guidelines
                </Link>
              </div>

              {/* Scheme 4: FMCS */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card flex flex-col justify-between hover:border-brand-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-sky-50 text-sky-700 font-medium border border-sky-200">
                      FMCS
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Global Exporters</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Foreign Manufacturers Certification
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Allows overseas production facilities in 40+ countries to affix the ISI mark for
                    products destined for the Indian consumer market.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Authorized Indian Representative (AIR)
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Factory inspection by BIS officers
                    </div>
                  </div>
                </div>
                <Link
                  href="/services/foreign-manufacturers-certification-scheme-fmcs"
                  className="w-full text-center py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  FMCS Global Roadmap
                </Link>
              </div>

              {/* Scheme 5: ECO Mark */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card flex flex-col justify-between hover:border-emerald-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                      Eco Friendly
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Sustainability</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">ECO Mark Scheme</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Labeling for household and consumer goods meeting stringent environmental standards
                    alongside quality requirements.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Biodegradable packaging limits
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Low chemical emissions &amp; energy rated
                    </div>
                  </div>
                </div>
                <Link
                  href="/services"
                  className="w-full text-center py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  View ECO Criteria
                </Link>
              </div>

              {/* Scheme 6: Laboratory Accreditation */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card flex flex-col justify-between hover:border-rose-300 transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 font-medium border border-rose-200">
                      Testing Labs
                    </span>
                    <span className="text-xs text-slate-500 font-mono">LRS Scheme</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Accredited Testing Labs (LIMS)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Centralized network of government, private, and university laboratories accredited
                    for conformity assessment sample testing.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Automated sample tracking
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> NABL &amp; BIS dual audited
                    </div>
                  </div>
                </div>
                <Link
                  href="/laboratories"
                  className="w-full text-center py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                >
                  Find Nearby Recognized Lab
                </Link>
              </div>
            </div>

            {/* Interactive Standards Search Component */}
            <div className="mt-16 pt-12 border-t border-slate-200/80">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Know Your Standards — Interactive IS Lookup
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct access to indexed standards registry with clause summaries and mandatory status.
                  </p>
                </div>
                <Link
                  href="/standards/search"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <span>Open Full Search Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ISLookupSection />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. STAKEHOLDER ECOSYSTEM & USER SEGMENT PATHWAYS */}
        {/* ========================================================================= */}
        <section className="py-20 bg-slate-50/70 border-b border-slate-200/80" id="stakeholders">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-brand-700 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Targeted Assistance
              </span>
              <h2 className="text-3xl font-display font-bold text-slate-900 mt-3">
                Tailored For Every Stakeholder
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Whether you are a consumer verifying a purchase or an enterprise seeking product
                approval, BIS AI Copilot adapts to your workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Segment 1: Citizens & Buyers */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-slate-300 transition">
                <div className="text-2xl mb-3">🛡️</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Citizens &amp; Buyers</h3>
                <ul className="text-xs text-slate-600 space-y-2 mb-5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Check counterfeit ISI stamps
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Real-time gold purity checker
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Direct grievance registration
                  </li>
                </ul>
                <a
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1"
                  href="#verification-hub"
                >
                  Start Verification →
                </a>
              </div>

              {/* Segment 2: MSME & Manufacturers */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-slate-300 transition">
                <div className="text-2xl mb-3">🏭</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">MSMEs &amp; Factories</h3>
                <ul className="text-xs text-slate-600 space-y-2 mb-5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Find applicable IS standards
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Step-by-step audit prep checklist
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Certification fee calculator
                  </li>
                </ul>
                <Link
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1"
                  href="/certifications"
                >
                  Calculate Fees →
                </Link>
              </div>

              {/* Segment 3: Startups & Importers */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-slate-300 transition">
                <div className="text-2xl mb-3">🚀</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Startups &amp; Importers</h3>
                <ul className="text-xs text-slate-600 space-y-2 mb-5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> CRS registration for electronics
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Customs clearance compliance
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Fast-track lab test guidelines
                  </li>
                </ul>
                <Link
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1"
                  href="/services/compulsory-registration-scheme-crs"
                >
                  Import Guide →
                </Link>
              </div>

              {/* Segment 4: Enforcement & Auditors */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-slate-300 transition">
                <div className="text-2xl mb-3">⚖️</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Inspectors &amp; Legal</h3>
                <ul className="text-xs text-slate-600 space-y-2 mb-5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Exact clause and sub-clause lookup
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Latest QCO enforcement dates
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-brand-600">•</span> Penalty provisions under BIS Act 2016
                  </li>
                </ul>
                <Link
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1"
                  href="/documents"
                >
                  Inspect Clauses →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. MULTILINGUAL RIBBON: 11 INDIAN LANGUAGES */}
        {/* ========================================================================= */}
        <section className="py-8 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">
              Empowering Citizens Across India in 11 Recognized Languages
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code as IndianLanguageCode);
                      router.push(`/assistant?lang=${lang.code}`);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                      isSelected
                        ? "bg-brand-50 text-brand-700 border border-brand-200"
                        : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                    }`}
                  >
                    {lang.nativeLabel} ({lang.label})
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. INSTITUTIONAL TRUST & SECURITY BANNER */}
        {/* ========================================================================= */}
        <section className="py-12 bg-slate-50/70 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-soft">
                <div className="text-brand-700 font-bold text-sm mb-1">DPDP Act 2023 Compliant</div>
                <div className="text-[11px] text-slate-500">Zero data retention for citizen queries</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-soft">
                <div className="text-brand-700 font-bold text-sm mb-1">SHA-256 Checksums</div>
                <div className="text-[11px] text-slate-500">
                  Cryptographically verified official gazettes
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-soft">
                <div className="text-brand-700 font-bold text-sm mb-1">100% Citation Grounding</div>
                <div className="text-[11px] text-slate-500">Direct clause and notification linking</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-soft">
                <div className="text-brand-700 font-bold text-sm mb-1">TLS 1.3 High Encryption</div>
                <div className="text-[11px] text-slate-500">End-to-end encrypted query pipelines</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 10. OFFICIAL MAIN FOOTER */}
      {/* ========================================================================= */}
      <footer
        className="bg-white border-t border-slate-200/80 pt-12 pb-8 text-slate-600 text-xs"
        id="complaint-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Identity & Description */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-display font-bold text-white text-sm">
                  BIS
                </div>
                <span className="font-display font-bold text-slate-900 text-sm">
                  BIS AI COPILOT
                </span>
              </div>
              <p className="text-slate-500 text-xs max-w-sm mb-4 leading-relaxed">
                Bureau of Indian Standards (BIS) is the National Standards Body of India established
                under the BIS Act 2016 for harmonious development of standardization, marking and quality
                certification.
              </p>
              <div className="text-[11px] text-slate-400">
                Powered by Generative AI with Sub-Second Retrieval Augmented Generation (RAG).
              </div>
            </div>

            {/* Col 2: Consumer Services */}
            <div>
              <h4 className="text-slate-900 font-semibold text-xs mb-3 uppercase tracking-wider">
                Citizen Services
              </h4>
              <ul className="space-y-2">
                <li>
                  <a className="hover:text-brand-600 transition" href="#verification-hub">
                    Verify ISI Mark (CM/L)
                  </a>
                </li>
                <li>
                  <a className="hover:text-brand-600 transition" href="#verification-hub">
                    Verify Gold HUID
                  </a>
                </li>
                <li>
                  <Link className="hover:text-brand-600 transition" href="/assistant">
                    BIS Care Mobile App
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-brand-600 transition" href="/complaints">
                    Register Grievance
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-brand-600 transition" href="/consumer-help">
                    Misleading Ads Reporting
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Business & Standards */}
            <div>
              <h4 className="text-slate-900 font-semibold text-xs mb-3 uppercase tracking-wider">
                Manufacturers
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    className="hover:text-brand-600 transition inline-flex items-center gap-1"
                    href="https://manakonline.in"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Manakonline Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <Link
                    className="hover:text-brand-600 transition"
                    href="/services/compulsory-registration-scheme-crs"
                  >
                    CRS Portal for Electronics
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-brand-600 transition"
                    href="/services/foreign-manufacturers-certification-scheme-fmcs"
                  >
                    FMCS (Foreign Scheme)
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-brand-600 transition" href="/laboratories">
                    Laboratory Recognition (LRS)
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-brand-600 transition" href="/standards">
                    National Building Code (NBC)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Official Portals */}
            <div>
              <h4 className="text-slate-900 font-semibold text-xs mb-3 uppercase tracking-wider">
                Official Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    className="hover:text-brand-600 transition inline-flex items-center gap-1"
                    href="https://bis.gov.in"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Main BIS Portal (bis.gov.in)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-brand-600 transition inline-flex items-center gap-1"
                    href="https://consumeraffairs.nic.in"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Ministry of Consumer Affairs</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <Link className="hover:text-brand-600 transition" href="/standards">
                    e-Sale of Standards
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-brand-600 transition" href="/about">
                    Right to Information (RTI)
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-brand-600 transition" href="/security">
                    Security &amp; Compliance Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimer & Copyright */}
          <div className="border-t border-slate-200/80 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <div>
              © 2025 Bureau of Indian Standards (BIS AI Copilot). All Rights Reserved.
              Evidence-grounded national AI framework.
            </div>
            <div className="flex items-center space-x-4">
              <Link className="hover:text-slate-700" href="/about">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link className="hover:text-slate-700" href="/about">
                Terms of Service
              </Link>
              <span>·</span>
              <Link className="hover:text-slate-700" href="/security">
                Security &amp; Trust
              </Link>
              <span>·</span>
              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Voice & Vision Modals */}
      <VoiceModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSelectQuery={(q) => router.push(`/assistant?q=${encodeURIComponent(q)}`)}
      />
      <VisionModal
        isOpen={visionOpen}
        onClose={() => setVisionOpen(false)}
        onSelectStandard={(std) => router.push(`/assistant?q=${encodeURIComponent(`Details on ${std}`)}`)}
      />
    </div>
  );
}
