"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  ExternalLink,
  Filter,
  MapPin,
  Microscope,
  Phone,
  Search,
} from "lucide-react";
import { laboratoriesApi } from "@/lib/api/laboratories";
import { LaboratoryDetail, LaboratorySummary } from "@/types/laboratories";
import { CardSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/common/Toast";

export default function LaboratoriesPage() {
  const { error: toastError } = useToast();

  const [laboratories, setLaboratories] = useState<LaboratorySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [selectedLab, setSelectedLab] = useState<LaboratoryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      if (standardFilter.trim()) {
        const labs = await laboratoriesApi.findByStandard(standardFilter.trim());
        setLaboratories(labs);
        setTotal(labs.length);
      } else {
        const res = await laboratoriesApi.listLaboratories({
          city: cityFilter.trim() || undefined,
          state: stateFilter.trim() || undefined,
          limit: 20,
        });
        setLaboratories(res.items);
        setTotal(res.total);
      }
    } catch {
      toastError("Failed to fetch testing laboratories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLabs();
  };

  const handleLabClick = async (labId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await laboratoriesApi.getLaboratory(labId);
      setSelectedLab(detail);
    } catch {
      toastError("Failed to load laboratory details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          BIS-Recognized Testing Laboratories
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Directory of accredited conformity assessment and testing laboratories across India
        </p>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={standardFilter}
              onChange={(e) => setStandardFilter(e.target.value)}
              placeholder="Filter by Standard (e.g. IS 99999)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by City (e.g. New Delhi, Mumbai)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              placeholder="Filter by State..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shrink-0"
            >
              Filter
            </button>
          </div>
        </div>
      </form>

      {/* Grid of Labs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : laboratories.length === 0 ? (
        <EmptyState
          title="No Laboratories Found"
          description="No accredited laboratories matched the chosen criteria. Try searching for a different standard or city."
          icon={<Microscope className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {laboratories.map((lab) => (
            <div
              key={lab.id}
              onClick={() => handleLabClick(lab.id)}
              className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center font-bold text-xs shrink-0 border border-violet-200 dark:border-violet-800">
                    <Microscope className="w-5 h-5" />
                  </div>
                  {lab.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Accredited
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition">
                    {lab.name}
                  </h3>
                  {lab.code && (
                    <span className="text-[11px] font-mono text-slate-400">
                      Code: {lab.code}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {[lab.city, lab.state, lab.pincode].filter(Boolean).join(", ") || "Location details on file"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {lab.capabilities_count} Testing {lab.capabilities_count === 1 ? "Capability" : "Capabilities"}
                </span>
                <span className="font-semibold text-amber-600 group-hover:translate-x-0.5 transition">
                  View Specs →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Slide-over Detail */}
      {selectedLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedLab.name}
                </h3>
                <span className="text-xs text-slate-400">
                  {[selectedLab.address, selectedLab.city, selectedLab.state, selectedLab.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <button
                onClick={() => setSelectedLab(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Contact info if available */}
              {(selectedLab.contact_person || selectedLab.email || selectedLab.phone) && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Contact Information
                  </span>
                  {selectedLab.contact_person && <div>Person: {selectedLab.contact_person}</div>}
                  {selectedLab.email && <div>Email: {selectedLab.email}</div>}
                  {selectedLab.phone && <div>Phone: {selectedLab.phone}</div>}
                </div>
              )}

              {/* Capabilities */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px] block">
                  Accredited Test Capabilities ({selectedLab.capabilities.length})
                </span>
                {selectedLab.capabilities.length === 0 ? (
                  <p className="text-slate-400">No capabilities currently on file.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedLab.capabilities.map((cap) => (
                      <div
                        key={cap.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                          <span>{cap.standard_number}</span>
                          {cap.is_accredited && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              ✓ Accredited
                            </span>
                          )}
                        </div>
                        {cap.test_name && (
                          <div className="text-slate-600 dark:text-slate-300">
                            Test: {cap.test_name}
                          </div>
                        )}
                        {cap.parameter && (
                          <div className="text-slate-500 text-[11px]">
                            Parameter: {cap.parameter}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLab(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
