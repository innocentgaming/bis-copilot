"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Cpu, SearchCode, ShieldCheck } from "lucide-react";

const STAGES = [
  { label: "Understanding question...", icon: Cpu, color: "text-blue-500" },
  { label: "Detecting intent & entities...", icon: Sparkles, color: "text-indigo-500" },
  { label: "Finding relevant BIS information...", icon: SearchCode, color: "text-amber-500" },
  { label: "Grounding evidence with citations...", icon: ShieldCheck, color: "text-emerald-500" },
];

export function ThinkingIndicator() {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIdx((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  const currentStage = STAGES[stageIdx];
  const Icon = currentStage.icon;

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/50 text-sm shadow-xs w-fit max-w-md animate-in fade-in-50">
      <div className={`w-7 h-7 rounded-xl bg-blue-50 dark:bg-slate-950 flex items-center justify-center shrink-0 shadow-xs ${currentStage.color}`}>
        <Icon className="w-4 h-4 animate-spin" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
            {currentStage.label}
          </span>
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Stage {stageIdx + 1} of 4 • BIS AI Copilot NLP &amp; RAG Engine
        </span>
      </div>
    </div>
  );
}
