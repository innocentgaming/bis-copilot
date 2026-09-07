"use client";

import React, { useState } from "react";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { useToast } from "@/components/common/Toast";

interface FeedbackControlProps {
  messageId: string;
}

export function FeedbackControl({ messageId }: FeedbackControlProps) {
  const { success, error } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVote = async (value: number) => {
    if (submitted || submitting) return;
    setRating(value);
    setSubmitting(true);

    try {
      await chatApi.submitFeedback({
        message_id: messageId,
        rating: value,
        is_correct: value === 1,
        comment: comment || undefined,
      });
      setSubmitted(true);
      setShowCommentBox(false);
      success("Thank you! Feedback recorded for quality audit.");
    } catch {
      error("Unable to record feedback. Please try again.");
      setRating(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      await chatApi.submitFeedback({
        message_id: messageId,
        rating: rating,
        is_correct: rating === 1,
        comment: comment.trim(),
      });
      setSubmitted(true);
      setShowCommentBox(false);
      success("Comment recorded.");
    } catch {
      error("Unable to update feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 py-1">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>Feedback submitted</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <span>Was this compliance answer helpful?</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote(1)}
            disabled={submitting}
            title="Helpful & verified"
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
              rating === 1 ? "text-emerald-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setRating(-1);
              setShowCommentBox(true);
            }}
            disabled={submitting}
            title="Not helpful or contains issues"
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
              rating === -1 ? "text-rose-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showCommentBox && !submitted && (
        <form onSubmit={handleCommentSubmit} className="flex gap-2 max-w-sm pt-1">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional details (e.g. discrepancy, clause mismatch)..."
            className="flex-1 px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-700 transition"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
