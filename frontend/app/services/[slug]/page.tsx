"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  Layers,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISService } from "@/types/bis_platform";
import { CardSkeleton } from "@/components/common/Skeleton";
import { Footer } from "@/components/layout/Footer";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [service, setService] = useState<BISService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const res = await platformApi.getService(slug);
        setService(res);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Service Not Found</h2>
        <Link href="/services" className="text-amber-500 font-semibold text-sm">
          ← Back to Services Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </button>

      {/* Hero Header */}
      <div className="p-7 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-slate-700/60 space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {service.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Estimated Processing Time: ~{service.processing_time_days} days
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {service.name}
        </h1>

        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          {service.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/applications"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            Start Online Application
          </Link>
          <Link
            href={`/chat?q=${encodeURIComponent(
              `What are the step-by-step requirements, fee structure, and document checklist for ${service.name}?`
            )}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            Ask AI Assistant
          </Link>
          {service.portal_url && (
            <a
              href={service.portal_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white underline ml-2"
            >
              Official BIS Portal <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Eligibility & Documents */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Eligibility & Prerequisite Criteria
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {service.eligibility}
          </p>

          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-2">
            Mandatory Documents Required
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {service.documents_required.map((doc, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Fees & Procedure */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-500" />
            Prescribed Fee Structure
          </h3>
          <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-medium text-amber-900 dark:text-amber-200 leading-relaxed">
            {service.fee_structure}
          </div>

          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-2">
            How to Apply Step-by-Step
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {service.how_to_apply}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
