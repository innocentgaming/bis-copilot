"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Bot,
  Globe,
  MessageSquare,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { AnswerCitation, ChatRequest, ConversationDetail } from "@/types/chat";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage, MessageItem } from "@/components/chat/ChatMessage";
import { ThinkingIndicator } from "@/components/chat/ThinkingIndicator";
import { EvidencePanel } from "@/components/citations/EvidencePanel";
import { useToast } from "@/components/common/Toast";
import { useAuth } from "@/lib/auth/context";

const SAMPLE_PROMPTS = [
  "What is the minimum breaking load and test temperature under Clause 5.2 in IS 99999?",
  "Which sampling and test methods are specified in Annex A of IS 99999?",
  "What are the mechanical performance requirements for structural components?",
  "What is the recipe for baking chocolate chip cookies?", // Demonstrates safe refusal
];

function extractDisplayAnswer(raw: string): string {
  if (!raw.trim().startsWith("{")) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.answer === "string") {
      return parsed.answer;
    }
  } catch {
    const match = raw.match(/"answer"\s*:\s*"((?:[^"\\]|\\.)*)/);
    if (match && match[1]) {
      return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
  }
  return raw;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");

  const { isAuthenticated } = useAuth();
  const { error: toastError } = useToast();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [conversations, setConversations] = useState<ConversationDetail[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<AnswerCitation | null>(null);
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Load conversation list if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      chatApi
        .getConversations(10, 0)
        .then((res) => setConversations(res.items))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Handle URL query parameter if passed from landing or demo
  const initialSentRef = useRef(false);
  useEffect(() => {
    if (initialQuery && !initialSentRef.current) {
      initialSentRef.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setIsStreaming(false);
    setIsLoading(false);
  };

  const handleSelectConversation = async (convId: string) => {
    setActiveConvId(convId);
    setIsLoading(true);
    try {
      const msgs = await chatApi.getMessages(convId);
      const formatted: MessageItem[] = msgs.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        confidence_score: m.confidence_score,
        confidence_level: m.confidence_level,
        insufficient_evidence: m.insufficient_evidence,
        citations: m.citations,
      }));
      setMessages(formatted);
    } catch {
      toastError("Failed to load conversation history.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatApi.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) {
        handleNewChat();
      }
    } catch {
      toastError("Unable to delete conversation.");
    }
  };

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsgId = "user-" + Date.now();
    const assistantMsgId = "asst-" + Date.now();

    const userMsg: MessageItem = {
      id: userMsgId,
      role: "user",
      content: queryText,
    };

    const assistantPlaceholder: MessageItem = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setIsLoading(true);
    setIsStreaming(true);

    const chatPayload: ChatRequest = {
      query: queryText,
      conversation_id: activeConvId,
      language: language,
    };

    let accumulatedContent = "";

    try {
      // 1. Try real Server-Sent Events streaming from /chat/stream
      await chatApi.streamMessage(
        chatPayload,
        // onToken:
        (token: string) => {
          accumulatedContent += token;
          const display = extractDisplayAnswer(accumulatedContent);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: display, isStreaming: true }
                : msg
            )
          );
        },
        // onFinal:
        (finalPayload) => {
          setIsStreaming(false);
          setIsLoading(false);
          setActiveConvId(finalPayload.conversation_id);

          const finalAnswer = finalPayload.answer || extractDisplayAnswer(accumulatedContent);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    id: finalPayload.message_id || assistantMsgId,
                    role: "assistant",
                    content: finalAnswer,
                    confidence_score: finalPayload.confidence,
                    confidence_level: finalPayload.confidence_level,
                    insufficient_evidence: finalPayload.insufficient_evidence,
                    citations: finalPayload.citations || [],
                    caveats: finalPayload.caveats || [],
                    follow_up_questions: finalPayload.follow_up_questions || [],
                    processing: finalPayload.processing,
                    isStreaming: false,
                    isRefusal: finalPayload.insufficient_evidence,
                  }
                : msg
            )
          );
        },
        // onError: fallback to synchronous /chat
        async (streamErr) => {
          console.warn("SSE stream interrupted or failed, attempting sync fallback:", streamErr);
          try {
            const syncRes = await chatApi.sendMessage(chatPayload);
            setIsStreaming(false);
            setIsLoading(false);
            setActiveConvId(syncRes.conversation_id);

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      id: syncRes.message_id,
                      role: "assistant",
                      content: syncRes.answer,
                      confidence_score: syncRes.confidence,
                      confidence_level: syncRes.confidence_level,
                      insufficient_evidence: syncRes.insufficient_evidence,
                      citations: syncRes.citations || [],
                      caveats: syncRes.caveats || [],
                      follow_up_questions: syncRes.follow_up_questions || [],
                      processing: syncRes.processing,
                      isStreaming: false,
                    }
                  : msg
              )
            );
          } catch (syncErr: unknown) {
            const errText = syncErr instanceof Error ? syncErr.message : "Service error";
            toastError(errText);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      content: `Unable to obtain compliance answer: ${errText}`,
                      insufficient_evidence: true,
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setIsStreaming(false);
            setIsLoading(false);
          }
        }
      );
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : "Service error";
      toastError(errText);
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Conversations Sub-Sidebar (Desktop only) */}
      <div className="hidden lg:flex flex-col w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4 space-y-4 shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-sm hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Compliance Chat</span>
        </button>

        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          <span>Recent Sessions</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No previous conversations
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectConversation(c.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition ${
                  activeConvId === c.id
                    ? "bg-amber-500/15 text-amber-900 dark:text-amber-300 font-semibold border border-amber-500/30"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.title || "Untitled Session"}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  title="Delete Session"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Language selector in sub-sidebar */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>Response Language:</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setLanguage("en")}
              className={`py-1 rounded text-center text-xs font-medium transition ${
                language === "en"
                  ? "bg-amber-600 text-white font-bold"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`py-1 rounded text-center text-xs font-medium transition ${
                language === "hi"
                  ? "bg-amber-600 text-white font-bold"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage("mr")}
              className={`py-1 rounded text-center text-xs font-medium transition ${
                language === "mr"
                  ? "bg-amber-600 text-white font-bold"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              मराठी
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-slate-900/20">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                AI Compliance Assistant
              </h2>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Evidence-Grounded • Anti-Hallucinatory • Indian Standards
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center mx-auto shadow-xl">
                <Bot className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  How can I assist with BIS Standards & Compliance?
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Ask quantitative parameters, mandatory clauses, test methods, or certification requirements. All answers are strictly grounded in authoritative standard chunks.
                </p>
              </div>

              {/* Sample Prompt Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {SAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500 hover:shadow-xs transition text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed group"
                  >
                    <span className="text-amber-600 font-bold block mb-1">
                      Example {i + 1}
                    </span>
                    <span className="group-hover:text-amber-600 transition">
                      &ldquo;{prompt}&rdquo;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Rendered Message List */
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onCitationClick={(c) => setSelectedCitation(c)}
                  onFollowUpClick={(q) => handleSendMessage(q)}
                />
              ))}

              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <ThinkingIndicator />
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
              isLoading={isStreaming}
            />
          </div>
        </div>
      </div>

      {/* Slide-over Evidence Panel */}
      <EvidencePanel
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Compliance Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}

