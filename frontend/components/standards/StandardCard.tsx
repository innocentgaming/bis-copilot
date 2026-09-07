import React from "react";
import Link from "next/link";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import { StandardSummary } from "@/types/standards";
import { StatusBadge } from "@/components/common/Badge";

interface StandardCardProps {
  standard: StandardSummary;
}

export function StandardCard({ standard }: StandardCardProps) {
  return (
    <Link
      href={`/standards/${standard.id}`}
      className="group block p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/80 hover:shadow-md transition space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200 dark:border-amber-800">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition">
              {standard.standard_number}
            </h4>
            {standard.edition && (
              <span className="text-[11px] text-slate-400">
                Edition {standard.edition}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={standard.status} />
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
        {standard.title}
      </p>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        {standard.publication_date ? (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {standard.publication_date}
          </span>
        ) : (
          <span>Bureau of Indian Standards</span>
        )}

        <div className="flex items-center gap-1 font-semibold text-amber-600 group-hover:translate-x-0.5 transition">
          <span>Explore Clauses</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
