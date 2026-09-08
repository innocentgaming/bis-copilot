"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Plus, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/components/common/Toast";

export default function AdminStandardsPage() {
  const [search, setSearch] = useState("");
  const { success: toastSuccess } = useToast();

  const standardsSample = [
    {
      is_number: "IS 1910-6:1993",
      title: "Code of practice",
      section: "Chemical",
      year_notified: 1993,
      status: "Under Revision",
      applicable_to: "rubber products"
    },
    {
      is_number: "IS 356-3:1990",
      title: "Quality requirem",
      section: "Mechanical Engineering",
      year_notified: 1990,
      status: "Active",
      applicable_to: "bearings"
    },
    {
      is_number: "IS 3790-6:2017",
      title: "Performance req",
      section: "Medical Equipment",
      year_notified: 2017,
      status: "Active",
      applicable_to: "diagnostic reagents"
    },
    {
      is_number: "IS 1258-3:1990",
      title: "Quality requirem",
      section: "Production and General",
      year_notified: 1990,
      status: "Active",
      applicable_to: "fire extinguishers"
    },
    {
      is_number: "IS 4044-4:2013",
      title: "Classification an",
      section: "Civil Engineering",
      year_notified: 2013,
      status: "Active",
      applicable_to: "bitumen for roads"
    }
  ];

  const filtered = standardsSample.filter(
    (s) =>
      s.is_number.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.section.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Indian Standards Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, re-index, and manage 7,000+ BIS Indian Standards (IS), sectional divisions, and QCO mandates.
          </p>
        </div>

        <button
          onClick={() => toastSuccess("Initiated standard index synchronization")}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync & Re-index Store</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter standards by IS number or section..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">IS Standard</th>
                <th className="p-4">Title</th>
                <th className="p-4">Sectional Division</th>
                <th className="p-4">Year</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applicability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                    {s.is_number}
                  </td>
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                    {s.title}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {s.section}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-500">
                    {s.year_notified}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 truncate max-w-xs">
                    {s.applicable_to}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/standards?search=${encodeURIComponent(s.is_number)}`}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
