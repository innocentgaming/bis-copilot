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
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isAdmin, logout } = useAuth();

  const mainNav = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "AI Compliance Assistant", href: "/chat", icon: Bot, badge: "AI" },
    { label: "Conversations", href: "/conversations", icon: History },
    { label: "Standards Catalog", href: "/standards", icon: BookOpen },
    { label: "Hybrid Search", href: "/search", icon: FileSearch },
    { label: "Testing Laboratories", href: "/laboratories", icon: Microscope },
    { label: "Certification Schemes", href: "/certification", icon: ShieldCheck },
  ];

  const adminNav = [
    { label: "Admin Overview", href: "/admin", icon: Layers },
    { label: "Document Ingestion", href: "/admin/documents", icon: FolderLock },
    { label: "Accuracy Evaluation", href: "/admin/evaluation", icon: GraduationCap },
  ];

  const demoNav = [
    { label: "SIH Live Demo Mode", href: "/demo", icon: Presentation, highlight: true },
  ];

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
          IS
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base text-white tracking-wide leading-none">
            BIS Copilot
          </span>
          <span className="text-[11px] text-amber-400 font-medium tracking-tight mt-1">
            Indian Standards AI (SIH 26107)
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Nav */}
        <div>
          <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Compliance Suite
          </div>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Demo Nav */}
        <div>
          <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Presentation
          </div>
          <nav className="space-y-1">
            {demoNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "bg-slate-800/80 text-amber-300 hover:bg-slate-800 hover:text-amber-200 border border-amber-500/30"
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Nav (Only shown to admin) */}
        {isAdmin && (
          <div>
            <div className="px-3 text-[11px] font-semibold tracking-wider text-amber-400 uppercase mb-2 flex items-center justify-between">
              <span>Admin Center</span>
              <span className="text-[10px] bg-amber-500/20 px-1 rounded text-amber-300">RBAC</span>
            </div>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              onClick={onItemClick}
              className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium text-white truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role}
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
              href="/login"
              className="flex-1 py-1.5 text-center bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 py-1.5 text-center bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white rounded-lg transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
