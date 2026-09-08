"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  Tag,
  Copy,
  Check,
  Bot,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { standardsApi } from "@/lib/api/standards";
import {
  ISLookupResponseData,
  ISStandardRecord,
  ISCloseMatchRecord,
} from "@/types/is_lookup";
import { useToast } from "@/components/common/Toast";

const SAMPLE_STANDARDS = [
  { is_number: "IS 1910-6:1993", desc: "Chemical / Rubber Products" },
  { is_number: "IS 356-3:1990", desc: "Mechanical / Bearings" },
  { is_number: "IS 3790-6:2017", desc: "Medical / Diagnostic Reagents" },
  { is_number: "IS 1258-3:1990", desc: "Production / Fire Extinguishers" },
  { is_number: "IS 4044-4:2013", desc: "Civil / Bitumen for Roads" },
  { is_number: "IS 2989-4:1999", desc: "Electronics / Smart Card Readers" },
  { is_number: "IS 801-4:2007", desc: "Electrotechnical / Circuit Breakers" },
  { is_number: "IS 1754:2008", desc: "Food & Agri / Milk Products" },
];

export function ISLookupSection() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ISLookupResponseData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { success: toastSuccess, error: toastError } = useToast();

  const handleLookup = async (searchVal?: string) => {
    const term = (searchVal !== undefined ? searchVal : query).trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    try {
      const res = await standardsApi.lookupISNumber(term);
      setResult(res);
      if (res.match_type === "none") {
        // No match found
      }
    } catch (err: any) {
      setError(
        err?.message || "Failed to search standard. Please check the connection."
      );
      toastError("Failed to lookup standard.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup();
  };

  const handleSampleClick = (sampleIS: string) => {
    setQuery(sampleIS);
    handleLookup(sampleIS);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toastSuccess(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("active")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Active
        </span>
      );
    }
    if (s.includes("revision")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" />
          Under Revision
        </span>
      );
    }
    if (s.includes("withdrawn")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          Withdrawn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Container Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-white shadow-xl border border-slate-700/60">
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            BIS Know Your Standards — Real-Time Lookup
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Find Complete Specifications by IS Number
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Enter any Bureau of Indian Standards identifier (e.g.{" "}
            <code className="text-amber-300 font-mono font-semibold">
              IS 1910-6:1993
            </code>
            , <code className="text-amber-300 font-mono">1910-6</code>, or{" "}
            <code className="text-amber-300 font-mono">IS 356</code>). The engine
            instantly retrieves official titles, sectional divisions, notification years,
            ICS codes, statuses, applicability, and full scope.
          </p>

          {/* Search Input Bar */}
          <form onSubmit={handleSubmit} className="pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter IS Number (e.g., IS 1910-6:1993, is 1910 6 1993, 1910-6, IS 356)..."
                className="w-full pl-12 pr-28 py-3.5 text-base rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500 shadow-inner"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-28 p-1 text-slate-400 hover:text-white"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching</span>
                  </>
                ) : (
                  <>
                    <span>Lookup</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sample quick picks */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium">Quick Try:</span>
            {SAMPLE_STANDARDS.map((s) => (
              <button
                key={s.is_number}
                type="button"
                onClick={() => handleSampleClick(s.is_number)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/80 text-slate-300 font-mono text-[11px] transition-colors"
              >
                {s.is_number}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State Skeleton */}
      {loading && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
          </div>
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl"
              />
            ))}
          </div>
          <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Lookup Error</h4>
            <p className="text-xs mt-0.5">{error}</p>
            <button
              onClick={() => handleLookup()}
              className="mt-2 text-xs font-semibold underline hover:no-underline"
            >
              Retry search
            </button>
          </div>
        </div>
      )}

      {/* Result Display */}
      {!loading && result && (
        <div className="space-y-6">
          {/* Match Status Banner */}
          <div
            className={`flex items-center justify-between p-3.5 px-4 rounded-xl text-xs font-medium border ${
              result.match_type === "exact"
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                : result.match_type === "partial"
                ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.match_type === "exact" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : result.match_type === "partial" ? (
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-400" />
              )}
              <span>{result.message}</span>
            </div>
            {result.normalized_query && (
              <span className="font-mono text-[11px] opacity-75 hidden sm:inline">
                Normalized: {result.normalized_query}
              </span>
            )}
          </div>

          {/* Exact Match Card */}
          {result.exact_match && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden transition-all hover:border-amber-500/40">
              {/* Card Header */}
              <div className="p-6 md:p-7 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {result.exact_match.is_number}
                    </span>
                    {renderStatusBadge(result.exact_match.status)}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {result.exact_match.section}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {result.exact_match.title}
                  </h3>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() =>
                      handleCopy(result.exact_match!.is_number, "IS Number")
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {copiedField === "IS Number" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy IS</span>
                  </button>

                  <Link
                    href={`/chat?q=${encodeURIComponent(
                      `What are the technical requirements and testing specifications in ${result.exact_match.is_number}?`
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI Copilot</span>
                  </Link>
                </div>
              </div>

              {/* Grid Metadata details */}
              <div className="p-6 md:p-7 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Sectional Division
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {result.exact_match.section}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Year Notified
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {result.exact_match.year_notified || "N/A"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      ICS Code
                    </span>
                    <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {result.exact_match.ics_code || "N/A"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Standard Status
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {result.exact_match.status}
                    </span>
                  </div>
                </div>

                {/* Applicable To */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    Applicable To (Product / Domain Category)
                  </span>
                  <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-amber-200 font-medium text-sm">
                    {result.exact_match.applicable_to || "General Standard Specification"}
                  </div>
                </div>

                {/* Scope Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Scope & Coverage Description
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {result.exact_match.scope_description ||
                      "Detailed scope specification under BIS technical committee mandates."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Close / Related Matches Section */}
          {result.close_matches && result.close_matches.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {result.exact_match
                      ? "Related Parts & Editions in this Standard Family"
                      : `Close & Partial Matches (${result.close_matches.length})`}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Select any standard to inspect
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {result.close_matches.map((cm: ISCloseMatchRecord, idx: number) => (
                  <div
                    key={`${cm.standard.is_number}-${idx}`}
                    onClick={() => {
                      setQuery(cm.standard.is_number);
                      handleLookup(cm.standard.is_number);
                    }}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                          {cm.standard.is_number}
                        </span>
                        {renderStatusBadge(cm.standard.status)}
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                        {cm.standard.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        Applicable to: {cm.standard.applicable_to || "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {cm.match_reason}
                      </span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Match Empty State */}
          {result.match_type === "none" && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No Standard Found for &quot;{result.query}&quot;
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try searching with just the base number (e.g.{" "}
                <button
                  type="button"
                  onClick={() => handleSampleClick("IS 1910")}
                  className="text-amber-500 underline font-mono"
                >
                  IS 1910
                </button>{" "}
                or{" "}
                <button
                  type="button"
                  onClick={() => handleSampleClick("IS 356")}
                  className="text-amber-500 underline font-mono"
                >
                  IS 356
                </button>
                ) or check for typos in the IS number.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
