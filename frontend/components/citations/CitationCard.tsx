"use client";

import React from "react";
import { BookMarked, ChevronRight } from "lucide-react";
import { AnswerCitation } from "@/types/chat";

interface CitationCardProps {
  citation: AnswerCitation;
  onClick: () => void;
}

export function CitationCard({ citation, onClick }: CitationCardProps) {
  return (
    <button
      onClick={onClick}
      className="group text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:border-amber-500/80 hover:shadow-md transition flex flex-col justify-between w-full sm:w-64 shrink-0 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
          <BookMarked className="w-3.5 h-3.5 text-amber-600" />
          <span className="truncate">{citation.standard}</span>
        </div>
        {citation.relevance_score !== null && citation.relevance_score !== undefined && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
            {Math.round(citation.relevance_score * 100)}%
          </span>
        )}
      </div>

      <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
        {citation.clause ? `Clause ${citation.clause}` : "General Standard"}
        {citation.pages ? ` • pp. ${citation.pages}` : ""}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition">
        <span>Inspect Evidence</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}
