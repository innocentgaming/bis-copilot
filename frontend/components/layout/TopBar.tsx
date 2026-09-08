"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Languages,
  Menu,
  Search,
  Server,
  ShieldAlert,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface TopBarProps {
  onMenuClick: () => void;
  selectedLanguage: "en" | "hi" | "mr";
  onLanguageChange: (lang: "en" | "hi" | "mr") => void;
}

export function TopBar({
  onMenuClick,
  selectedLanguage,
  onLanguageChange,
}: TopBarProps) {
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<"ok" | "degraded" | "checking">("checking");

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await apiClient.get<{ status: string; database: string }>("/health");
        if (res.database === "ok" || res.database === "healthy") {
          setDbStatus("ok");
        } else {
          setDbStatus("degraded");
        }
      } catch {
        setDbStatus("degraded");
      }
    }
    checkHealth();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span className="text-amber-600 font-bold">Bureau of Indian Standards</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>SIH Problem Statement 26107</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Status indicator */}
        <div
          title={
            dbStatus === "ok"
              ? "FastAPI & PostgreSQL vector database online"
              : "Backend active (Database in fallback / offline state)"
          }
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus === "ok"
                ? "bg-emerald-500"
                : dbStatus === "degraded"
                ? "bg-amber-500 animate-pulse"
                : "bg-slate-400"
            }`}
          />
          <span className="text-[11px]">
            {dbStatus === "ok"
              ? "System Online"
              : dbStatus === "degraded"
              ? "Degraded (Mock/Offline)"
              : "Checking..."}
          </span>
        </div>

        {/* Search shortcut button */}
        <button
          onClick={() => router.push("/search")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:hover:text-slate-200 transition bg-slate-50 dark:bg-slate-800/50"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search standards...</span>
        </button>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <button
            onClick={() => onLanguageChange("en")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition ${
              selectedLanguage === "en"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange("hi")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition ${
              selectedLanguage === "hi"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => onLanguageChange("mr")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition ${
              selectedLanguage === "mr"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            मराठी
          </button>
        </div>
      </div>
    </header>
  );
}
