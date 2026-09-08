"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Filter,
  Check,
  ArrowRight,
  ShieldAlert,
  Clock,
  BookOpen,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISNotification } from "@/types/bis_platform";
import { useToast } from "@/components/common/Toast";
import { Footer } from "@/components/layout/Footer";

export default function NotificationsCenterPage() {
  const [notifications, setNotifications] = useState<BISNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { success: toastSuccess } = useToast();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await platformApi.listNotifications({
        type: filterType,
        unread_only: unreadOnly,
      });
      setNotifications(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filterType, unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await platformApi.markNotificationRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      toastSuccess("Notification marked as read");
    } catch {
      // error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await platformApi.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      toastSuccess("All notifications marked as read");
    } catch {
      // error
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "APPLICATION":
        return <Clock className="w-4 h-4 text-emerald-500" />;
      case "STANDARD":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "COMPLIANCE":
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case "CERTIFICATE":
        return <FileCheck2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
            <Bell className="w-3.5 h-3.5" />
            Notification Center
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Announcements & Compliance Alerts
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Real-time updates on application milestones, Gazette QCO orders, standard revisions, and licence renewals.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition self-start flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "APPLICATION", "STANDARD", "COMPLIANCE", "CERTIFICATE"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === t
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t === "all" ? "All Alerts" : t}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
          />
          <span>Unread Only</span>
        </label>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No notifications matching the selected filter
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                !n.is_read
                  ? "border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getIconForType(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {n.title}
                    </h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    {n.message}
                  </p>
                  <span className="text-[11px] font-mono text-slate-400 block pt-1">
                    {n.created_at}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {n.link_url && (
                  <Link
                    href={n.link_url}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-emerald-500" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}
