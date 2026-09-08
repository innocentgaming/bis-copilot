"use client";

import React, { useState } from "react";
import { Bell, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/common/Toast";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ANNOUNCEMENT");
  const [priority, setPriority] = useState("NORMAL");

  const { success: toastSuccess } = useToast();

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    toastSuccess(`Broadcast alert sent to all registered manufacturers & users!`);
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Broadcast Notifications & Gazette Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch regulatory alerts, Quality Control Order deadlines, and system announcements to stakeholders.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Create New Broadcast Alert
        </h3>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-500 block mb-1">
              Alert Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mandatory QCO Enforcement Date Announced for Solar PV"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-500 block mb-1">
                Notification Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ANNOUNCEMENT">General Announcement</option>
                <option value="COMPLIANCE">Mandatory Compliance / QCO</option>
                <option value="STANDARD">Standard Revision / Amendment</option>
                <option value="APPLICATION">Application Processing</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-500 block mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High (Urgent Compliance)</option>
                <option value="LOW">Informational</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-500 block mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide detailed summary, affected standard numbers, and action required..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Notification</span>
          </button>
        </form>
      </div>
    </div>
  );
}
