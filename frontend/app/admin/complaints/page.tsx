"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  Eye,
  FileText,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { ComplaintRecord } from "@/types/bis_platform";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const list = await platformApi.listComplaints({
          category: filterCategory === "all" ? undefined : filterCategory,
        });
        setComplaints(list);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filterCategory]);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Consumer Complaints & Grievance Administration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforcement investigation cell and violation audit queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="fake_isi">Fake ISI Mark</option>
            <option value="hallmark_issue">Hallmarking Dispute</option>
            <option value="defective_product">Defective Product</option>
            <option value="misleading_claim">Misleading Claim</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Tracking ID</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Complainant</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-rose-600">
                    {c.tracking_id}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {c.product_name}
                  </td>
                  <td className="p-4 capitalize">
                    {c.category.replace("_", " ")}
                  </td>
                  <td className="p-4">
                    {c.complainant_name}
                    <span className="text-[10px] text-slate-400 block">{c.complainant_email}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      {c.status_label}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/applications?track=${c.tracking_id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
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
