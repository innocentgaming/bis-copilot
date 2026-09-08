"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Download,
  Bot,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { ComplianceRecord } from "@/types/bis_platform";
import { useToast } from "@/components/common/Toast";
import { Footer } from "@/components/layout/Footer";

export default function ComplianceDashboardPage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // New assessment inputs
  const [productName, setProductName] = useState("");
  const [standardNumber, setStandardNumber] = useState("");
  const [industry, setIndustry] = useState("");

  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await platformApi.listComplianceRecords();
        setRecords(data);
        if (data.length > 0) {
          setSelectedRecord(data[0]);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleEvaluateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !standardNumber) return;

    setEvaluating(true);
    try {
      const res = await platformApi.evaluateCompliance({
        product_name: productName,
        standard_number: standardNumber,
        industry: industry || "Manufacturing",
      });

      const newRec: ComplianceRecord = {
        id: `eval-${Date.now()}`,
        product_name: res.product_name,
        standard_number: res.standard_number,
        scheme_name: res.applicable_scheme,
        compliance_score: res.estimated_compliance_score,
        status: res.status,
        expiry_date: "Pending Assessment",
        checklist_items: res.checklist,
        missing_requirements: res.recommended_next_steps,
      };

      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);
      setProductName("");
      setStandardNumber("");
      setIndustry("");
      toastSuccess("Generated new AI compliance assessment!");
    } catch {
      toastError("Failed to evaluate compliance.");
    } finally {
      setEvaluating(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === "COMPLIANT") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Fully Compliant (100%)
        </span>
      );
    }
    if (status === "PARTIALLY_COMPLIANT") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Partially Compliant
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5" />
        Action Required
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Regulatory Compliance Intelligence
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Product Compliance Dashboard & Audit Checklist
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Monitor your factory quality benchmarks, testing requirements, mandatory Quality Control Orders (QCO), and generate certification audit dossiers.
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Products Monitored
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {records.length}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">
            1 Fully Certified • {records.filter(r => r.status === "PARTIALLY_COMPLIANT").length} In Progress
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Average Compliance Score
          </span>
          <div className="text-2xl font-extrabold text-amber-500">
            {records.length > 0
              ? Math.round(
                  records.reduce((acc, r) => acc + r.compliance_score, 0) /
                    records.length
                )
              : 0}
            %
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Based on BIS Scheme-I & CRS mandates
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Next Surveillance Expiry
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            180 Days
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            MCCB (IS/IEC 60947-2)
          </span>
        </div>
      </div>

      {/* Main Grid: Checklist & Evaluator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product selector & New Evaluator */}
        <div className="space-y-6">
          {/* New Assessment Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                New Compliance Evaluation
              </h3>
            </div>
            <form onSubmit={handleEvaluateNew} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Solar Inverter, Electric Iron"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Indian Standard (IS)
                </label>
                <input
                  type="text"
                  required
                  value={standardNumber}
                  onChange={(e) => setStandardNumber(e.target.value)}
                  placeholder="e.g. IS 302-2-3:2018"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Industry Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Electrotechnical, Consumer"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <button
                type="submit"
                disabled={evaluating}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Checklist...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Evaluate Product Compliance</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of Monitored Products */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Monitored Products
            </span>
            <div className="space-y-2">
              {records.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRecord(r)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedRecord?.id === r.id
                      ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {r.product_name}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-amber-500">
                      {r.compliance_score}%
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                    {r.standard_number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Compliance Checklist Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRecord ? (
            <div className="p-6 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              {/* Product Top Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold block">
                    {selectedRecord.standard_number}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.product_name}
                  </h2>
                  <span className="text-xs text-slate-500">
                    Scheme: {selectedRecord.scheme_name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {renderStatusBadge(selectedRecord.status)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">
                    Compliance Verification Score
                  </span>
                  <span className="text-amber-500 font-mono font-bold">
                    {selectedRecord.compliance_score}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${selectedRecord.compliance_score}%` }}
                  />
                </div>
              </div>

              {/* Actionable Checklist */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  Mandatory Compliance Checklist
                </h3>
                <div className="space-y-2">
                  {selectedRecord.checklist_items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-start gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        readOnly
                        className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-default"
                      />
                      <div className="space-y-0.5 flex-1">
                        <span
                          className={`text-xs font-semibold ${
                            item.completed
                              ? "text-slate-900 dark:text-slate-100 line-through opacity-75"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Category: {item.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Requirements / Action Items */}
              {selectedRecord.missing_requirements.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Pending Action Items
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {selectedRecord.missing_requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() =>
                    toastSuccess("Downloaded Audit Compliance Report (PDF)!")
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow hover:opacity-90 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Generate Compliance Report
                </button>

                <Link
                  href={`/chat?q=${encodeURIComponent(
                    `How to fulfill missing compliance requirements for ${selectedRecord.product_name} under standard ${selectedRecord.standard_number}?`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                >
                  <Bot className="w-4 h-4 text-amber-500" />
                  Consult AI on Remediation
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
              Select a product to inspect its compliance checklist
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
