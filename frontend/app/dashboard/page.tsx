"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  BookOpen,
  Layers,
  FileSearch,
  Microscope,
  FileCheck2,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Bell,
  Upload,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISApplication, ComplianceRecord, BISNotification } from "@/types/bis_platform";
import { useAuth } from "@/lib/auth/context";
import { Footer } from "@/components/layout/Footer";

export default function UserDashboardPage() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<BISApplication[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [notifications, setNotifications] = useState<BISNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [apps, comp, notifs] = await Promise.all([
          platformApi.listApplications(),
          platformApi.listComplianceRecords(),
          platformApi.listNotifications({ unread_only: false }),
        ]);
        setApplications(apps);
        setCompliance(comp);
        setNotifications(notifs);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const quickActions = [
    {
      title: "Ask AI Assistant",
      desc: "24x7 intelligent guidance with cited standard clauses",
      icon: Bot,
      href: "/assistant",
      color: "from-amber-500 to-amber-700",
      badge: "AI 24×7",
    },
    {
      title: "Know Your Standards",
      desc: "Instant IS Number lookup across 7,000+ standards",
      icon: BookOpen,
      href: "/standards",
      color: "from-blue-600 to-indigo-700",
      badge: "7,000+ IS",
    },
    {
      title: "Track Application",
      desc: "Live status timeline for ISI and CRS licences",
      icon: Clock,
      href: "/applications",
      color: "from-emerald-600 to-teal-700",
      badge: "Live Status",
    },
    {
      title: "Document AI Scanner",
      desc: "Upload PDF / spec for automatic compliance breakdown",
      icon: Upload,
      href: "/documents",
      color: "from-violet-600 to-purple-700",
      badge: "Smart OCR",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 text-white shadow-xl border border-slate-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              BIS Digital Portal Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || "Manufacturing Partner"}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitor active licence applications, assess mandatory QCO standards, consult your AI Compliance Assistant, and access 7,000+ Indian Standards.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/assistant"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Applications
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {applications.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            1 Granted • 2 In Scrutiny
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Average Compliance Score
          </span>
          <div className="text-2xl font-extrabold text-amber-500">
            78%
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            3 Monitored Products
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Standards Indexed
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            7,000+
          </div>
          <span className="text-[11px] text-blue-500 font-medium">
            Across 14 BIS Divisions
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Unread Notifications
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Bell className="w-5 h-5 text-amber-500" />
            {notifications.filter((n) => !n.is_read).length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Action items pending
          </span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Quick Actions & Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((act, i) => {
            const Icon = act.icon;
            return (
              <Link
                key={i}
                href={act.href}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {act.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {act.desc}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Applications & Recent Notifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Applications */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Active Applications
            </h3>
            <Link
              href="/applications"
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.application_number}`}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-amber-500/40 transition block space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {app.application_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {app.current_status}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {app.service_name}
                </p>
                <span className="text-[11px] text-slate-400 block font-mono">
                  {app.standard_number || "General"}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Recent Announcements & Alerts
            </h3>
            <Link
              href="/notifications"
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Notification Center
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {n.created_at}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
