"use client";

import React, { useState } from "react";
import { HelpCircle, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/common/Toast";

export default function AdminFAQsPage() {
  const { success: toastSuccess } = useToast();

  const faqs = [
    {
      id: 1,
      category: "ISI Mark & Certification",
      question: "How do I apply for an ISI Mark licence for my manufacturing unit?",
      published: true
    },
    {
      id: 2,
      category: "Compulsory Registration (CRS)",
      question: "What is the difference between ISI Mark and Compulsory Registration Scheme (CRS)?",
      published: true
    },
    {
      id: 3,
      category: "Hallmarking",
      question: "What is HUID and why is it mandatory on gold jewellery?",
      published: true
    },
    {
      id: 4,
      category: "MSME Concessions",
      question: "Are there fee concessions for Startups, Women Entrepreneurs, and Micro Enterprises?",
      published: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            FAQ Knowledge Base Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative questions and answers indexed for AI Assistant grounding and public citizen search.
          </p>
        </div>

        <button
          onClick={() => toastSuccess("Opened FAQ editor")}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Question</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {faqs.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
                    {f.question}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {f.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                      Published
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toastSuccess("Opened FAQ edit panel")}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
                    >
                      Edit
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
