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
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { DocumentAIResponse } from "@/types/bis_platform";
import { useToast } from "@/components/common/Toast";
import { Footer } from "@/components/layout/Footer";

export default function DocumentAIPage() {
  const [loading, setLoading] = useState(false);
  const [documentResult, setDocumentResult] = useState<DocumentAIResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  const handleSimulateAnalysis = async (docName: string) => {
    setLoading(true);
    setDocumentResult(null);
    try {
      const formData = new FormData();
      formData.append("filename", docName);
      const res = await platformApi.analyzeDocument(formData);
      setDocumentResult(res);
      toastSuccess(`Extracted AI compliance summary for ${docName}!`);
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Document AI Compliance Workbench
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Intelligent Document & Standard Specification Scanner
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Upload any Indian Standard specification, factory quality manual, or test report.
          The AI extracts key requirements, required forms, fees, deadlines, and potential non-conformances.
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
        className={`p-8 md:p-10 rounded-2xl border-2 border-dashed transition-all text-center space-y-4 ${
          dragOver
            ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
            : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Upload className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Upload PDF, DOCX, or Scanned Quality Manual
          </h3>
          <p className="text-xs text-slate-500">
            Drag and drop file here, or click to browse from device (up to 50MB)
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow hover:opacity-90 transition cursor-pointer">
          <FileText className="w-4 h-4" />
          <span>Browse Document</span>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Preset Sample Documents */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Try Sample Documents:</span>
          <button
            type="button"
            onClick={() => handleSimulateAnalysis("IS_1293_Plugs_and_Sockets_Specification.pdf")}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
          >
            IS 1293 Specification.pdf
          </button>
          <button
            type="button"
            onClick={() => handleSimulateAnalysis("Factory_Quality_Manual_Draft.pdf")}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
          >
            Factory Quality Manual.pdf
          </button>
          <button
            type="button"
            onClick={() => handleSimulateAnalysis("NABL_Test_Report_Sample.pdf")}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
          >
            NABL Test Report.pdf
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-3 text-xs text-slate-500 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            Running Document AI OCR, Clause Extraction & Compliance Mapping...
          </span>
        </div>
      )}

      {/* AI Extraction Analysis Results */}
      {documentResult && !loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Document AI Verified
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {documentResult.document_name}
              </h2>
            </div>

            <Link
              href={`/chat?q=${encodeURIComponent(
                `Explain all compliance action items extracted from ${documentResult.document_name}`
              )}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition self-start md:self-center"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI About This Doc</span>
            </Link>
          </div>

          {/* Document Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white block mb-1">
              Executive AI Summary
            </strong>
            {documentResult.document_summary}
          </div>

          {/* 2 Column Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Requirements */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Key Technical Requirements
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {documentResult.key_requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-500" />
                Required Accompanying Forms
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {documentResult.required_documents.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Dates, Fees, & Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Action Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Immediate Action Items
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {documentResult.action_items.map((act, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Non-Conformances */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Potential Compliance Risks & Issues
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {documentResult.potential_issues.map((iss, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                    <span>{iss}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
