"use client";

import React, { useState } from "react";
import { Globe, Moon, Server, Shield, Sun } from "lucide-react";
import { useToast } from "@/components/common/Toast";

export default function SettingsPage() {
  const { success } = useToast();
  const [lang, setLang] = useState("en");

  const handleSave = () => {
    success("Preferences saved.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Multilingual response controls, display theme, and backend connectivity parameters
        </p>
      </div>

      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600" />
            Default Language
          </label>
          <p className="text-xs text-slate-500">
            Select preferred language for AI responses. Official standard identifiers (`IS \d+:\d{4}`), clause numbers, and engineering units remain standardized in Latin/English characters.
          </p>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          >
            <option value="en">English (Official Standards)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        {/* Backend Endpoint Status */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-600" />
            Backend API Endpoint
          </label>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300">
            {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"}
          </div>
          <span className="text-[11px] text-slate-400 block">
            Configured via <code>NEXT_PUBLIC_API_BASE_URL</code> in <code>.env.local</code>.
          </span>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
