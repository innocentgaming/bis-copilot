"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  FileText,
  Calendar,
  Building2,
  Bot,
  RefreshCw,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISApplication } from "@/types/bis_platform";
import { ApplicationTimeline } from "@/components/applications/ApplicationTimeline";
import { useToast } from "@/components/common/Toast";
import { Footer } from "@/components/layout/Footer";

export default function ApplicationsTrackingPage() {
  const [applications, setApplications] = useState<BISApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<BISApplication | null>(null);
  const [searchNum, setSearchNum] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // New Application Modal / Drawer state
  const [isCreating, setIsCreating] = useState(false);
  const [newServiceName, setNewServiceName] = useState("Product Certification Scheme (ISI Mark - Scheme I)");
  const [newStandard, setNewStandard] = useState("IS 1293:2019");
  const [newApplicant, setNewApplicant] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { success: toastSuccess, error: toastError } = useToast();

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await platformApi.listApplications(statusFilter);
      setApplications(data);
      if (data.length > 0 && !selectedApp) {
        setSelectedApp(data[0]);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNum.trim()) return;

    try {
      const res = await platformApi.trackApplication(searchNum.trim());
      setSelectedApp(res);
      toastSuccess(`Found application ${res.application_number}`);
    } catch {
      toastError(`Application '${searchNum}' not found. Verify format e.g. BIS-2026-000123.`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicant || !newCompany || !newEmail) return;

    setSubmitting(true);
    try {
      const created = await platformApi.submitApplication({
        service_name: newServiceName,
        standard_number: newStandard,
        applicant_name: newApplicant,
        company_name: newCompany,
        contact_email: newEmail,
        contact_phone: newPhone,
      });

      setApplications([created, ...applications]);
      setSelectedApp(created);
      setIsCreating(false);
      setNewApplicant("");
      setNewCompany("");
      setNewEmail("");
      setNewPhone("");
      toastSuccess(`Application ${created.application_number} submitted successfully!`);
    } catch {
      toastError("Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
            <Clock className="w-3.5 h-3.5" />
            Live Status & Workflow Tracking
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            BIS Application Tracking & Timeline
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Track verification progress, factory audit schedules, sample testing, and licence grants.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Track Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-700/60 space-y-3">
        <h3 className="font-bold text-sm">
          Track by Application Number
        </h3>
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <input
            type="text"
            value={searchNum}
            onChange={(e) => setSearchNum(e.target.value)}
            placeholder="Enter Application Number (e.g. BIS-2026-000123)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/60 font-mono"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0"
          >
            Track Status
          </button>
        </form>
      </div>

      {/* Main Grid: List on Left, Selected App on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Submitted Applications
            </span>
            <span className="text-xs text-slate-500">{applications.length} Total</span>
          </div>

          <div className="space-y-2.5">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedApp?.application_number === app.application_number
                    ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {app.application_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {app.current_status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {app.service_name}
                </h4>
                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                  <span className="truncate">{app.company_name}</span>
                  <span className="font-mono">{app.standard_number || "General"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Application Timeline & Overview */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <div className="p-6 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    {selectedApp.application_number}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {selectedApp.service_name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Applicant: {selectedApp.applicant_name}</span>
                    <span>•</span>
                    <span>{selectedApp.company_name}</span>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Current Milestone
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block mt-0.5">
                    {selectedApp.current_status}
                  </span>
                </div>
              </div>

              {/* Application Details Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Standard (IS)
                  </span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {selectedApp.standard_number || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Assigned Division
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedApp.assigned_department}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Contact Email
                  </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedApp.contact_email}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Verification & Inspection Timeline
                </h3>
                <ApplicationTimeline steps={selectedApp.timeline} />
              </div>

              {/* Remarks */}
              {selectedApp.remarks && (
                <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
                  <strong>Auditor Remarks:</strong> {selectedApp.remarks}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <Link
                  href={`/chat?q=${encodeURIComponent(
                    `What are the next steps for my application ${selectedApp.application_number} currently at status ${selectedApp.current_status}?`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow transition"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Ask AI About Status
                </Link>
                <span className="text-slate-400 text-[11px]">
                  Updated real-time from BIS scrutiny server
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
              Select an application to view its tracking timeline
            </div>
          )}
        </div>
      </div>

      {/* New Application Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Submit New BIS Scheme Application
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-500 block mb-1">
                  BIS Scheme / Service
                </label>
                <select
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option>Product Certification Scheme (ISI Mark - Scheme I)</option>
                  <option>Compulsory Registration Scheme (CRS)</option>
                  <option>Hallmarking Scheme for Gold & Silver</option>
                  <option>Foreign Manufacturers Certification Scheme (FMCS)</option>
                  <option>Tatkal Licensing Scheme</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-500 block mb-1">
                  Indian Standard (IS Number)
                </label>
                <input
                  type="text"
                  required
                  value={newStandard}
                  onChange={(e) => setNewStandard(e.target.value)}
                  placeholder="e.g. IS 1293:2019"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">
                    Applicant Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newApplicant}
                    onChange={(e) => setNewApplicant(e.target.value)}
                    placeholder="e.g. Anand Verma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Apex Power Ltd"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
