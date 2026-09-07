"use client";

import React from "react";
import Link from "next/link";
import { Globe, LogOut, Mail, Shield, User, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { EmptyState } from "@/components/common/EmptyState";

export default function ProfilePage() {
  const { currentUser, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return (
      <EmptyState
        title="Sign In Required"
        description="Please sign in to view your user profile and permissions."
        icon={<UserCircle className="w-8 h-8 text-amber-500" />}
        action={
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold transition"
          >
            Sign In
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          User Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Identity, verified role permissions, and compliance workspace settings
        </p>
      </div>

      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentUser.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 capitalize border border-amber-200 dark:border-amber-800">
                Role: {currentUser.role}
              </span>
              <span className="text-xs text-slate-400">
                Bureau of Indian Standards
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs space-y-3 pt-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentUser.email}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 font-medium flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Access Scope
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
              {currentUser.role === "admin"
                ? "Full Administrator & Ingestion Access"
                : currentUser.role === "auditor"
                ? "Auditor & Evaluation Access"
                : "Compliance Officer (Inquiry & Search)"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 font-medium flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Language
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
              {currentUser.preferred_language || "EN"}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <Link
            href="/settings"
            className="text-xs font-semibold text-amber-600 hover:underline"
          >
            Adjust Preferences
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
