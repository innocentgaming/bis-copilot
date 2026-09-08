"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IndianLanguageCode, LanguageOption, SUPPORTED_LANGUAGES } from "@/types/bis_platform";

interface LanguageContextType {
  language: IndianLanguageCode;
  setLanguage: (lang: IndianLanguageCode) => void;
  activeLanguage: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "bis_copilot_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<IndianLanguageCode>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as IndianLanguageCode;
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        setLanguageState(stored);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const setLanguage = (lang: IndianLanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const activeLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, activeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en" as IndianLanguageCode,
      setLanguage: () => {},
      activeLanguage: SUPPORTED_LANGUAGES[0],
    };
  }
  return context;
}
