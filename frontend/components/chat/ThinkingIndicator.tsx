import React from "react";
import { Sparkles } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50/50 dark:bg-slate-900/50 border border-amber-200/60 dark:border-amber-900/40 text-sm text-slate-700 dark:text-slate-300 w-fit max-w-md animate-pulse">
      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-xs text-amber-800 dark:text-amber-300">
          Analyzing authoritative sources...
        </span>
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </span>
      </div>
    </div>
  );
}
