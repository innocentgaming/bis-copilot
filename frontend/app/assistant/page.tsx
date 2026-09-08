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
  Mic,
  Camera,
  Layers,
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

const SAMPLE_PROMPTS = [
  "What BIS certification do I need for my product?",
  "Find the relevant Indian Standard for electrical equipment.",
  "How do I apply for an ISI Mark licence under Scheme-I?",
  "What are the mandatory marking requirements under IS 1293:2019?",
  "What documents are required for Compulsory Registration Scheme (CRS)?",
  "What is the breaking load requirement in Clause 5.2 of IS 1786?",
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

  const { isAuthenticated } = useAuth();
  const { error: toastError } = useToast();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [conversations, setConversations] = useState<ConversationDetail[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<AnswerCitation | null>(null);
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");

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
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar for Conversations */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
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
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
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

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Chat Header */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>BIS AI Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </h2>
              <span className="text-[10px] text-slate-400">
                Grounding: 7,000+ Indian Standards • Scheme-I • CRS • Hallmarking
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
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
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center mx-auto shadow-xl">
                <Bot className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                  How can I help with Indian Standards & BIS Services?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Ask technical requirements, mandatory QCOs, application procedures, test parameters, or speak in Hindi/English.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/50 hover:shadow-sm text-xs font-medium text-slate-700 dark:text-slate-300 transition"
                  >
                    &quot;{p}&quot;
                  </button>
                ))}
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
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800">
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading AI Assistant...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
