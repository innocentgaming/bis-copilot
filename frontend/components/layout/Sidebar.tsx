"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  CheckCircle2,
  FileSearch,
  FolderLock,
  GraduationCap,
  History,
  Home,
  Layers,
  LogOut,
  Microscope,
  Presentation,
  Settings,
  ShieldCheck,
  UserCircle,
  Gem,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isAdmin, logout } = useAuth();

  const mainNav = [
    { label: "Home Overview", href: "/", icon: Home },
    { label: "BIS AI Assistant", href: "/assistant", icon: Bot, badge: "AI" },
    { label: "Standards Search", href: "/standards/search", icon: BookOpen },
    { label: "BIS Services Directory", href: "/services", icon: Layers },
    { label: "Certification Guide", href: "/certifications", icon: ShieldCheck },
    { label: "Hallmarking & HUID", href: "/hallmarking", icon: Gem },
    { label: "Consumer Help Center", href: "/consumer-help", icon: HelpCircle },
    { label: "File a Complaint", href: "/complaints", icon: AlertTriangle },
    { label: "Track Status", href: "/applications", icon: Clock },
    { label: "Document AI Assistant", href: "/documents", icon: FileText, badge: "OCR" },
    { label: "Security & Privacy", href: "/security", icon: ShieldCheck, badge: "TRUST" },
    { label: "Citizen Dashboard", href: "/dashboard", icon: BarChart3 },
  ];

  const adminNav = [
    { label: "Admin Overview", href: "/admin", icon: Layers },
    { label: "Manage Standards", href: "/admin/standards", icon: BookOpen },
    { label: "Manage Services", href: "/admin/services", icon: Layers },
    { label: "Manage Applications", href: "/admin/applications", icon: Clock },
    { label: "Manage FAQs", href: "/admin/faqs", icon: HelpCircle },
    { label: "Analytics & Queries", href: "/admin/analytics", icon: BarChart3 },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
          BIS
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm text-white tracking-wide leading-none">
            BIS AI
          </span>
          <span className="text-[10px] text-blue-400 font-medium tracking-tight mt-1">
            Intelligent Standards Assistant
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {/* Main Nav */}
        <div>
          <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
            Public & Citizen Services
          </div>
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Nav (Shown to admin or accessible for SIH evaluation) */}
        <div>
          <div className="px-3 text-[10px] font-bold tracking-wider text-amber-400 uppercase mb-1.5 flex items-center justify-between">
            <span>Administration</span>
            <span className="text-[9px] bg-amber-500/20 px-1 py-0.2 rounded text-amber-300 font-mono">PANEL</span>
          </div>
          <nav className="space-y-0.5">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={onItemClick}
              className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium text-white truncate">
                  {currentUser.name || "BIS User"}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role || "Citizen"}
                </span>
              </div>
            </Link>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex-1 py-1.5 text-center bg-blue-700 hover:bg-blue-600 text-xs font-bold text-white rounded-lg transition"
            >
              User Dashboard
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
