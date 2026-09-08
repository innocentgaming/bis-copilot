"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Languages,
  Menu,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { IndianLanguageCode, SUPPORTED_LANGUAGES } from "@/types/bis_platform";

interface TopBarProps {
  onMenuClick: () => void;
  selectedLanguage: IndianLanguageCode;
  onLanguageChange: (lang: IndianLanguageCode) => void;
}

export function TopBar({
  onMenuClick,
  selectedLanguage,
  onLanguageChange,
}: TopBarProps) {
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<"ok" | "degraded" | "checking">("checking");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

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

  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between z-20 shrink-0 sticky top-0 shadow-xs">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-900 to-indigo-800 text-white flex items-center justify-center font-black text-sm shadow-md">
            BIS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                BIS AI
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                GOV ASSIST
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5 leading-none">
              Standards & Consumer Assistance
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Desktop Navigation shortcuts */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <Link href="/" className="hover:text-blue-600 transition">
          Home
        </Link>
        <Link href="/assistant" className="hover:text-blue-600 transition flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Assistant
        </Link>
        <Link href="/standards/search" className="hover:text-blue-600 transition">
          Standards Search
        </Link>
        <Link href="/services" className="hover:text-blue-600 transition">
          BIS Services
        </Link>
        <Link href="/hallmarking" className="hover:text-blue-600 transition">
          Hallmarking
        </Link>
        <Link href="/consumer-help" className="hover:text-blue-600 transition">
          Consumer Help
        </Link>
        <Link href="/applications" className="hover:text-blue-600 transition">
          Track Status
        </Link>
      </nav>

      {/* Right: Actions, Language & Ask AI Button */}
      <div className="flex items-center gap-2.5">
        {/* System online indicator */}
        <div
          title={
            dbStatus === "ok"
              ? "FastAPI & 7,000 Standards Database online"
              : "Backend active (Database in fallback / offline state)"
          }
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
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
            {dbStatus === "ok" ? "7k+ Standards Live" : "Active"}
          </span>
        </div>

        {/* 11 Indian Languages Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{activeLangObj.nativeLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <span className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Indian Language
              </span>
              <div className="max-h-60 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                      selectedLanguage === lang.code
                        ? "text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/40"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{lang.nativeLabel}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {lang.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary "Ask BIS AI" Button */}
        <Link
          href="/assistant"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white font-bold text-xs shadow-sm hover:opacity-95 hover:shadow transition transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Ask BIS AI</span>
        </Link>
      </div>
    </header>
  );
}
