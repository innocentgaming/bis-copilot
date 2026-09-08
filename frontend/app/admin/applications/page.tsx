"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, Search, ArrowRight } from "lucide-react";
import { useToast } from "@/components/common/Toast";

export default function AdminApplicationsPage() {
  const [search, setSearch] = useState("");
  const { success: toastSuccess } = useToast();

  const apps = [
    {
      number: "BIS-2026-000123",
      applicant: "Rajesh Kumar (ElectroTech Industries)",
      service: "ISI Mark Scheme-I",
      standard: "IS 1293:2019",
      status: "Technical Review",
      date: "18 Aug 2026"
    },
    {
      number: "BIS-2026-000456",
      applicant: "Pooja Sharma (Zenith Batteries)",
      service: "Compulsory Registration (CRS)",
      standard: "IS 16046:2018",
      status: "Certificate Issued",
      date: "01 Aug 2026"
    },
    {
      number: "BIS-2026-000789",
      applicant: "Amit Varma (Varma Jewellers)",
      service: "Hallmarking Scheme",
      standard: "IS 1417:2016",
      status: "Document Verification",
      date: "05 Sep 2026"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Application Review & Scrutiny Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Officer queue for examining manufacturing dossiers, scheduling lab tests, and granting digital certificates.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">App Number</th>
                <th className="p-4">Applicant / Enterprise</th>
                <th className="p-4">Scheme</th>
                <th className="p-4">Standard</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {apps.map((a) => (
                <tr key={a.number} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                    {a.number}
                  </td>
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                    {a.applicant}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {a.service}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                    {a.standard}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {a.date}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/applications/${a.number}`}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
                    >
                      Audit Workflow
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
