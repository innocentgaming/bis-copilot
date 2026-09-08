"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Bot, ShieldCheck } from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISApplication } from "@/types/bis_platform";
import { ApplicationTimeline } from "@/components/applications/ApplicationTimeline";
import { CardSkeleton } from "@/components/common/Skeleton";
import { Footer } from "@/components/layout/Footer";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [app, setApp] = useState<BISApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await platformApi.getApplication(id);
        setApp(res);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Application Not Found</h2>
        <Link href="/applications" className="text-amber-500 font-semibold text-sm">
          ← Back to Applications List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Applications
      </button>

      <div className="p-6 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              {app.application_number}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {app.service_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Applicant: {app.applicant_name}</span>
              <span>•</span>
              <span>{app.company_name}</span>
            </div>
          </div>

          <div className="text-right sm:self-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Current Status
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block mt-0.5">
              {app.current_status}
            </span>
          </div>
        </div>

        {/* Application Details Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Standard (IS)
            </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {app.standard_number || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Assigned Division
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {app.assigned_department}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Contact Email
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200">
              {app.contact_email}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Verification & Inspection Timeline
          </h3>
          <ApplicationTimeline steps={app.timeline} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <Link
            href={`/chat?q=${encodeURIComponent(
              `What are the requirements for application ${app.application_number} at status ${app.current_status}?`
            )}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow transition"
          >
            <Bot className="w-3.5 h-3.5" />
            Ask AI Assistant
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
