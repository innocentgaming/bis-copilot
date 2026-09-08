"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Bot,
  Globe,
  MessageSquare,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Mic,
  Camera,
  Layers,
  FileText,
  Clock,
  AlertTriangle,
  Settings,
  Paperclip,
  CheckCircle2,
  HelpCircle,
  Gem,
  ShieldCheck,
  Send,
} from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { AnswerCitation, ChatRequest, ConversationDetail } from "@/types/chat";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage, MessageItem } from "@/components/chat/ChatMessage";
import { ThinkingIndicator } from "@/components/chat/ThinkingIndicator";
import { EvidencePanel } from "@/components/citations/EvidencePanel";
import { useToast } from "@/components/common/Toast";
import { useAuth } from "@/lib/auth/context";
import { VoiceModal } from "@/components/multimodal/VoiceModal";
import { VisionModal } from "@/components/multimodal/VisionModal";

const QUICK_ACTIONS = [
  { label: "What products require BIS certification?", query: "What products require mandatory BIS certification under Quality Control Orders (QCO)?" },
  { label: "How do I verify a BIS licence?", query: "How do I verify if a product's 7-digit CM/L licence number is authentic and active?" },
  { label: "What does IS 302 mean?", query: "What does IS 302 cover regarding safety of electrical household appliances?" },
  { label: "How can I report a fake BIS mark?", query: "How can I report a counterfeit or unauthorized ISI mark on a product?" },
  { label: "How do I verify a hallmark?", query: "How do I verify the 6-digit laser-etched HUID hallmark on gold jewelry?" },
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

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const langParam = searchParams.get("lang");

  const { isAuthenticated } = useAuth();
  const { error: toastError } = useToast();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [conversations, setConversations] = useState<ConversationDetail[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<AnswerCitation | null>(null);
  const [language, setLanguage] = useState<"en" | "hi" | "mr">(
    (langParam === "hi" || langParam === "mr") ? langParam : "en"
  );

  // Multimodal modals
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);

  useEffect(() => {
    if (isAuthenticated) {
      chatApi
        .getConversations(10, 0)
        .then((res) => setConversations(res.items))
        .catch(() => {});
    }
  }, [isAuthenticated]);

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
    setSelectedCitation(null);
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
      await chatApi.streamMessage(
        chatPayload,
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
        (finalPayload) => {
          setIsStreaming(false);
          setIsLoading(false);
          setActiveConvId(finalPayload.conversation_id);

          const finalAnswer =
            finalPayload.answer || extractDisplayAnswer(accumulatedContent);

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
        async (streamErr) => {
          console.warn("SSE stream interrupted, fallback sync:", streamErr);
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
                      content: `Unable to obtain answer: ${errText}`,
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
    <div className="flex h-[calc(100vh-4.5rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white font-bold text-xs shadow-sm hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>
        </div>

        {/* Quick Navigation Links in Sidebar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 block">
            AI Assistant Shortcuts
          </span>
          <Link
            href="/documents"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Document AI</span>
          </Link>
          <Link
            href="/applications"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Application Status</span>
          </Link>
          <Link
            href="/complaints"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Complaints</span>
          </Link>
          <Link
            href="/hallmarking"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
          >
            <Gem className="w-3.5 h-3.5 text-yellow-500" />
            <span>Hallmarking HUID</span>
          </Link>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1 block">
            Recent Inquiries
          </span>
          {conversations.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No previous conversations
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectConversation(c.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-medium truncate transition flex items-center gap-2 ${
                  activeConvId === c.id
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{c.title || "BIS Consultation"}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Chat Header */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>BIS AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <span className="text-[10px] text-slate-400">
                Grounding: 7,000+ Indian Standards • Scheme-I • CRS • Hallmarking
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition"
              title="Voice Assistant (Hindi / English)"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice</span>
            </button>
            <button
              onClick={() => setVisionOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition"
              title="Image / Product Label Scanner"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inspect Label</span>
            </button>
            <Link
              href="/documents"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition"
              title="Upload Document AI"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Document AI</span>
            </Link>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto py-8 text-center space-y-6 animate-in fade-in-50">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center mx-auto shadow-xl">
                <Bot className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  Namaste! I&apos;m BIS AI Copilot.
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  How can I help you with BIS standards, product certification or consumer safety?
                </p>
              </div>

              {/* Quick action buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Action Inquiries:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-2xl mx-auto">
                  {QUICK_ACTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(item.query)}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-sm text-xs font-medium text-slate-700 dark:text-slate-300 transition flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {item.label}
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onCitationClick={(cit) => setSelectedCitation(cit)}
                onFollowUpClick={(q) => handleSendMessage(q)}
              />
            ))
          )}

          {isLoading && <ThinkingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              onVoiceClick={() => setVoiceOpen(true)}
              onVisionClick={() => setVisionOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Citations Evidence Drawer */}
      <EvidencePanel
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      {/* Multimodal Modals */}
      <VoiceModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSelectQuery={(q) => handleSendMessage(q)}
      />
      <VisionModal
        isOpen={visionOpen}
        onClose={() => setVisionOpen(false)}
      />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading BIS AI Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
