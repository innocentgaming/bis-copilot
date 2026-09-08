"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Gem,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  MapPin,
  ChevronRight,
  Info,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { HUIDVerificationResult, AHCCenter } from "@/types/bis_platform";

export default function HallmarkingPage() {
  const [huidInput, setHuidInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HUIDVerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AHC search
  const [stateFilter, setStateFilter] = useState("");
  const [centers, setCenters] = useState<AHCCenter[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!huidInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await platformApi.verifyHUID(huidInput.trim());
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify HUID. Please check code format.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCenters = async () => {
    setLoadingCenters(true);
    try {
      const list = await platformApi.listAHCCenters({ state: stateFilter || undefined });
      setCenters(list);
    } catch {
      // Fallback
    } finally {
      setLoadingCenters(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 p-8 md:p-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-100 border border-white/30">
            <Gem className="w-3.5 h-3.5 text-yellow-300" />
            <span>BIS Hallmarking & Precious Metals Division</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Hallmark Unique Identification (HUID) Verifier
          </h1>
          <p className="text-sm md:text-base text-amber-100 leading-relaxed">
            Verify the authenticity, purity, and authorized Assaying & Hallmarking Centre (AHC) for gold and silver jewelry stamped under Indian Standards IS 1417 & IS 2112.
          </p>
        </div>
      </div>

      {/* Main Grid: HUID Checker & Quick Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* HUID Verifier Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Check Hallmark (HUID) Authenticity
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-character alphanumeric code laser-etched on your gold or silver jewelry.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  6-Digit Alphanumeric HUID Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={huidInput}
                    onChange={(e) => setHuidInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AB1234, H7X892, SL5591"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-lg tracking-widest focus:outline-none focus:border-amber-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || !huidInput.trim()}
                    className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold text-xs shadow hover:opacity-95 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {loading ? "Verifying..." : "Verify Hallmark"}
                  </button>
                </div>
              </div>

              {/* Sample Quick Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400">Sample HUIDs:</span>
                {["AB1234", "H7X892", "SL5591"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setHuidInput(code);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold hover:bg-amber-500/20 transition"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </form>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Verification Result Display */}
            {result && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in-50">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                        {result.status}
                      </span>
                      <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                        HUID: {result.huid}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold">
                    {result.applicable_standard}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Article Description</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">
                      {result.article_type || "Jewelry Item"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Purity / Fineness</span>
                    <strong className="text-amber-600 dark:text-amber-400 text-sm">
                      {result.purity_karat} ({result.purity_fineness} Fineness)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Assaying Centre (AHC)</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {result.ahc_center_name} ({result.ahc_center_number})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Jeweler Registration</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {result.jeweler_name}
                    </strong>
                  </div>
                </div>

                {/* Consumer Guidance */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block">
                    Consumer Protection Guidance:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-amber-800 dark:text-amber-200">
                    {result.consumer_guidance.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href={`/assistant?q=${encodeURIComponent(`Explain hallmarking requirements for ${result.purity_karat || "gold"}`)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask BIS AI about this standard</span>
                  </Link>
                  <Link
                    href="/complaints"
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report hallmark dispute</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3 Mandatory Hallmark Marks Explainer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              The 3 Mandatory Hallmark Marks
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Under BIS (Hallmarking) Regulations, every piece of gold jewelry sold in India must contain all three distinct markings:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-950 border border-amber-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    BIS Standard Mark (Triangle Logo)
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-8">
                  Indicates that the precious metal piece conforms to Indian Standards (IS 1417).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-950 border border-amber-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Purity in Karat & Fineness
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-8">
                  Example: <strong>22K916</strong> (91.6% pure), <strong>18K750</strong> (75.0% pure), <strong>14K585</strong> (58.5% pure).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-950 border border-amber-200/60 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    6-Digit Alphanumeric HUID
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-8">
                  A unique alphanumeric identification stamped on every individual article at the AHC.
                </p>
              </div>
            </div>

            {/* Consumer Tip */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Consumer Right:</strong> Consumers can get any hallmarked jewelry piece independently tested at any recognized AHC for ₹45.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gold Purity & Standards Reference Table */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Official Gold & Silver Karatage Standards
          </h3>
          <p className="text-xs text-slate-500">
            Conforming to IS 1417:2016 (Gold) and IS 2112:2014 (Silver)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3">Metal Type</th>
                <th className="p-3">Karat / Category</th>
                <th className="p-3">Fineness (Parts per 1000)</th>
                <th className="p-3">Standard Marking</th>
                <th className="p-3">Common Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3 font-bold text-amber-600">Gold</td>
                <td className="p-3">24 Karat</td>
                <td className="p-3">999</td>
                <td className="p-3 font-mono font-bold">24K999</td>
                <td className="p-3">Gold Bullion Coins & Minted Bars</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-600">Gold</td>
                <td className="p-3">22 Karat</td>
                <td className="p-3">916</td>
                <td className="p-3 font-mono font-bold">22K916</td>
                <td className="p-3">Traditional Indian Wedding Jewelry</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-600">Gold</td>
                <td className="p-3">20 Karat</td>
                <td className="p-3">833</td>
                <td className="p-3 font-mono font-bold">20K833</td>
                <td className="p-3">Intricate Handcrafted Ornaments</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-600">Gold</td>
                <td className="p-3">18 Karat</td>
                <td className="p-3">750</td>
                <td className="p-3 font-mono font-bold">18K750</td>
                <td className="p-3">Diamond & Gemstone Studded Jewelry</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-600">Gold</td>
                <td className="p-3">14 Karat</td>
                <td className="p-3">585</td>
                <td className="p-3 font-mono font-bold">14K585</td>
                <td className="p-3">Modern Lightweight Daily Wear</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-400">Silver</td>
                <td className="p-3">Sterling Silver</td>
                <td className="p-3">925</td>
                <td className="p-3 font-mono font-bold">925</td>
                <td className="p-3">Silver Ornaments & Tableware</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
