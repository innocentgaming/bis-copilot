"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Calendar,
  ChevronRight,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";
import { standardsApi } from "@/lib/api/standards";
import { ClauseDetail, ClauseSummary, StandardDetail } from "@/types/standards";
import { ClauseTree } from "@/components/standards/ClauseTree";
import { StatusBadge } from "@/components/common/Badge";
import { Skeleton } from "@/components/common/Skeleton";
import { useToast } from "@/components/common/Toast";

export default function StandardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const standardId = params.id as string;

  const { error: toastError } = useToast();

  const [standard, setStandard] = useState<StandardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClause, setSelectedClause] = useState<ClauseDetail | null>(null);
  const [loadingClause, setLoadingClause] = useState(false);

  useEffect(() => {
    async function loadStandard() {
      if (!standardId) return;
      setLoading(true);
      try {
        const data = await standardsApi.getStandard(standardId);
        setStandard(data);
        if (data.clauses && data.clauses.length > 0) {
          handleSelectClause(data.clauses[0]);
        }
      } catch {
        toastError("Failed to load standard specification.");
      } finally {
        setLoading(false);
      }
    }
    loadStandard();
  }, [standardId]);

  const handleSelectClause = async (clauseSummary: ClauseSummary) => {
    setLoadingClause(true);
    try {
      const detail = await standardsApi.getClause(clauseSummary.id);
      setSelectedClause(detail);
    } catch {
      // If full clause fetch fails, use summary
      setSelectedClause({
        ...clauseSummary,
        standard_id: standardId,
        content: "Content available in full standard document.",
        children: [],
      });
    } finally {
      setLoadingClause(false);
    }
  };

  const handleAskClause = () => {
    if (!standard || !selectedClause) return;
    const q = `What are the requirements under Clause ${selectedClause.clause_number} in ${standard.standard_number}?`;
    router.push(`/chat?q=${encodeURIComponent(q)}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 md:col-span-2 w-full" />
        </div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm text-slate-500">Standard not found.</p>
        <Link
          href="/standards"
          className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Standards Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/standards"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Standards Catalog</span>
        </Link>
      </div>

      {/* Header Standard Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {standard.standard_number}
              </h1>
              <StatusBadge status={standard.status} />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              {standard.title}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const q = `What is the scope and requirements of ${standard.standard_number}?`;
                router.push(`/chat?q=${encodeURIComponent(q)}`);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI About Standard</span>
            </button>
          </div>
        </div>

        {standard.scope && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Scope:{" "}
            </span>
            {standard.scope}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          {standard.edition && (
            <span>
              Edition: <strong className="text-slate-600 dark:text-slate-300">{standard.edition}</strong>
            </span>
          )}
          {standard.publication_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {standard.publication_date}
            </span>
          )}
          <span>
            Indexed Clauses: <strong className="text-slate-600 dark:text-slate-300">{standard.clauses_count || standard.clauses.length}</strong>
          </span>
        </div>
      </div>

      {/* Two-Column Specification Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Clause Hierarchy Tree */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 h-[600px] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Clause Structure</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {standard.clauses.length} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <ClauseTree
              clauses={standard.clauses}
              selectedClauseId={selectedClause?.id}
              onSelectClause={handleSelectClause}
            />
          </div>
        </div>

        {/* Right: Clause Content Viewer */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[600px]">
          {loadingClause ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : selectedClause ? (
            <div className="flex flex-col h-full space-y-4">
              {/* Clause Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Clause {selectedClause.clause_number}
                    </span>
                    {selectedClause.page_start && (
                      <span className="text-xs text-slate-400">
                        Pages {selectedClause.page_start}
                        {selectedClause.page_end ? `–${selectedClause.page_end}` : ""}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {selectedClause.heading || "General Clause Specification"}
                  </h3>
                </div>

                <button
                  onClick={handleAskClause}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI This Clause</span>
                </button>
              </div>

              {/* Clause Text */}
              <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm font-sans text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap border border-slate-200 dark:border-slate-800">
                {selectedClause.content}
              </div>

              {/* Child Clauses Quick-Links */}
              {selectedClause.children && selectedClause.children.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Sub-clauses ({selectedClause.children.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedClause.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleSelectClause(child)}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 hover:text-amber-800 transition"
                      >
                        {child.clause_number} {child.heading ? `— ${child.heading}` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a clause from the left tree to inspect specification text.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
