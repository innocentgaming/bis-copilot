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
  Gem,
  FileText,
  HelpCircle,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISApplication, ComplianceRecord, BISNotification, ComplaintRecord } from "@/types/bis_platform";
import { useAuth } from "@/lib/auth/context";

export default function UserDashboardPage() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<BISApplication[]>([]);
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [notifications, setNotifications] = useState<BISNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [apps, comps, comp, notifs] = await Promise.all([
          platformApi.listApplications(),
          platformApi.listComplaints(),
          platformApi.listComplianceRecords(),
          platformApi.listNotifications({ unread_only: false }),
        ]);
        setApplications(apps);
        setComplaints(comps);
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

  const quickTools = [
    {
      title: "Ask BIS AI",
      desc: "24x7 intelligent guidance with cited standard clauses",
      icon: Bot,
      href: "/assistant",
      color: "from-blue-600 to-indigo-700",
      badge: "AI 24×7",
    },
    {
      title: "Know Your Standards",
      desc: "Instant IS Number lookup across 7,000+ standards",
      icon: BookOpen,
      href: "/standards/search",
      color: "from-indigo-600 to-purple-700",
      badge: "7,000+ IS",
    },
    {
      title: "File Grievance",
      desc: "Lodge quality complaint for fake ISI or defective goods",
      icon: AlertTriangle,
      href: "/complaints",
      color: "from-rose-600 to-red-700",
      badge: "Consumer",
    },
    {
      title: "Verify Hallmark HUID",
      desc: "Check 6-character laser-etched gold purity code",
      icon: Gem,
      href: "/hallmarking",
      color: "from-amber-500 to-yellow-600",
      badge: "Gold Purity",
    },
    {
      title: "Document AI Scanner",
      desc: "Upload PDF circular or spec for checklist extraction",
      icon: Upload,
      href: "/documents",
      color: "from-violet-600 to-purple-700",
      badge: "Smart OCR",
    },
    {
      title: "Certification Guide",
      desc: "Follow the 8-step journey for Scheme-I and CRS",
      icon: ShieldCheck,
      href: "/certifications",
      color: "from-emerald-600 to-teal-700",
      badge: "Step-by-Step",
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 text-white shadow-xl border border-blue-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>BIS Citizen & Industry Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || "Manufacturing Partner"}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitor active licence applications, assess mandatory QCO standards, track filed quality complaints, and consult the 24x7 BIS AI Assistant.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/assistant"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              <span>Ask BIS AI</span>
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
            Filed Complaints
          </span>
          <div className="text-2xl font-extrabold text-rose-600">
            {complaints.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            1 In Investigation
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Standards Indexed
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
            Pending Notifications
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

      {/* Quick Action Tools */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Citizen & Industry Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTools.map((act, i) => {
            const Icon = act.icon;
            return (
              <Link
                key={i}
                href={act.href}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
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
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {act.desc}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Access Service</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Applications & Complaints Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Applications */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Active Licence Applications
            </h3>
            <Link
              href="/applications"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Track All
            </Link>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <Link
                key={app.id}
                href={`/applications?track=${app.application_number}`}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 hover:border-blue-500/40 transition block space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {app.application_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
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

        {/* Complaints Grievances */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Quality Grievances & Complaints
            </h3>
            <Link
              href="/complaints"
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              File New
            </Link>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => (
              <Link
                key={c.id}
                href={`/applications?track=${c.tracking_id}`}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 hover:border-rose-500/40 transition block space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-600">
                    {c.tracking_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {c.status_label}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {c.product_name}
                </p>
                <span className="text-[11px] text-slate-400 block">
                  Category: {c.category.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
