"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, X, RefreshCw, CheckCircle2, Sparkles } from "lucide-react";
import { platformApi } from "@/lib/api/platform";
import { VoiceQueryResponse } from "@/types/bis_platform";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery?: (query: string) => void;
}

export function VoiceModal({ isOpen, onClose, onSelectQuery }: VoiceModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState<"hi" | "en">("hi");
  const [loading, setLoading] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceQueryResponse | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript("");
      setVoiceResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateVoice = (samplePhrase: string) => {
    setTranscript(samplePhrase);
    processVoice(samplePhrase);
  };

  const processVoice = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await platformApi.processVoice({
        transcript: text,
        language: language,
      });
      setVoiceResult(res);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Voice Assistant (आवाज़ सहायक)
              </h3>
              <p className="text-xs text-slate-500">
                Speak in Hindi, English, or Hinglish for instant BIS guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Language toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Preferred Language:</span>
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
              <button
                onClick={() => setLanguage("hi")}
                className={`px-3 py-1 rounded-md transition ${
                  language === "hi"
                    ? "bg-white dark:bg-slate-900 text-amber-600 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-md transition ${
                  language === "en"
                    ? "bg-white dark:bg-slate-900 text-amber-600 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Microphone Animation Center */}
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-amber-500 text-white shadow-lg ring-8 ring-amber-500/30 scale-105"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white cursor-pointer"
              }`}
              onClick={() => {
                setIsListening(!isListening);
                if (!isListening) {
                  // Simulate listening
                  setTimeout(() => {
                    const sample =
                      language === "hi"
                        ? "ISI certification ka process kya hai aur kitna fee lagega?"
                        : "What is the process to apply for BIS ISI Mark license?";
                    setTranscript(sample);
                    setIsListening(false);
                    processVoice(sample);
                  }, 2000);
                }
              }}
            >
              <Mic className="w-8 h-8" />
              {isListening && (
                <span className="absolute -bottom-6 text-[11px] font-bold text-amber-500 animate-pulse tracking-wide uppercase">
                  Listening...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 text-center max-w-xs">
              {isListening
                ? "Listening to your voice input..."
                : "Click the microphone or select a sample voice prompt below"}
            </p>
          </div>

          {/* Sample Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Voice Examples
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() =>
                  handleSimulateVoice(
                    "ISI certification ka process kya hai aur kitna fee lagega?"
                  )
                }
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left text-slate-700 dark:text-slate-300 transition"
              >
                &quot;ISI certification ka process kya hai?&quot;
              </button>
              <button
                onClick={() =>
                  handleSimulateVoice(
                    "What are the requirements for IS 10500 drinking water?"
                  )
                }
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left text-slate-700 dark:text-slate-300 transition"
              >
                &quot;Requirements for IS 10500 drinking water?&quot;
              </button>
            </div>
          </div>

          {/* Results Box */}
          {loading && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              <span>Transcribing and querying BIS AI Knowledge Base...</span>
            </div>
          )}

          {voiceResult && !loading && (
            <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Spoken Response ({voiceResult.detected_language.toUpperCase()})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px]">
                  {voiceResult.confidence} Confidence
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {voiceResult.response}
              </p>
              {onSelectQuery && (
                <button
                  onClick={() => {
                    onSelectQuery(voiceResult.transcription);
                    onClose();
                  }}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition"
                >
                  Continue in Full AI Chat
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
