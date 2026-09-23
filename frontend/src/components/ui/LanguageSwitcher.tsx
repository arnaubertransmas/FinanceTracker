"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="join">
      <button
        type="button"
        className={`join-item btn btn-xs ${language === "en" ? "btn-primary" : "btn-ghost bg-base-200"}`}
        onClick={() => setLanguage("en")}
        aria-label="English"
      >
        EN
      </button>
      <button
        type="button"
        className={`join-item btn btn-xs ${language === "ca" ? "btn-primary" : "btn-ghost bg-base-200"}`}
        onClick={() => setLanguage("ca")}
        aria-label="Català"
      >
        CA
      </button>
    </div>
  );
}
