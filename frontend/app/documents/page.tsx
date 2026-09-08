"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Banknote,
  Bot,
  RefreshCw,
  FileCheck2,
  ListChecks,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { DocumentAIResponse } from "@/types/bis_platform";
import { useToast } from "@/components/common/Toast";

export default function DocumentAIPage() {
  const [loading, setLoading] = useState(false);
  const [documentResult, setDocumentResult] = useState<DocumentAIResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeAction, setActiveAction] = useState<"summary" | "requirements" | "checklist" | "explain">("summary");

  const { success: toastSuccess, error: toastError } = useToast();

  const handleSimulateAnalysis = async (docName: string) => {
    setLoading(true);
    setDocumentResult(null);
    try {
      const formData = new FormData();
      formData.append("filename", docName);
      const res = await platformApi.analyzeDocument(formData);
      setDocumentResult(res);
      toastSuccess(`Extracted AI compliance breakdown for ${docName}!`);
    } catch {
      toastError("Failed to analyze document.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleSimulateAnalysis(file.name);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Document AI Assistant</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          BIS Document & Circular AI Analyzer
        </h1>
        <p className="text-xs md:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Upload PDF gazette circulars, quality manuals, or standard test specs. BIS AI extracts clauses, summarizes legal obligations, and generates actionable compliance audit checklists.
        </p>
      </div>

      {/* Uploader Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleSimulateAnalysis(e.dataTransfer.files[0].name);
          }
        }}
        className={`p-8 md:p-12 rounded-3xl border-2 border-dashed transition-all text-center space-y-5 ${
          dragOver
            ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10"
            : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
        }`}
      >
        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Upload Your BIS Document or Standard Specification
          </h3>
          <p className="text-xs text-slate-500">
            Drag and drop PDF, circular notice, or scanned image (up to 50MB)
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition cursor-pointer">
          <FileText className="w-4 h-4" />
          <span>Browse Device Files</span>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Preset Sample Documents */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-bold">Try Sample Circulars:</span>
          <button
            type="button"
            onClick={() => handleSimulateAnalysis("QCO_Notification_Electric_Cables_2026.pdf")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/20 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold transition"
          >
            QCO_Notification_Cables_2026.pdf
          </button>
          <button
            type="button"
            onClick={() => handleSimulateAnalysis("IS_1293_Plugs_and_Sockets_Specification.pdf")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/20 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold transition"
          >
            IS_1293_Plugs_Specification.pdf
          </button>
          <button
            type="button"
            onClick={() => handleSimulateAnalysis("Factory_Quality_Manual_Draft.pdf")}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/20 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold transition"
          >
            Factory_Quality_Manual.pdf
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-3 text-xs text-slate-500 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Running Document AI OCR, Clause Extraction & Compliance Mapping...
          </span>
        </div>
      )}

      {/* AI Extraction Analysis Results */}
      {documentResult && !loading && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Document AI Verified
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {documentResult.document_name}
              </h2>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveAction("summary")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeAction === "summary"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                Summarize
              </button>
              <button
                onClick={() => setActiveAction("requirements")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeAction === "requirements"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                Find Requirements
              </button>
              <button
                onClick={() => setActiveAction("checklist")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeAction === "checklist"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                Create Checklist
              </button>
              <Link
                href={`/assistant?q=${encodeURIComponent(
                  `Explain all clauses, requirements, and compliance deadlines in ${documentResult.document_name}`
                )}`}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Ask Questions</span>
              </Link>
            </div>
          </div>

          {/* Document Summary */}
          {activeAction === "summary" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white block mb-1 font-bold text-sm">
                  Executive AI Summary
                </strong>
                {documentResult.document_summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 space-y-2 text-xs">
                  <strong className="text-blue-900 dark:text-blue-300 font-bold block">
                    Applicable Standards Referenced
                  </strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {documentResult.applicable_standards.map((std, i) => (
                      <li key={i}>{std}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 space-y-2 text-xs">
                  <strong className="text-amber-900 dark:text-amber-300 font-bold block">
                    Statutory Timelines & Fees
                  </strong>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {Object.entries(documentResult.important_dates_and_fees).map(([k, v], i) => (
                      <li key={i} className="flex justify-between">
                        <span className="font-medium text-slate-500">{k}:</span>
                        <strong className="text-slate-900 dark:text-white">{v}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Requirements Tab */}
          {activeAction === "requirements" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Key Technical Requirements
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {documentResult.key_requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-blue-500" />
                    Required Accompanying Forms
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {documentResult.required_documents.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Checklist Tab */}
          {activeAction === "checklist" && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 space-y-3 text-xs">
                <strong className="text-emerald-900 dark:text-emerald-300 font-bold block text-sm flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-emerald-600" />
                  Generated Compliance Audit Checklist
                </strong>
                <div className="space-y-2">
                  {documentResult.action_items.map((item, idx) => (
                    <label
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 cursor-pointer"
                    >
                      <input type="checkbox" className="w-4 h-4 rounded text-emerald-600" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
