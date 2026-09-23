"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Language, TranslationKey, translations } from "./translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "ft-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "ca") {
        setLanguageState(stored);
      }
    } catch {
      // localStorage unavailable, keep default
    }
  }, []);

  function setLanguage(next: Language) {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable, ignore
    }
  }

  function t(key: TranslationKey, params?: Record<string, string>): string {
    let value: string = translations[language][key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [param, replacement] of Object.entries(params)) {
        value = value.replace(`{${param}}`, replacement);
      }
    }
    return value;
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
