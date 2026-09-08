"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Search,
  ExternalLink,
  Bot,
} from "lucide-react";

interface ViolationIssue {
  id: string;
  title: string;
  category: string;
  badgeColor: string;
  whatHappened: string;
  whatShouldYouDo: string[];
  requiredEvidence: string[];
  whereToReport: { name: string; url?: string; isOfficial?: boolean }[];
  aiPrompt: string;
}

const COMMON_ISSUES: ViolationIssue[] = [
  {
    id: "fake-isi",
    title: "Fake or Unauthorized ISI Mark on Product",
    category: "Misuse of Standard Mark",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    whatHappened: "A product carries the ISI mark but lacks a valid 7-digit CML licence number (CM/L-XXXXXXX), or the licence belongs to another manufacturer.",
    whatShouldYouDo: [
      "Do not use or install the product if it involves electrical, gas, or child safety.",
      "Verify the 7-digit CML number on the BIS Care Mobile App or the Manakonline portal.",
      "Keep the original purchase invoice and physical packaging intact.",
      "Lodge a formal complaint through the BIS AI Complaint Portal or BIS Enforcement Cell.",
    ],
    requiredEvidence: [
      "Clear photograph of the product packaging showing the fake ISI logo and markings.",
      "Cash memo / tax invoice from the retailer.",
      "Retailer name and store location details.",
    ],
    whereToReport: [
      { name: "BIS AI Online Grievance Wizard", url: "/complaints" },
      { name: "BIS Enforcement Cell (complaints@bis.gov.in)", isOfficial: true },
      { name: "National Consumer Helpline (1915)", isOfficial: true },
    ],
    aiPrompt: "How do I verify if an ISI mark CML license is authentic or fake?",
  },
  {
    id: "hallmark-issue",
    title: "Hallmark / Purity Dispute on Gold or Silver Jewelry",
    category: "Hallmarking Violation",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    whatHappened: "Purchased gold jewelry claimed to be 22K (916) or 18K (750), but it fails to show the 3 mandatory marks or tests lower in purity.",
    whatShouldYouDo: [
      "Verify the 6-character laser-etched HUID code on our Hallmarking Verifier.",
      "Take the article to any BIS-recognized Assaying & Hallmarking Centre (AHC) for testing (₹45 testing fee).",
      "If purity is lower, the jeweler is legally obligated under BIS Act to refund the difference plus compensation of 2x the shortfall.",
    ],
    requiredEvidence: [
      "Tax invoice mentioning the weight, karatage purity, and exact 6-digit HUID code.",
      "AHC testing lab report indicating purity discrepancy.",
    ],
    whereToReport: [
      { name: "Verify HUID on BIS AI", url: "/hallmarking" },
      { name: "File Hallmark Complaint on BIS AI", url: "/complaints" },
      { name: "BIS Hallmarking Department (hmd@bis.gov.in)", isOfficial: true },
    ],
    aiPrompt: "What are my rights if a jeweler sells underweight or sub-standard gold?",
  },
  {
    id: "defective-standard",
    title: "Product Under Mandatory QCO Fails Safety Tests",
    category: "Sub-Standard Quality",
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    whatHappened: "An appliance, helmet, toy, or electrical cable subject to a Mandatory Quality Control Order (QCO) malfunctioned or caused a hazard.",
    whatShouldYouDo: [
      "Immediately disconnect and cease usage of the hazardous product.",
      "Document the failure (take photographs or video evidence).",
      "Check the applicable Indian Standard (e.g. IS 4151 for Helmets, IS 9873 for Toys, IS 302 for Appliances).",
      "Submit a defect report to BIS Product Certification Branch.",
    ],
    requiredEvidence: [
      "Clear photos of the damaged/defective unit.",
      "Serial number, batch code, and manufacturing date.",
      "Purchase bill and warranty card.",
    ],
    whereToReport: [
      { name: "BIS AI Complaint Portal", url: "/complaints" },
      { name: "Consumer Affairs Central Portal (consumerhelpline.gov.in)", isOfficial: true },
    ],
    aiPrompt: "What products are covered under Mandatory BIS Quality Control Orders (QCO)?",
  },
  {
    id: "misleading-claim",
    title: "Misleading Certification or Eco-Mark Advertising",
    category: "Consumer Misrepresentation",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    whatHappened: "A company advertises that its product is 'BIS Approved' or 'Govt Certified' without possessing a valid standard mark or license.",
    whatShouldYouDo: [
      "Capture the screenshot or photograph of the promotional material/advertisement.",
      "Verify the company name in the BIS online licensee directory.",
      "Report misleading marketing to the Central Consumer Protection Authority (CCPA) and BIS.",
    ],
    requiredEvidence: [
      "URL / screenshot / printed advertisement.",
      "Product packaging with misleading claim.",
    ],
    whereToReport: [
      { name: "Report via BIS AI", url: "/complaints" },
      { name: "Central Consumer Protection Authority (CCPA)", isOfficial: true },
    ],
    aiPrompt: "Is it illegal to advertise a product as BIS certified when it is not?",
  },
];

export default function ConsumerHelpPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIssues = COMMON_ISSUES.filter((issue) => {
    const matchesCat = selectedCategory === "all" || issue.id === selectedCategory;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.whatHappened.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 md:p-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/20">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>BIS Consumer Protection & Grievance Cell</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Consumer Standards Help Center
          </h1>
          <p className="text-sm md:text-base text-blue-100/90 leading-relaxed">
            Guidance for Indian consumers facing sub-standard products, fake ISI marks, hallmark purity discrepancies, or deceptive certification claims.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/complaints"
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>File a Quality Complaint</span>
            </Link>
            <Link
              href="/assistant?q=What are my rights under the BIS Act 2016?"
              className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask BIS AI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search consumer issues..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            All Issues
          </button>
          {COMMON_ISSUES.map((iss) => (
            <button
              key={iss.id}
              onClick={() => setSelectedCategory(iss.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === iss.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {iss.category}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${issue.badgeColor}`}>
                  {issue.category}
                </span>
                <Link
                  href={`/assistant?q=${encodeURIComponent(issue.aiPrompt)}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ask AI</span>
                </Link>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {issue.title}
              </h3>

              {/* What happened */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <strong className="text-slate-900 dark:text-white font-bold block">
                  What Happened?
                </strong>
                <p>{issue.whatHappened}</p>
              </div>

              {/* What should you do */}
              <div className="space-y-2 text-xs">
                <strong className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What Should You Do?
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                  {issue.whatShouldYouDo.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Required evidence */}
              <div className="space-y-2 text-xs">
                <strong className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Required Evidence / Documents:
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                  {issue.requiredEvidence.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reporting Channels */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Where to Report:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {issue.whereToReport.map((ch, idx) =>
                  ch.url ? (
                    <Link
                      key={idx}
                      href={ch.url}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                    >
                      <span>{ch.name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                    >
                      {ch.name}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
