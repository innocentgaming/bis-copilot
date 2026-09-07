"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  FileCheck,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { laboratoriesApi } from "@/lib/api/laboratories";
import {
  CertificationRequirementSummary,
  CertificationSchemeDetail,
  CertificationSchemeSummary,
} from "@/types/laboratories";
import { CardSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/common/Toast";

export default function CertificationPage() {
  const { error: toastError } = useToast();

  const [schemes, setSchemes] = useState<CertificationSchemeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<CertificationSchemeDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    async function loadSchemes() {
      setLoading(true);
      try {
        const res = await laboratoriesApi.listSchemes(20, 0);
        setSchemes(res.items);
        if (res.items.length > 0) {
          handleSelectScheme(res.items[0].id);
        }
      } catch {
        toastError("Failed to fetch certification schemes.");
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  const handleSelectScheme = async (schemeId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await laboratoriesApi.getScheme(schemeId);
      setSelectedScheme(detail);
    } catch {
      toastError("Failed to load certification scheme details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          BIS Certification Schemes & Conformity
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore official Bureau of Indian Standards certification schemes, audit rules, and conformity assessment procedures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Schemes list */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Official Certification Schemes</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : schemes.length === 0 ? (
            <p className="text-xs text-slate-400 p-4">No certification schemes found.</p>
          ) : (
            <div className="space-y-2">
              {schemes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectScheme(s.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1 ${
                    selectedScheme?.id === s.id
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">
                      {s.scheme_name}
                    </span>
                    {s.code && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {s.code}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Scheme Detail View */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          {loadingDetail ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : selectedScheme ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedScheme.scheme_name}
                    </h2>
                    {selectedScheme.code && (
                      <span className="text-xs font-mono text-slate-400">
                        Scheme Code: {selectedScheme.code}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {selectedScheme.description ||
                    "Official conformity assessment scheme administered by the Bureau of Indian Standards under the BIS Act, 2016."}
                </p>
              </div>

              {/* Scheme Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="text-slate-400 font-semibold block">Audit Frequency</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedScheme.audit_frequency || "Periodic surveillance audit required"}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
                  <span className="text-slate-400 font-semibold block">Fee Structure</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedScheme.fee_structure || "Per BIS Schedule of Fees"}
                  </span>
                </div>
              </div>

              {/* Regulatory Notice */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mandatory Quality Control Orders (QCO)
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Products covered under compulsory certification schemes must carry the authentic BIS Standard Mark (ISI Mark or CRS Logo). Manufacturing or distributing uncertified goods is prohibited under Section 16 of the BIS Act, 2016.
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Select a Certification Scheme"
              description="Choose a scheme from the left list to inspect statutory requirements."
              icon={<FileCheck className="w-8 h-8 text-slate-400" />}
            />
          )}
        </div>
      </div>
    </div>
  );
}
