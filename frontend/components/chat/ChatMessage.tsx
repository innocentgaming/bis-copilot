"use client";

import React from "react";
import { Bot, Clock, ShieldCheck, User } from "lucide-react";
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
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 shadow-md font-bold">
        <Bot className="w-5 h-5" />
      </div>

      {/* Message Body */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            BIS Compliance Engine
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          </span>

          {message.confidence_level && (
            <ConfidenceBadge level={message.confidence_level} />
          )}

          {message.processing?.total_ms !== undefined && message.processing.total_ms > 0 && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
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
          /* Text Content */
          <div className="p-5 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-amber-500 animate-pulse align-middle" />
            )}
          </div>
        )}

        {/* Citations Grid */}
        {message.citations && message.citations.length > 0 && (
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
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
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
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600 transition"
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
