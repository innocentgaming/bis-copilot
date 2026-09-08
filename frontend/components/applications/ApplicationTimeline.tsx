import React from "react";
import { CheckCircle2, Clock, Circle, AlertTriangle } from "lucide-react";
import { ApplicationTimelineStep } from "@/types/bis_platform";

export function ApplicationTimeline({ steps }: { steps: ApplicationTimelineStep[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {steps.map((step, idx) => {
        const isCompleted = step.step_status === "COMPLETED";
        const isInProgress = step.step_status === "IN_PROGRESS";
        const isRejected = step.step_status === "REJECTED";

        return (
          <div key={idx} className="relative group">
            {/* Step Icon Indicator */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 transition-transform ${
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : isInProgress
                  ? "bg-amber-500 text-white animate-pulse"
                  : isRejected
                  ? "bg-rose-500 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isInProgress ? (
                <Clock className="w-3.5 h-3.5" />
              ) : isRejected ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-2.5 h-2.5" />
              )}
            </div>

            {/* Step Content Card */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4
                  className={`text-sm font-bold ${
                    isCompleted
                      ? "text-slate-900 dark:text-white"
                      : isInProgress
                      ? "text-amber-600 dark:text-amber-400 font-extrabold"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step.step_name}
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {step.timestamp}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.description}
              </p>

              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                <span>Audited By:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {step.performed_by}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
