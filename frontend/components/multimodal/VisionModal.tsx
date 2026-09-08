"use client";

import React, { useState } from "react";
import { Camera, Upload, CheckCircle2, AlertCircle, Sparkles, X, RefreshCw, FileText } from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { VisionQueryResponse } from "@/types/bis_platform";

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStandard?: (std: string) => void;
}

export function VisionModal({ isOpen, onClose, onSelectStandard }: VisionModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<VisionQueryResponse | null>(null);

  if (!isOpen) return null;

  const handleSimulateAnalysis = async (imageType: string, filename: string) => {
    setSelectedFile(filename);
    setLoading(true);
    setVisionResult(null);
    try {
      const res = await platformApi.analyzeVision({
        image_name: filename,
        image_type: imageType,
      });
      setVisionResult(res);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Image & Product Label AI Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Upload or scan product packaging, ISI mark, or Gold Hallmark certificate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset Sample Images */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Try Sample Product Labels & Markings
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleSimulateAnalysis("product_label", "electric_plug_isi_label.jpg")
                }
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left transition bg-slate-50/50 dark:bg-slate-800/40"
              >
                <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                  ISI Mark Plug Label
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  IS 1293 Wiring Socket
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSimulateAnalysis("hallmark", "gold_jewellery_huid_stamp.png")
                }
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left transition bg-slate-50/50 dark:bg-slate-800/40"
              >
                <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                  Gold Hallmark HUID
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  IS 1417 22K916 Purity
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSimulateAnalysis("crs_label", "smart_battery_crs_plate.jpg")
                }
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left transition bg-slate-50/50 dark:bg-slate-800/40"
              >
                <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                  CRS Electronics Label
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  IS 16046 Battery Pack
                </span>
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <span>Analyzing image features, text contours, and standard marks...</span>
            </div>
          )}

          {/* Results */}
          {visionResult && !loading && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Detected Target
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {visionResult.detected_type}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {visionResult.compliance_status}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-800 dark:text-amber-300">
                Possible Mapped Standard:{" "}
                <strong className="font-mono text-amber-600 dark:text-amber-400">
                  {visionResult.possible_standard}
                </strong>
              </div>

              {/* Detected Features */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Visual Findings
                </span>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {visionResult.detected_features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Recommended Verification Steps
                </span>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {visionResult.recommended_next_steps.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-800">
                {visionResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
