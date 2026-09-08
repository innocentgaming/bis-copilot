"use client";
import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Camera, Mic, Paperclip, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language/context";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onVoiceClick?: () => void;
  onVisionClick?: () => void;
}

const PLACEHOLDERS: Record<string, string> = {
  en: "Ask anything about BIS, Indian Standards, ISI Mark, or compliance...",
  hi: "बीआईएस, भारतीय मानक, आईएसआई मार्क या प्रमाणन के बारे में पूछें...",
  ta: "BIS, இந்திய தரநிலைகள், ISI முத்திரை அல்லது இணக்கம் பற்றி கேளுங்கள்...",
  te: "BIS, భారతీయ ప్రమాణాలు, ISI మార్క్ లేదా ధృవీకరణ గురించి అడగండి...",
  bn: "বিআইএস, ভারতীয় মানদণ্ড, আইএসআই মার্ক বা সম্মতি সম্পর্কে জিজ্ঞাসা করুন...",
  mr: "बीआयएस, भारतीय मानके, आयएसआय मार्क किंवा नियमांबद्दल विचारा...",
  gu: "BIS, ભારતીય ધોરણો, ISI માર્ક અથવા પાલન વિશે પૂછો...",
  kn: "BIS, ಭಾರತೀಯ ಮಾನದಂಡಗಳು, ISI ಮಾರ್ಕ್ ಅಥವಾ ಅನುಸರಣೆ ಬಗ್ಗೆ ಕೇಳಿ...",
  ml: "BIS, ഇന്ത്യൻ മാനദണ്ഡങ്ങൾ, ISI മാർക്ക് എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...",
  pa: "BIS, ਭਾਰਤੀ ਮਾਪਦੰਡ, ISI ਮਾਰਕ ਜਾਂ ਪਾਲਣਾ ਬਾਰੇ ਪੁੱਛੋ...",
  or: "BIS, ଭାରତୀୟ ମାନକ, ISI ମାର୍କ କିମ୍ବା ନିୟମାବଳୀ ବିଷୟରେ ପଚାରନ୍ତୁ...",
};

const MAX_CHARS = 2000;

export function ChatInput({
  onSend,
  disabled,
  isLoading,
  onVoiceClick,
  onVisionClick,
}: ChatInputProps) {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || isLoading) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition p-3"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        disabled={disabled || isLoading}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setText(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDERS[language] || PLACEHOLDERS.en}
        className="w-full bg-transparent border-0 resize-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none pr-12 min-h-[44px] max-h-[180px] leading-relaxed"
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {/* Multimodal Quick Input Buttons */}
          {onVoiceClick && (
            <button
              type="button"
              onClick={onVoiceClick}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Voice Speech Query (Hindi / English)"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          {onVisionClick && (
            <button
              type="button"
              onClick={onVisionClick}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Upload / Scan Product Label or ISI Mark"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          <span className="hidden sm:inline text-[11px] text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
              Enter
            </kbd>{" "}
            to send
          </span>
          <span className="hidden sm:inline">•</span>
          <span
            className={
              text.length >= MAX_CHARS - 100
                ? "text-rose-500 font-semibold"
                : "text-slate-400 text-[11px]"
            }
          >
            {text.length}/{MAX_CHARS}
          </span>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || disabled || isLoading}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition shrink-0"
        >
          {isLoading ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </div>
    </form>
  );
}
