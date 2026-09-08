"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, Filter, Search, X, Sparkles, Layers } from "lucide-react";
import { standardsApi } from "@/lib/api/standards";
import { StandardSummary } from "@/types/standards";
import { StandardCard } from "@/components/standards/StandardCard";
import { CardSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/common/Toast";
import { ISLookupSection } from "@/components/standards/ISLookupSection";

function StandardsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const tabParam = searchParams.get("tab") || "lookup";

  const { error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<"lookup" | "catalog">(
    tabParam === "catalog" ? "catalog" : "lookup"
  );
  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const fetchStandards = async () => {
    setLoading(true);
    try {
      const res = await standardsApi.listStandards({
        search: searchTerm.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: pageSize,
        offset: page * pageSize,
      });
      setStandards(res.items);
      setTotal(res.total);
    } catch {
      toastError("Failed to fetch Indian Standards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "catalog") {
      fetchStandards();
    }
  }, [activeTab, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchStandards();
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Know Your Standards (BIS)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official Bureau of Indian Standards specification search, IS Number lookup, and clause intelligence
          </p>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("lookup")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "lookup"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            IS Number Lookup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "catalog"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Browse Catalog
          </button>
        </div>
      </div>

      {/* Tab 1: Know Your Standards - Dedicated IS Number Lookup */}
      {activeTab === "lookup" && <ISLookupSection />}

      {/* Tab 2: Full Catalog Browse */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search standard number (e.g. IS 99999) or title keyword..."
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setPage(0);
                    setTimeout(fetchStandards, 50);
                  }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  className="bg-transparent border-0 font-medium text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="active">Active Only</option>
                  <option value="superseded">Superseded</option>
                  <option value="all">All Standards</option>
                </select>
              </div>

              <button
                onClick={fetchStandards}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90"
              >
                Search
              </button>
            </div>
          </div>

          {/* Grid or Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : standards.length === 0 ? (
            <EmptyState
              title="No Standards Found"
              description="No standards matched your search criteria. Try a different query or standard number."
              icon={<BookOpen className="w-8 h-8 text-slate-400" />}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {standards.map((s) => (
                  <StandardCard key={s.id} standard={s} />
                ))}
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <span>
                    Showing {page * pageSize + 1}–
                    {Math.min((page + 1) * pageSize, total)} of {total} standards
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 font-medium transition hover:bg-slate-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={(page + 1) * pageSize >= total}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 font-medium transition hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function StandardsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Loading Standards Catalog...
        </div>
      }
    >
      <StandardsContent />
    </Suspense>
  );
}
