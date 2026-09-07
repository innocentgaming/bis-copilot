"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle,
  ExternalLink,
  FileText,
  Layers,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnswerCitation } from "@/types/chat";

interface EvidencePanelProps {
  citation: AnswerCitation | null;
  onClose: () => void;
}

export function EvidencePanel({ citation, onClose }: EvidencePanelProps) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Verified Evidence Trace
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Standard banner */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Indian Standard
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{citation.standard}</span>
            </div>
            {citation.relevance_score !== null && citation.relevance_score !== undefined && (
              <div className="flex items-center gap-2 pt-1 text-xs text-amber-800 dark:text-amber-300 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Relevance Score: {Math.round(citation.relevance_score * 100)}% (pgvector + FTS Hybrid)
                </span>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-slate-400 font-medium block mb-1">Clause Number</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {citation.clause || "Entire Standard"}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-slate-400 font-medium block mb-1">Page Range</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {citation.pages ? `Pages ${citation.pages}` : "Unspecified"}
              </span>
            </div>
          </div>

          {/* Verbatim Citation Text */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Authoritative Reference Text
            </span>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {citation.citation_text}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              This citation originates from official Bureau of Indian Standards documentation, extracted and indexed under SIH Problem Statement 26107.
            </p>
          </div>

          {/* Traceability IDs */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Database Traceability
            </span>
            {citation.chunk_id && (
              <div className="flex items-center justify-between text-slate-500 py-1 border-b border-slate-100 dark:border-slate-800/60 font-mono text-[11px]">
                <span>Chunk ID:</span>
                <span className="truncate max-w-[220px]">{citation.chunk_id}</span>
              </div>
            )}
            {citation.document_id && (
              <div className="flex items-center justify-between text-slate-500 py-1 font-mono text-[11px]">
                <span>Document ID:</span>
                <span className="truncate max-w-[220px]">{citation.document_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <Link
            href={`/standards?search=${encodeURIComponent(citation.standard)}`}
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <span>Explore Standard in Catalog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
