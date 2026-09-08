"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Clock,
  ShieldCheck,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { AnswerCitation, ConfidenceLevel, ProcessingTimings } from "@/types/chat";
import { ConfidenceBadge } from "@/components/common/Badge";
import { CitationCard } from "@/components/citations/CitationCard";
import { RefusalCard } from "./RefusalCard";
import { FeedbackControl } from "./FeedbackControl";

export interface MessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  confidence_score?: number | null;
  confidence_level?: ConfidenceLevel | string | null;
  insufficient_evidence?: boolean;
  citations?: AnswerCitation[];
  caveats?: string[];
  follow_up_questions?: string[];
  processing?: ProcessingTimings;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: MessageItem;
  onCitationClick: (citation: AnswerCitation) => void;
  onFollowUpClick?: (question: string) => void;
}

export function ChatMessage({
  message,
  onCitationClick,
  onFollowUpClick,
}: ChatMessageProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-4xl ml-auto mb-6">
        <div className="flex flex-col items-end max-w-xl">
          <div className="p-4 rounded-2xl rounded-tr-xs bg-slate-900 text-white text-sm leading-relaxed shadow-sm font-normal">
            {message.content}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 mr-1">You</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold border border-slate-700">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant Response
  return (
    <div className="flex gap-4 max-w-4xl mr-auto mb-8">
      {/* Bot Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-md font-bold">
        <Bot className="w-5 h-5" />
      </div>

      {/* Message Body */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              BIS AI Copilot
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            </span>

            {message.confidence_level && (
              <ConfidenceBadge level={message.confidence_level} />
            )}
          </div>

          {message.processing?.total_ms !== undefined && message.processing.total_ms > 0 && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {message.processing.total_ms.toFixed(1)} ms
            </span>
          )}
        </div>

        {/* Refusal / Insufficient Evidence Guard */}
        {message.insufficient_evidence ? (
          <RefusalCard
            answerText={message.content}
            onSuggestionClick={onFollowUpClick}
          />
        ) : (
          /* Structured Answer Box */
          <div className="p-6 rounded-3xl rounded-tl-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Main Content */}
            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-blue-600 animate-pulse align-middle" />
              )}
            </div>

            {/* Next Steps Guidance */}
            {!message.isStreaming && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recommended Next Steps:
                </span>
                <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <li>Verify the 7-digit BIS Licence number (CM/L) on the product packaging.</li>
                  <li>Cross-check mandatory testing clauses against the gazetted Indian Standard.</li>
                  <li>Confirm manufacturer registration status on the official Manakonline portal.</li>
                </ol>
              </div>
            )}

            {/* Action Buttons */}
            {!message.isStreaming && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/product-verification"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Now</span>
                </Link>
                <Link
                  href="/complaints"
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 transition flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report a Problem</span>
                </Link>
                {onFollowUpClick && (
                  <button
                    type="button"
                    onClick={() => onFollowUpClick("Explain related Indian Standards and compliance fees")}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Ask Follow-up</span>
                  </button>
                )}
              </div>
            )}

            {/* "Why this answer?" Expandable Drawer */}
            {!message.isStreaming && message.citations && message.citations.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setWhyOpen(!whyOpen)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why this answer? (Inspect Knowledge Sources)</span>
                  {whyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {whyOpen && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs animate-in fade-in-50">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      This response was generated by scanning official BIS gazettes, Indian Standards, and conformity assessment schemes using hybrid pgvector semantic search and FTS5 keyword indexing.
                    </p>
                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] block">
                        Retrieved Evidence Chunks ({message.citations.length}):
                      </span>
                      {message.citations.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => onCitationClick(c)}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                              {c.standard}
                            </span>
                            <span className="text-[10px] text-blue-600 font-mono">
                              {c.clause || "Section Overview"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {c.citation_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Citations Grid */}
        {message.citations && message.citations.length > 0 && !whyOpen && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Authoritative Evidence Citations ({message.citations.length})
            </span>
            <div className="flex flex-wrap gap-3">
              {message.citations.map((c, i) => (
                <CitationCard
                  key={i}
                  citation={c}
                  onClick={() => onCitationClick(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Caveats */}
        {message.caveats && message.caveats.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Compliance Caveats:
            </span>
            <ul className="list-disc pl-4 space-y-0.5">
              {message.caveats.map((cav, i) => (
                <li key={i}>{cav}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Follow-up Questions */}
        {message.follow_up_questions && message.follow_up_questions.length > 0 && onFollowUpClick && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-medium text-slate-400">
              Related Compliance Inquiries:
            </span>
            <div className="flex flex-wrap gap-2">
              {message.follow_up_questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUpClick(q)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Control */}
        {!message.isStreaming && message.id && (
          <div className="pt-1">
            <FeedbackControl messageId={message.id} />
          </div>
        )}
      </div>
    </div>
  );
}
