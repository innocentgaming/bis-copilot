"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileCheck,
  FileText,
  FileUp,
  FolderLock,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { documentsApi } from "@/lib/api/documents";
import { DocumentSummary, IngestionJobResponse } from "@/types/documents";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { formatBytes, formatDateTime } from "@/lib/utils/formatters";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/components/common/Toast";

export default function DocumentAdminPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload & Job state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [forceReingest, setForceReingest] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeJob, setActiveJob] = useState<IngestionJobResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentsApi.listDocuments({ limit: 50 });
      setDocuments(res.items);
    } catch {
      toastError("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Polling for active ingestion job
  useEffect(() => {
    if (!activeJob || activeJob.status === "completed" || activeJob.status === "failed") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await documentsApi.getJobStatus(activeJob.job_id);
        setActiveJob(updated);

        if (updated.status === "completed") {
          success(
            `Document ingested successfully! Standard: ${updated.standard_number || "IS"}, Chunks: ${updated.chunks_created}`
          );
          fetchDocuments();
          clearInterval(interval);
        } else if (updated.status === "failed") {
          toastError(`Ingestion job failed: ${updated.message}`);
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeJob]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toastError("Only PDF files are supported for document ingestion.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toastError("Only PDF files are supported.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    try {
      const job = await documentsApi.uploadAndIngest(selectedFile, forceReingest);
      setActiveJob(job);
      success("PDF uploaded! Processing ingestion pipeline...");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toastError(msg);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <EmptyState
        title="Admin Privilege Required"
        description="Only administrators can upload Indian Standard PDFs and trigger pipeline ingestion."
        icon={<FolderLock className="w-8 h-8 text-amber-600" />}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Standard Document Ingestion
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload authoritative Indian Standard PDFs to trigger Phase 2 extraction, chunking, and embedding
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Upload Zone */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Upload New Standard Document (PDF)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            PyMuPDF extracts pages, builds multi-level clauses (5 → 5.1 → 5.1.1), creates embeddings, and stores chunks with TSVector for hybrid retrieval.
          </p>
        </div>

        {/* Drag and Drop Box */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
              {selectedFile ? selectedFile.name : "Click to select PDF or drag and drop"}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              {selectedFile
                ? `${formatBytes(selectedFile.size)} • Ready to upload`
                : "Official Bureau of Indian Standards PDFs (up to 50MB)"}
            </span>
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={forceReingest}
              onChange={(e) => setForceReingest(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Force re-ingest if SHA-256 checksum already exists</span>
          </label>

          <div className="flex gap-2">
            {selectedFile && (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  <span>Start Document Ingestion</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Job Progress Card */}
        {activeJob && (
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
              <span className="flex items-center gap-2">
                {activeJob.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                )}
                Ingestion Job: {activeJob.job_id}
              </span>
              <span className="capitalize">{activeJob.status} ({activeJob.progress_percent}%)</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-900/60 overflow-hidden">
              <div
                className="h-full bg-amber-600 transition-all duration-300"
                style={{ width: `${activeJob.progress_percent}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              {activeJob.message}
            </p>
          </div>
        )}
      </div>

      {/* Document Library Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Ingested Documents Library ({documents.length})
        </h3>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No source documents ingested yet. Upload an Indian Standard PDF above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-2 font-semibold">Filename</th>
                  <th className="pb-2 font-semibold">Pages</th>
                  <th className="pb-2 font-semibold">Size</th>
                  <th className="pb-2 font-semibold">SHA-256 Checksum</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Ingested Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                    <td className="py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{doc.filename}</span>
                    </td>
                    <td className="py-3">{doc.page_count} pp.</td>
                    <td className="py-3">{formatBytes(doc.file_size_bytes)}</td>
                    <td className="py-3 font-mono text-[11px] text-slate-400">
                      {doc.checksum_sha256.substring(0, 12)}...
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {formatDateTime(doc.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
