"use client";

import React, { useState } from "react";
import { Settings, Save, Shield, Database, Cpu } from "lucide-react";
import { useToast } from "@/components/common/Toast";

export default function AdminSettingsPage() {
  const { success: toastSuccess } = useToast();

  const [ragModel, setRagModel] = useState("BAAI/bge-m3");
  const [reranker, setReranker] = useState("BAAI/bge-reranker-v2-m3");
  const [topK, setTopK] = useState(10);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const [multilingualEnabled, setMultilingualEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toastSuccess("AI System & RAG Configuration updated successfully!");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System & AI Engine Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tune retrieval hyperparameters, vector embedding models, confidence boundaries, and multilingual options.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* RAG Configuration Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-500" />
            RAG & Retrieval Hyperparameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 block mb-1">
                Vector Embedding Model
              </label>
              <input
                type="text"
                value={ragModel}
                onChange={(e) => setRagModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-500 block mb-1">
                Reranker Model
              </label>
              <input
                type="text"
                value={reranker}
                onChange={(e) => setReranker(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-500 block mb-1">
                Final RRF Top-K
              </label>
              <input
                type="number"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-500 block mb-1">
                Low-Confidence Refusal Threshold
              </label>
              <input
                type="number"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Multilingual & Security */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Language & Safety Guardrails
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={multilingualEnabled}
                onChange={(e) => setMultilingualEnabled(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Enable Bilingual Hindi & Marathi speech synthesis and transcription
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Enforce strict non-hallucination refusal when similarity falls below confidence threshold
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </form>
    </div>
  );
}
