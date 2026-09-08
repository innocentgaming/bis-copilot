"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Layers, Plus, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/components/common/Toast";

export default function AdminServicesPage() {
  const { success: toastSuccess } = useToast();

  const services = [
    {
      name: "Product Certification Scheme (ISI Mark - Scheme I)",
      category: "Product Certification",
      fee: "₹1,000 application + inspection fee",
      time: "30 days",
      status: "ACTIVE"
    },
    {
      name: "Compulsory Registration Scheme (CRS)",
      category: "Registration",
      fee: "₹10,000 / model series",
      time: "20 days",
      status: "ACTIVE"
    },
    {
      name: "Hallmarking Scheme for Gold & Silver",
      category: "Hallmarking",
      fee: "Zero registration / ₹45 per article",
      time: "5 days",
      status: "ACTIVE"
    },
    {
      name: "Foreign Manufacturers Certification Scheme (FMCS)",
      category: "Product Certification",
      fee: "USD 1,000 application",
      time: "60 days",
      status: "ACTIVE"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            BIS Service Catalogue & Portal Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure certification schemes, fee schedules, processing turnarounds, and eligibility criteria.
          </p>
        </div>

        <button
          onClick={() => toastSuccess("Opened new service creation wizard")}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New BIS Service</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Service Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Fee Schedule</th>
                <th className="p-4">Turnaround</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {services.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {s.name}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {s.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                    {s.fee}
                  </td>
                  <td className="p-4 font-semibold text-slate-500">
                    {s.time}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toastSuccess(`Opened edit panel for ${s.name}`)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
                    >
                      Edit Scheme
                    </button>
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
