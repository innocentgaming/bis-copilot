"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Search, ShieldAlert } from "lucide-react";

interface RefusalCardProps {
  answerText?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export function RefusalCard({ answerText, onSuggestionClick }: RefusalCardProps) {
  return (
    <div className="p-5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-4 max-w-2xl">
      <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <span>Insufficient Evidence — Strict Anti-Hallucination Guard</span>
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {answerText ||
          "The available Indian Standards in the database do not contain sufficient verified evidence to answer this inquiry with required compliance certainty."}
      </p>

      <div className="pt-3 border-t border-rose-200/60 dark:border-rose-900/40 space-y-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Recommended Compliance Actions
        </span>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
          <li>Specify the exact Indian Standard number (e.g. <em>IS 99999:2025</em> or <em>IS 1293</em>).</li>
          <li>Reference a specific clause or test method requirement.</li>
          <li>Search the standard catalog to confirm whether the document has been ingested.</li>
        </ul>

        <div className="pt-2 flex flex-wrap gap-2">
          <Link
            href="/standards"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Standards Catalog</span>
          </Link>
          {onSuggestionClick && (
            <button
              onClick={() => onSuggestionClick("What does Clause 5.2 require in IS 99999?")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-amber-500 transition"
            >
              <span>Try: &ldquo;What does Clause 5.2 require in IS 99999?&rdquo;</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
