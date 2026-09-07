"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BookOpen,
  CheckCircle,
  Database,
  FileCheck,
  FolderLock,
  GraduationCap,
  Layers,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  Users,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { AdminStatisticsResponse, SystemInfoResponse } from "@/types/admin";
import { CardSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/components/common/Toast";

export default function AdminDashboardPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const { error: toastError } = useToast();

  const [stats, setStats] = useState<AdminStatisticsResponse | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated || !isAdmin) {
        setLoading(false);
        return;
      }
      try {
        const [sRes, sysRes] = await Promise.allSettled([
          adminApi.getStatistics(),
          adminApi.getSystemInfo(),
        ]);
        if (sRes.status === "fulfilled") setStats(sRes.value);
        if (sysRes.status === "fulfilled") setSystemInfo(sysRes.value);
      } catch {
        toastError("Failed to fetch administrative telemetry.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <EmptyState
        title="Admin Access Required"
        description="You must be signed in with an administrator role to access system oversight telemetry."
        icon={<FolderLock className="w-8 h-8 text-amber-600" />}
        action={
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold transition"
          >
            <span>Sign In as Admin</span>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            System Administration & Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time entity counts, knowledge chunk volumes, user feedback metrics, and ingestion controls
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/documents"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
          >
            <FolderLock className="w-4 h-4" />
            <span>Document Ingestion</span>
          </Link>
          <Link
            href="/admin/evaluation"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Evaluation</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : stats ? (
        <>
          {/* Knowledge Volumes Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Knowledge Base Assets (PostgreSQL + pgvector)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-amber-600">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-xs font-bold">IS Catalog</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.volumes.standards}
                </div>
                <span className="text-[11px] text-slate-400">Indian Standards</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-blue-600">
                  <Layers className="w-5 h-5" />
                  <span className="text-xs font-bold">Hierarchy</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.volumes.clauses}
                </div>
                <span className="text-[11px] text-slate-400">Structured Clauses</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-emerald-600">
                  <Database className="w-5 h-5" />
                  <span className="text-xs font-bold">HNSW Vector</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.volumes.chunks}
                </div>
                <span className="text-[11px] text-slate-400">Embedded Chunks</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-purple-600">
                  <FolderLock className="w-5 h-5" />
                  <span className="text-xs font-bold">Sources</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {stats.volumes.documents}
                </div>
                <span className="text-[11px] text-slate-400">
                  PDF Documents ({stats.volumes.active_documents} active)
                </span>
              </div>
            </div>
          </div>

          {/* User Activity & Quality Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                User Inquiries & Volume
              </span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Registered Users</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    {stats.volumes.users}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Conversations</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    {stats.volumes.conversations}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Total Messages</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    {stats.volumes.messages}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                Answer Quality Feedback
              </span>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Satisfaction</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">
                    {Math.round(stats.feedback.satisfaction_rate * 100)}%
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Positive (+1)</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">
                    {stats.feedback.positive}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Negative (-1)</span>
                  <span className="text-xl font-black text-rose-500 mt-1 block">
                    {stats.feedback.negative}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
