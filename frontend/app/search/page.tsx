"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ExternalLink,
  FileSearch,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { standardsApi } from "@/lib/api/standards";
import { SearchHit, SearchResponseData } from "@/types/standards";
import { AnswerCitation } from "@/types/chat";
import { EvidencePanel } from "@/components/citations/EvidencePanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";

export default function SearchPage() {
  const { error: toastError } = useToast();

  const [query, setQuery] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [clauseFilter, setClauseFilter] = useState("");
  const [results, setResults] = useState<SearchResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<AnswerCitation | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const data = await standardsApi.search({
        query: trimmed,
        standard_number: standardFilter.trim() || undefined,
        clause_number: clauseFilter.trim() || undefined,
        limit: 15,
      });
      setResults(data);
    } catch {
      toastError("Search query failed. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleHitClick = (hit: SearchHit) => {
    const citation: AnswerCitation = {
      standard: hit.standard_number || "Indian Standard",
      clause: hit.clause_number,
      pages: hit.pages,
      chunk_id: hit.chunk_id,
      relevance_score: hit.score,
      citation_text: hit.content,
    };
    setSelectedCitation(citation);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Hybrid Vector & Keyword Search
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct retrieval over Indian Standards database using pgvector cosine similarity and PostgreSQL FTS cover-density ranking.
        </p>
      </div>

      {/* Search Input and Filters */}
      <form onSubmit={handleSearch} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clauses, requirements, test limits, materials (e.g. breaking load, 450 N)..."
            className="w-full pl-11 pr-24 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Optional Metadata Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Narrow by:</span>
          <input
            type="text"
            value={standardFilter}
            onChange={(e) => setStandardFilter(e.target.value)}
            placeholder="Standard (e.g. IS 99999)"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs w-44 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
          <input
            type="text"
            value={clauseFilter}
            onChange={(e) => setClauseFilter(e.target.value)}
            placeholder="Clause (e.g. 5.2)"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs w-32 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
          {(standardFilter || clauseFilter) && (
            <button
              type="button"
              onClick={() => {
                setStandardFilter("");
                setClauseFilter("");
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>
      </form>

      {/* Results Header */}
      {results && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong>{results.total_results}</strong> candidate chunks for &ldquo;<em>{results.query}</em>&rdquo;
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Execution: {results.duration_ms.toFixed(1)} ms
          </span>
        </div>
      )}

      {/* Search Hits List */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : results && results.hits.length === 0 ? (
        <EmptyState
          title="No Matching Chunks Found"
          description="Your search did not return any indexed standard chunks. Try broadening your keywords or clearing clause filters."
          icon={<FileSearch className="w-8 h-8 text-slate-400" />}
        />
      ) : results ? (
        <div className="space-y-3">
          {results.hits.map((hit) => (
            <div
              key={hit.chunk_id}
              onClick={() => handleHitClick(hit)}
              className="group p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      {hit.standard_number || "Indian Standard"}
                    </span>
                    {hit.clause_number && (
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Clause {hit.clause_number}
                      </span>
                    )}
                  </div>
                  {hit.heading && (
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {hit.heading}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Relevance {Math.round(hit.score * 100)}%
                  </span>
                  {hit.pages && (
                    <span className="text-[11px] text-slate-400 block mt-1">
                      pp. {hit.pages}
                    </span>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 font-mono">
                {hit.content}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Click card to inspect full evidence chunk</span>
                <span className="text-amber-600 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
                  View Evidence <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State before search */
        <EmptyState
          title="Search Authoritative Standards"
          description="Type any mechanical requirement, material property, test temperature, or standard identifier to search directly across database chunks."
          icon={<Search className="w-8 h-8 text-amber-500" />}
        />
      )}

      {/* Slide-over Evidence Panel */}
      <EvidencePanel
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
}
