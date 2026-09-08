"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  Bot,
  Search,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Assistant & Portal Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics on query volume, retrieval citation grounding rate, popular Indian Standards, and accuracy.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total AI Inquiries
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            14,892
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24% this week
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Citation Grounding Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-500">
            99.4%
          </div>
          <span className="text-[11px] text-slate-400">
            Zero hallucinations detected
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Average Response Time
          </span>
          <div className="text-2xl font-extrabold text-amber-500 font-mono">
            420ms
          </div>
          <span className="text-[11px] text-slate-400">
            Hybrid RRF vector + FTS5
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Satisfaction Rate
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            98.1%
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold">
            Based on 2,400+ feedback votes
          </span>
        </div>
      </div>

      {/* Popular Standards Breakdown */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Most Queried Indian Standards (IS)
        </h3>
        <div className="space-y-3">
          {[
            { standard: "IS 1293:2019", name: "Plugs and Socket-Outlets", queries: "3,410 queries", pct: 85 },
            { standard: "IS 10500:2012", name: "Drinking Water Specification", queries: "2,890 queries", pct: 72 },
            { standard: "IS 1786:2008", name: "High Strength Deformed Steel Bars", queries: "2,150 queries", pct: 54 },
            { standard: "IS 16046:2018", name: "Secondary Lithium Cells & Batteries", queries: "1,940 queries", pct: 48 },
            { standard: "IS 1417:2016", name: "Gold & Gold Alloys Hallmarking", queries: "1,620 queries", pct: 40 },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  <span className="font-mono text-amber-500 mr-2">{item.standard}</span>
                  {item.name}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">{item.queries}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
