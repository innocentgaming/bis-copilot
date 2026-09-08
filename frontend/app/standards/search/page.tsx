"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Filter,
  Search,
  X,
  Sparkles,
  Layers,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
} from "lucide-react";
import { standardsApi } from "@/lib/api/standards";
import { StandardSummary } from "@/types/standards";
import { ISLookupSection } from "@/components/standards/ISLookupSection";

const SECTIONS = [
  "All Sections",
  "Chemical",
  "Civil Engineering",
  "Electronics and Information Technology",
  "Electrotechnical",
  "Food and Agriculture",
  "Mechanical Engineering",
  "Medical Equipment and Hospital Planning",
  "Metallurgical Engineering",
  "Petroleum/Coal and Related Products",
  "Textile",
  "Transport Engineering",
  "Water Resources",
  "Production and General Engineering",
  "Management and Systems",
];

function StandardsSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [qcoOnly, setQcoOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StandardSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await standardsApi.listStandards({
        search: searchQuery.trim() || undefined,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        limit: pageSize,
        offset: page * pageSize,
      });
      setResults(res.items);
      setTotal(res.total);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedStatus, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchResults();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/20">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>7,000+ Indian Standards Database</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          Smart Indian Standards Search
        </h1>
        <p className="text-xs md:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Filter by IS Number, sectional division, gazette year, mandatory QCO status, and technical clause specifications.
        </p>
      </div>

      {/* IS Number Lookup Engine Component */}
      <ISLookupSection />

      {/* Advanced Multi-Faceted Filter & Search Bar */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Faceted Standards Explorer</span>
          </h2>
          <span className="text-xs text-slate-400">
            Showing {total} standards in index
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, product name, or IS number (e.g. helmet, plug, steel, IS 1293)..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
            >
              Search Index
            </button>
          </div>

          {/* Facets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                Sectional Division
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                Standard Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Standards (Active & Revised)</option>
                <option value="active">Active Only</option>
                <option value="superseded">Under Revision / Superseded</option>
              </select>
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={qcoOnly}
                  onChange={(e) => setQcoOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Mandatory QCO Orders Only</span>
              </label>
            </div>
          </div>
        </form>

        {/* Results Grid */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Searching 7,000+ Indian Standards database...
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
              <p>No standards found matching your filter criteria. Try searching by IS Number or product name.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((std) => (
                <div
                  key={std.id}
                  className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-blue-500/40 hover:shadow-sm transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                        {std.standard_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          std.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {std.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {std.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <Link
                      href={`/standards/${std.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>View Standard</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      href={`/assistant?q=${encodeURIComponent(`Explain requirements in ${std.standard_number}: ${std.title}`)}`}
                      className="font-bold text-purple-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Ask AI</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
              <span>
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * pageSize >= total}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StandardsSearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Standards Search...</div>}>
      <StandardsSearchContent />
    </Suspense>
  );
}
