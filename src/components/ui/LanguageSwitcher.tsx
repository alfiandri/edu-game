"use client";

import { useTranslation } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  id: "ID",
};

const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  id: "🇮🇩",
};

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  const toggle = () => {
    setLocale(locale === "en" ? "id" : "en");
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all hover:bg-gray-100 border border-gray-200 ${className}`}
      title={locale === "en" ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
    >
      <span>{LOCALE_FLAGS[locale]}</span>
      <span className="text-gray-700">{LOCALE_LABELS[locale]}</span>
    </button>
  );
}
