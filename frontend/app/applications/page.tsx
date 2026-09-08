"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  User,
  ShieldCheck,
  ArrowRight,
  Bell,
  Sparkles,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISApplication, ComplaintRecord } from "@/types/bis_platform";
import { ApplicationTimeline } from "@/components/applications/ApplicationTimeline";

function ApplicationsTrackerContent() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track") || "";

  const [activeTab, setActiveTab] = useState<"application" | "complaint">("application");
  const [queryInput, setQueryInput] = useState(trackParam || "BIS-2026-004819");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [applicationResult, setApplicationResult] = useState<BISApplication | null>(null);
  const [complaintResult, setComplaintResult] = useState<ComplaintRecord | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setApplicationResult(null);
    setComplaintResult(null);

    const q = queryInput.trim();

    if (q.toUpperCase().startsWith("BIS-CMP") || activeTab === "complaint") {
      try {
        const comp = await platformApi.getComplaint(q);
        setComplaintResult(comp);
        setActiveTab("complaint");
      } catch {
        setErrorMsg(`Complaint reference '${q}' not found in registry.`);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const app = await platformApi.trackApplication(q);
        setApplicationResult(app);
        setActiveTab("application");
      } catch {
        setErrorMsg(`Application number '${q}' not found in registry.`);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (trackParam) {
      setQueryInput(trackParam);
      handleTrack();
    } else {
      handleTrack();
    }
  }, [trackParam]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/20">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Central Status Tracking System</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          Track BIS Applications & Quality Complaints
        </h1>
        <p className="text-xs md:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Real-time lifecycle inspection updates, officer review milestones, and statutory action alerts for Scheme-I, CRS, Hallmarking, and Grievances.
        </p>
      </div>

      {/* Tracker Search Box */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => {
              setActiveTab("application");
              setQueryInput("BIS-2026-004819");
            }}
            className={`text-xs font-bold pb-2 transition border-b-2 -mb-3.5 ${
              activeTab === "application"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Track License Application
          </button>
          <button
            onClick={() => {
              setActiveTab("complaint");
              setQueryInput("BIS-CMP-2026-004812");
            }}
            className={`text-xs font-bold pb-2 transition border-b-2 -mb-3.5 ${
              activeTab === "complaint"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Track Consumer Grievance
          </button>
        </div>

        <form onSubmit={handleTrack} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {activeTab === "application"
              ? "Enter Application / Registration Number"
              : "Enter Complaint Tracking Reference (BIS-CMP-XXXXXX)"}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={
                  activeTab === "application"
                    ? "e.g. BIS-2026-004819"
                    : "e.g. BIS-CMP-2026-004812"
                }
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track Status"}
            </button>
          </div>

          {/* Quick demo chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400">Sample Tracking IDs:</span>
            {["BIS-2026-004819", "BIS-2026-001092", "BIS-CMP-2026-004812"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setQueryInput(id);
                  if (id.startsWith("BIS-CMP")) setActiveTab("complaint");
                  else setActiveTab("application");
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold hover:bg-slate-200 transition"
              >
                {id}
              </button>
            ))}
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Application Tracking Result */}
      {applicationResult && (
        <div className="space-y-6 animate-in fade-in-50">
          {/* Metadata Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                    {applicationResult.application_number}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    {applicationResult.current_status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {applicationResult.service_name}
                </h2>
              </div>

              <Link
                href={`/assistant?q=${encodeURIComponent(`What is the current status of application ${applicationResult.application_number}?`)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-500/20 transition shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask BIS AI about this file</span>
              </Link>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Applicant Name</span>
                <strong className="text-slate-900 dark:text-white block truncate">
                  {applicationResult.applicant_name}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Enterprise / Company</span>
                <strong className="text-slate-900 dark:text-white block truncate">
                  {applicationResult.company_name}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Indian Standard</span>
                <strong className="text-slate-900 dark:text-white font-mono block">
                  {applicationResult.standard_number || "Scheme General"}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Assigned Branch</span>
                <strong className="text-slate-900 dark:text-white block truncate">
                  {applicationResult.assigned_department}
                </strong>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Inspection & Verification Timeline
              </h3>
              <ApplicationTimeline steps={applicationResult.timeline} />
            </div>
          </div>
        </div>
      )}

      {/* Complaint Tracking Result */}
      {complaintResult && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-rose-600">
                  {complaintResult.tracking_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {complaintResult.status_label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {complaintResult.product_name}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Category</span>
              <strong className="text-slate-900 dark:text-white capitalize">
                {complaintResult.category.replace("_", " ")}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Seller / Store</span>
              <strong className="text-slate-900 dark:text-white">
                {complaintResult.seller_name || "Unspecified"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Date Lodged</span>
              <strong className="text-slate-900 dark:text-white">
                {new Date(complaintResult.created_at).toLocaleDateString()}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Complainant</span>
              <strong className="text-slate-900 dark:text-white">
                {complaintResult.complainant_name}
              </strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <strong className="block font-bold">Investigation Next Step:</strong>
            <p>{complaintResult.next_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsTrackerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Application Tracker...</div>}>
      <ApplicationsTrackerContent />
    </Suspense>
  );
}
