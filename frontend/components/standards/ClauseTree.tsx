"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Hash } from "lucide-react";
import { ClauseSummary } from "@/types/standards";

interface ClauseTreeNodeProps {
  clause: ClauseSummary;
  allClauses: ClauseSummary[];
  selectedClauseId?: string | null;
  onSelectClause: (clause: ClauseSummary) => void;
  level?: number;
}

export function ClauseTreeNode({
  clause,
  allClauses,
  selectedClauseId,
  onSelectClause,
  level = 0,
}: ClauseTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Find direct children whose parent_clause_id matches clause.id
  const children = allClauses.filter((c) => c.parent_clause_id === clause.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedClauseId === clause.id;

  return (
    <div className="select-none">
      <div
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        className={`group flex items-center justify-between py-2 pr-3 rounded-lg text-xs cursor-pointer transition ${
          isSelected
            ? "bg-amber-500/15 text-amber-900 dark:text-amber-300 font-semibold border-l-2 border-amber-500"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        onClick={() => onSelectClause(clause)}
      >
        <div className="flex items-center gap-2 truncate">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          ) : (
            <span className="w-4 flex justify-center text-slate-300 dark:text-slate-700 font-mono text-[10px]">
              •
            </span>
          )}

          <span className="font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
            {clause.clause_number}
          </span>

          <span className="truncate font-medium">
            {clause.heading || "Untitled Clause"}
          </span>
        </div>

        {clause.page_start && (
          <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 ml-2">
            p. {clause.page_start}
            {clause.page_end && clause.page_end !== clause.page_start
              ? `–${clause.page_end}`
              : ""}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800 ml-4">
          {children.map((child) => (
            <ClauseTreeNode
              key={child.id}
              clause={child}
              allClauses={allClauses}
              selectedClauseId={selectedClauseId}
              onSelectClause={onSelectClause}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ClauseTreeProps {
  clauses: ClauseSummary[];
  selectedClauseId?: string | null;
  onSelectClause: (clause: ClauseSummary) => void;
}

export function ClauseTree({
  clauses,
  selectedClauseId,
  onSelectClause,
}: ClauseTreeProps) {
  // Top-level clauses have no parent_clause_id or their parent is not in the list
  const topLevel = clauses.filter(
    (c) => !c.parent_clause_id || !clauses.some((p) => p.id === c.parent_clause_id)
  );

  if (clauses.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400">
        No clauses indexed for this standard yet.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {topLevel.map((clause) => (
        <ClauseTreeNode
          key={clause.id}
          clause={clause}
          allClauses={clauses}
          selectedClauseId={selectedClauseId}
          onSelectClause={onSelectClause}
        />
      ))}
    </div>
  );
}
