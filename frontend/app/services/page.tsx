"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Clock,
  Banknote,
  FileCheck2,
  ExternalLink,
  Bot,
} from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { BISService } from "@/types/bis_platform";
import { CardSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Footer } from "@/components/layout/Footer";

const CATEGORIES = [
  "All",
  "Product Certification",
  "Registration",
  "Hallmarking",
  "Laboratory Services",
  "Certification",
  "Licensing",
  "Consumer Services",
  "Inspection",
];

function ServicesContent() {
  const [services, setServices] = useState<BISService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await platformApi.listServices({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        search: search.trim() || undefined,
      });
      setServices(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadServices();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Official BIS Services Directory
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          BIS Services, Schemes & Conformity Assessment
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Discover product certification schemes (ISI Mark), Compulsory Registration (CRS),
          Gold Hallmarking, Laboratory Recognition, and consumer quality verification services.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search BIS services (e.g., ISI Mark, CRS, Hallmarking, Tatkal)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-amber-500/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          title="No Services Found"
          description="No BIS services matched your search query. Try searching with a different keyword."
          icon={<Layers className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((svc) => (
            <div
              key={svc.slug}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {svc.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    ~{svc.processing_time_days} days
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {svc.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {svc.description}
                </p>

                {/* Eligibility & Fees */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Eligibility:</strong>{" "}
                    {svc.eligibility}
                  </div>
                  <div className="text-amber-700 dark:text-amber-400 font-mono">
                    <strong>Fee:</strong> {svc.fee_structure}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <Link
                  href={`/services/${svc.slug}`}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/chat?q=${encodeURIComponent(
                      `How can I apply for ${svc.name}? What are the exact requirements and documents?`
                    )}`}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition"
                    title="Ask AI about this service"
                  >
                    <Bot className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/applications"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold transition hover:opacity-90"
                  >
                    Start Application
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
