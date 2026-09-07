"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, Filter, Search, X } from "lucide-react";
import { standardsApi } from "@/lib/api/standards";
import { StandardSummary } from "@/types/standards";
import { StandardCard } from "@/components/standards/StandardCard";
import { CardSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/common/Toast";

function StandardsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const { error: toastError } = useToast();

  const [standards, setStandards] = useState<StandardSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
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
    fetchStandards();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchStandards();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Indian Standards Catalog (BIS)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search authoritative Indian Standards (`IS \d+:\d{4}`), specifications, and editions
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search standard number (e.g. IS 99999) or title keyword..."
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
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
              className="bg-transparent border-0 font-medium text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
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
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total} standards
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
  );
}

export default function StandardsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Standards Catalog...</div>}>
      <StandardsContent />
    </Suspense>
  );
}

