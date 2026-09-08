"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Sparkles,
  ExternalLink,
  Building,
  Calendar,
  Layers,
  Camera,
  RefreshCw,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { ProductVerificationResult } from "@/types/bis_platform";

export default function ProductVerificationPage() {
  const [cmlNumber, setCmlNumber] = useState("");
  const [isNumber, setIsNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [productName, setProductName] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductVerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cmlNumber.trim() && !isNumber.trim() && !manufacturer.trim() && !productName.trim() && !imageName) {
      setErrorMsg("Please enter a BIS Licence Number (CM/L), IS Standard, or upload a product label image.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await platformApi.verifyProduct({
        cml_license_number: cmlNumber.trim() || undefined,
        is_number: isNumber.trim() || undefined,
        manufacturer_name: manufacturer.trim() || undefined,
        product_name: productName.trim() || undefined,
        image_filename: imageName || undefined,
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete product verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageName(file.name);
      // Auto populate demo data for smart inspection experience
      if (!cmlNumber) setCmlNumber("CM/L-8472910");
      if (!productName) setProductName("Electrical Socket Outlet (16A)");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/20">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>BIS Product Certification & Quality Marks Inspector</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          Verify BIS Certified Product
        </h1>
        <p className="text-xs md:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Verify if an appliance, helmet, steel bar, or consumer good possesses a genuine BIS licence (CM/L number) under mandatory Indian Standards.
        </p>
      </div>

      {/* Verification Form Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            <span>Enter Product & Licence Information</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provide the 7-digit CM/L licence number stamped below the ISI mark, or upload an image of the physical packaging label.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                BIS Licence Number (CM/L)
              </label>
              <input
                type="text"
                value={cmlNumber}
                onChange={(e) => setCmlNumber(e.target.value.toUpperCase())}
                placeholder="e.g. CM/L-8472910 or 8472910"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Indian Standard (IS Number)
              </label>
              <input
                type="text"
                value={isNumber}
                onChange={(e) => setIsNumber(e.target.value.toUpperCase())}
                placeholder="e.g. IS 1293, IS 1786, IS 302"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Manufacturer / Brand Name
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Havells, Tata Steel, Bajaj"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Product Name / Category
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. 3-Pin Plug, Water Pump, Helmet"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Image Label Upload Option */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  OR Upload Product Packaging / ISI Mark Photo
                </span>
                <span className="text-[11px] text-slate-500">
                  AI will inspect the ISI logo, CM/L number, and manufacturer text
                </span>
              </div>
            </div>

            <label className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer shrink-0">
              <span>{imageName ? `Attached: ${imageName}` : "Choose Image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick Demo Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400">Sample Licences:</span>
            {[
              { label: "Havells IS 1293 Plug", cml: "CM/L-8472910", is: "IS 1293:2019" },
              { label: "Tata Steel TMT Bar", cml: "CM/L-1234567", is: "IS 1786:2008" },
              { label: "Expired Helmet Licence", cml: "CM/L-9999999", is: "IS 4151:2015" },
            ].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCmlNumber(sample.cml);
                  setIsNumber(sample.is);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-xs font-mono font-bold hover:bg-blue-500/20 transition"
              >
                {sample.label} ({sample.cml})
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cross-checking BIS Database...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Product Certification</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 animate-in fade-in-50">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                  result.status === "VERIFIED"
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                    : result.status === "NEEDS_VERIFICATION"
                    ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                    : "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                }`}
              >
                {result.status === "VERIFIED" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : result.status === "NEEDS_VERIFICATION" ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    result.status === "VERIFIED"
                      ? "text-emerald-600"
                      : result.status === "NEEDS_VERIFICATION"
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {result.status_label}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {result.product_name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono font-bold text-xs">
                {result.cml_license_number}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Manufacturer</span>
              <strong className="text-slate-900 dark:text-white block truncate">
                {result.manufacturer_name}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Standard (IS Number)</span>
              <strong className="text-slate-900 dark:text-white font-mono block truncate">
                {result.is_number}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Certification Scheme</span>
              <strong className="text-slate-900 dark:text-white block truncate">
                {result.certification_scheme}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Licence Validity</span>
              <strong className="text-emerald-600 dark:text-emerald-400 block truncate">
                {result.validity_period}
              </strong>
            </div>
          </div>

          {/* Safety Summary & Mandatory Clauses */}
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 space-y-3 text-xs">
            <strong className="text-blue-900 dark:text-blue-300 font-bold block text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Safety & Compliance Overview
            </strong>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.safety_summary}
            </p>

            {result.applicable_clauses.length > 0 && (
              <div className="pt-2 border-t border-blue-200/40 dark:border-blue-900/40 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Applicable Technical Clauses:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                  {result.applicable_clauses.map((cl, i) => (
                    <li key={i}>{cl}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Warning notice if any */}
          {result.warning_notice && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{result.warning_notice}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Link
                href={`/assistant?q=${encodeURIComponent(`Explain standard ${result.is_number} and safety requirements for ${result.product_name}`)}`}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask BIS AI</span>
              </Link>
              <Link
                href="/complaints"
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Licence Violation</span>
              </Link>
            </div>

            <span className="text-[11px] text-slate-400">
              Source: {result.verification_source}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
