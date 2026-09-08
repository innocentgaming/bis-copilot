"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Clock,
  Sparkles,
  Search,
  Building,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { ComplaintRecord } from "@/types/bis_platform";

const CATEGORIES = [
  { id: "fake_isi", label: "Fake or Unauthorized ISI Mark", desc: "Product bears counterfeit ISI logo without valid CML license." },
  { id: "hallmark_issue", label: "Hallmark / Gold Purity Dispute", desc: "Gold or silver jewelry purity is lower than stamped HUID karat." },
  { id: "defective_product", label: "Defective Mandatory Standard Product", desc: "Product under mandatory QCO failed safety tests or caused a hazard." },
  { id: "misleading_claim", label: "Misleading Certification Claim", desc: "Company advertises BIS endorsement falsely in media/ads." },
  { id: "standard_violation", label: "General Standards Violation", desc: "Non-conformance to Indian Standards in packaging or lab specs." },
];

export default function ComplaintsPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ComplaintRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState("fake_isi");
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [isNumber, setIsNumber] = useState("");
  const [huidNumber, setHuidNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceName, setEvidenceName] = useState("");

  // Complainant details
  const [complainantName, setComplainantName] = useState("");
  const [complainantEmail, setComplainantEmail] = useState("");
  const [complainantPhone, setComplainantPhone] = useState("");

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1 && !category) {
      setErrorMsg("Please select a complaint category.");
      return;
    }
    if (step === 2 && !description.trim()) {
      setErrorMsg("Please provide a description of the issue.");
      return;
    }
    if (step === 4 && (!productName.trim() || !complainantName.trim() || !complainantEmail.trim())) {
      setErrorMsg("Please enter Product Name, Complainant Name, and Complainant Email.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const record = await platformApi.fileComplaint({
        category,
        product_name: productName,
        brand_name: brandName || undefined,
        batch_number: batchNumber || undefined,
        seller_name: sellerName || undefined,
        seller_address: sellerAddress || undefined,
        is_number: isNumber || undefined,
        huid_number: huidNumber || undefined,
        license_number: licenseNumber || undefined,
        description,
        evidence_urls: evidenceName ? [`/uploads/${evidenceName}`] : [],
        complainant_name: complainantName,
        complainant_email: complainantEmail,
        complainant_phone: complainantPhone || undefined,
      });

      setSubmittedRecord(record);
      setStep(6);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit complaint. Please check fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>BIS Quality Grievance Portal</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          Guided Complaint & Quality Grievance Assistant
        </h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Lodge an official grievance against sub-standard products, counterfeit ISI marks, hallmark purity discrepancies, or non-compliant manufacturers.
        </p>
      </div>

      {/* Progress Bar (Steps 1 to 5) */}
      {step < 6 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Step {step} of 5</span>
            <span className="text-blue-600 dark:text-blue-400">
              {step === 1 && "Select Category"}
              {step === 2 && "Describe Violation"}
              {step === 3 && "Evidence Upload"}
              {step === 4 && "Product & Contact Details"}
              {step === 5 && "Review & Submit"}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Select Category */}
      {step === 1 && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 1: Select Complaint Category
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Identify the type of standards or consumer violation you encountered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  category === cat.id
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {cat.label}
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                {category === cat.id && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow transition"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Describe Issue */}
      {step === 2 && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 2: Describe the Issue & Defect
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide specific observations regarding safety, quality, or markings.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Detailed Description of Violation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, what marking appeared incorrect, where you purchased the item, and any safety hazards observed..."
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow transition"
            >
              <span>Next: Upload Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Evidence Upload */}
      {step === 3 && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 3: Attach Evidence & Invoice (Optional)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Photographs of the product label, hallmark stamp, or purchase receipt expedite enforcement.
            </p>
          </div>

          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Click or drag & drop packaging photos / invoice PDF
              </span>
              <span className="text-[11px] text-slate-400">
                Supports JPG, PNG, PDF (Max 10MB)
              </span>
            </div>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setEvidenceName(e.target.files[0].name);
                }
              }}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
            {evidenceName && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Selected file: {evidenceName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow transition"
            >
              <span>Next: Product & Contact Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Product & Contact Details */}
      {step === 4 && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 4: Product & Complainant Details
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Required to dispatch notices and issue official inspection references.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Submersible Water Pump, Helmet, 22K Gold Bangle"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Manufacturer Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Apex Industries, Gold Plaza"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Seller / Store Name & City
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g. Sharma Hardware, Nagpur"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Indian Standard (IS) or HUID (if known)
              </label>
              <input
                type="text"
                value={isNumber}
                onChange={(e) => setIsNumber(e.target.value)}
                placeholder="e.g. IS 14220, IS 1293, or HUID code"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Complainant Info */}
            <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-3 text-[11px]">
                Your Contact Information
              </span>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={complainantEmail}
                onChange={(e) => setComplainantEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow transition"
            >
              <span>Review Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Submit */}
      {step === 5 && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 5: Review Grievance Summary
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify your information before transmitting to BIS Enforcement & Consumer Cell.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block">Category</span>
                <strong className="text-slate-900 dark:text-white capitalize">
                  {category.replace("_", " ")}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Product</span>
                <strong className="text-slate-900 dark:text-white">{productName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Brand / Seller</span>
                <strong className="text-slate-900 dark:text-white">
                  {brandName || sellerName || "Not specified"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Complainant</span>
                <strong className="text-slate-900 dark:text-white">
                  {complainantName} ({complainantEmail})
                </strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Violation Description</span>
              <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Submitting Grievance..." : "Submit Formal Complaint"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Submission Success Receipt */}
      {step === 6 && submittedRecord && (
        <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Complaint Registered Successfully
            </h2>
            <p className="text-xs text-slate-500">
              Your grievance has been assigned an official reference ID and forwarded to the BIS Enforcement Cell.
            </p>
          </div>

          {/* Tracking Ticket */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-blue-500/30 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Official Tracking ID
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600">
                {submittedRecord.status_label}
              </span>
            </div>
            <div className="text-xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-wider">
              {submittedRecord.tracking_id}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <strong>Next Action:</strong> {submittedRecord.next_action}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href={`/applications?track=${submittedRecord.tracking_id}`}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
            >
              Track Status Online
            </Link>
            <Link
              href="/assistant"
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              Ask BIS AI Follow-up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
