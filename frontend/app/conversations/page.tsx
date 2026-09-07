"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MessageSquare,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { ConversationDetail } from "@/types/chat";
import { EmptyState } from "@/components/common/EmptyState";
import { CardSkeleton } from "@/components/common/Skeleton";
import { formatDateTime } from "@/lib/utils/formatters";
import { useToast } from "@/components/common/Toast";
import { useAuth } from "@/lib/auth/context";

export default function ConversationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [conversations, setConversations] = useState<ConversationDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await chatApi.getConversations(50, 0);
      setConversations(res.items);
    } catch {
      toastError("Failed to fetch conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      success("Conversation deleted.");
    } catch {
      toastError("Unable to delete conversation.");
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign In Required"
        description="Please sign in to view and manage your compliance inquiry conversations."
        icon={<MessageSquare className="w-8 h-8 text-amber-500" />}
        action={
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Compliance Conversations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review past multi-turn question sessions and verified citations
          </p>
        </div>

        <Link
          href="/chat"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Inquiry</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No Conversations Yet"
          description="You haven't started any compliance inquiries yet. Ask the AI assistant a question about Indian Standards."
          icon={<MessageSquare className="w-8 h-8 text-slate-400" />}
          action={
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
            >
              <span>Start First Conversation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => router.push(`/chat`)}
              className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition line-clamp-2">
                  {conv.title || "Compliance Inquiry Session"}
                </h3>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateTime(conv.created_at)}
                </span>
                <span className="font-semibold text-amber-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Resume <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
