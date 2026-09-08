"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bot,
  Sparkles,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISFAQ } from "@/types/bis_platform";
import { Footer } from "@/components/layout/Footer";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<BISFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  const categories = [
    "All",
    "ISI Mark & Certification",
    "Compulsory Registration (CRS)",
    "Hallmarking",
    "Foreign Manufacturers",
    "Consumer Rights",
    "Laboratories & Testing",
    "MSME Concessions",
    "Quality Control Orders",
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await platformApi.listFAQs({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          search: search.trim() || undefined,
        });
        setFaqs(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, search]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <HelpCircle className="w-3.5 h-3.5" />
          Authoritative Knowledge Hub
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Find answers on Indian Standards, ISI licensing, compulsory registration, hallmarking, and consumer protection.
        </p>

        {/* Search */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs (e.g. ISI mark, HUID, fees, foreign certification)..."
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              selectedCategory === c
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    {faq.category}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-700 dark:text-slate-300 space-y-4 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                  <p>{faq.answer}</p>
                  <div className="flex items-center justify-between pt-2 text-[11px]">
                    {faq.related_standard && (
                      <span className="font-mono text-slate-400">
                        Related: {faq.related_standard}
                      </span>
                    )}
                    <Link
                      href={`/chat?q=${encodeURIComponent(faq.question)}`}
                      className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      Ask AI for Deep Dive
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
