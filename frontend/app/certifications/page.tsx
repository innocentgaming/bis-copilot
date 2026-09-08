"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  FileText,
  Microscope,
  Send,
  Award,
  Layers,
  HelpCircle,
} from "lucide-react";

interface StepConfig {
  stepNumber: number;
  title: string;
  subtitle: string;
  stageName: string;
}

const STAGES = [
  "Product",
  "Standard",
  "Documents",
  "Testing",
  "Application",
  "Approval",
];

const CATEGORIES = [
  { id: "electrical", name: "Electrical Equipment & Appliances", standardExample: "IS 302:Part 1 / IS 1293" },
  { id: "electronics", name: "Electronics & IT Goods (CRS)", standardExample: "IS 13252:Part 1 / IS 616" },
  { id: "chemicals", name: "Chemicals, Polymers & Paints", standardExample: "IS 101 / IS 2932" },
  { id: "food", name: "Food, Agriculture & Beverages", standardExample: "IS 14543 (Packaged Water) / IS 11536" },
  { id: "metals", name: "Steel & Metallurgical Products", standardExample: "IS 1786 (TMT Bars) / IS 2062" },
  { id: "medical", name: "Medical Devices & Hospital Planning", standardExample: "IS 13450 / IS 13422" },
];

export default function CertificationsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("electrical");
  const [productName, setProductName] = useState("Electric Iron / Toaster");
  const [applicableStandard, setApplicableStandard] = useState("IS 302:Part 1:2008");

  const getStageIndex = (step: number): number => {
    if (step <= 2) return 0; // Product
    if (step === 3) return 1; // Standard
    if (step === 4) return 2; // Documents
    if (step === 5) return 3; // Testing
    if (step === 6 || step === 7) return 4; // Application & Inspection
    return 5; // Approval
  };

  const currentStageIndex = getStageIndex(currentStep);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/20">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Interactive BIS Certification Guide</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          8-Step BIS Certification Roadmap
        </h1>
        <p className="text-xs md:text-sm text-blue-100 max-w-2xl leading-relaxed">
          From product classification to ISI mark grant — follow the standard conformity assessment procedure under Scheme-I and CRS.
        </p>
      </div>

      {/* Progress Bar Ribbon */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Step {currentStep} of 8</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
            Stage: {STAGES[currentStageIndex]}
          </span>
        </div>

        {/* 6 Stage Chips */}
        <div className="grid grid-cols-6 gap-2">
          {STAGES.map((stage, idx) => (
            <div
              key={stage}
              className={`p-2 rounded-xl text-center text-[10px] md:text-xs font-bold transition ${
                idx === currentStageIndex
                  ? "bg-blue-600 text-white shadow-sm"
                  : idx < currentStageIndex
                  ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {stage}
            </div>
          ))}
        </div>
      </div>

      {/* Step Contents Card */}
      <div className="p-6 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        {/* STEP 1: Product Category */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 1: Select Your Product Category
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose the industry division corresponding to your manufactured goods.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setApplicableStandard(cat.standardExample.split(" ")[0]);
                  }}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedCategory === cat.id
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      e.g. {cat.standardExample}
                    </span>
                  </div>
                  {selectedCategory === cat.id && (
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Product Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 2: Specify Product Specifications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Define the model scope, technical ratings, and target manufacturing unit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product / Commercial Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Applicable Scheme
                </label>
                <select className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option>Scheme-I (Standard ISI Mark)</option>
                  <option>Compulsory Registration Scheme (CRS)</option>
                  <option>Foreign Manufacturers Scheme (FMCS)</option>
                  <option>ECO Mark Scheme</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Identify Indian Standard */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 3: Applicable Indian Standard (IS)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every manufactured article must comply with the specific gazetted standard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Identified Standard for {productName}</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {applicableStandard}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Safety of household and similar electrical appliances — General requirements, insulation resistance, electric strength, and mechanical safety parameters.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Testing Requirements */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 4: Check Mandatory Testing Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your factory in-house lab or third-party BIS-recognized lab must test against these parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Electric Strength & Insulation Test", desc: "Dielectric withstand at 1500V AC." },
                { title: "Temperature Rise & Heating", desc: "Thermal endurance under continuous rated operation." },
                { title: "Leakage Current & Moisture Resistance", desc: "Verification against tropical humidity ingress." },
                { title: "Mechanical Endurance & Impact", desc: "Drop impact resistance and cord anchor pull test." },
              ].map((test, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {test.title}
                  </span>
                  <span className="text-slate-500">{test.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Required Documents */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 5: Prepare Application Documentation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Assemble these mandatory records prior to online portal filing.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                "Proof of factory establishment (MSME Udyam / Factory License / GST Certificate).",
                "Complete list of manufacturing machinery and testing equipment with calibration records.",
                "Consent from competent technical personnel / in-house chemist.",
                "Schematic diagram / factory layout indicating raw material and finished goods storage.",
                "Test report from a BIS-approved laboratory (Option 2 - Simplified Procedure).",
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Application Submission */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 6: Submit Online via Manakonline Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Lodge Form-I with application fees (₹1,000) and audit inspection fees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Log into the official <strong>Manakonline (e-BIS)</strong> portal, select Product Certification (Scheme-I), fill in the company profile, attach test documents, and remit statutory application charges.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.manakonline.in"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition inline-flex items-center gap-2"
                >
                  <span>Go to Manakonline Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Factory Inspection & Sampling */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 7: Factory Audit & Sample Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                A BIS technical inspecting officer visits the factory premises.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  1. Premises Audit
                </span>
                <span className="text-slate-500">Inspection of hygiene, quality control, and safety infrastructure.</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  2. In-house Testing
                </span>
                <span className="text-slate-500">Auditor witnesses test runs on calibrated factory apparatus.</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  3. Sample Sealing
                </span>
                <span className="text-slate-500">Independent counter-samples sealed for BIS referral labs.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Certification Grant */}
        {currentStep === 8 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Step 8: Grant of ISI Licence (CM/L Number)
              </h2>
              <p className="text-xs text-slate-500">
                Upon passing lab tests and verification, BIS issues the 7-digit Certification Marks Licence (CM/L-XXXXXXX).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 max-w-lg mx-auto text-xs text-left space-y-2">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
                Your Rights & Obligations:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-emerald-800 dark:text-emerald-200">
                <li>Right to apply the official ISI Mark with your unique CM/L license number.</li>
                <li>Maintain Scheme of Testing & Inspection (STI) records for every production batch.</li>
                <li>Licence remains valid for 1 to 2 years and can be renewed online.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer Navigation & "Ask BIS AI about this step" */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            )}
            {currentStep < 8 && (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 8))}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Link
            href={`/assistant?q=${encodeURIComponent(`Explain Step ${currentStep} of BIS Certification for ${productName}`)}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-500/20 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Ask BIS AI about this step</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
