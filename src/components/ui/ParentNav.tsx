"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface ParentNavProps {
  displayName: string;
}

export default function ParentNav({ displayName }: ParentNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/parent/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-bold text-purple-700">
              {t.common.eduGame}
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/parent/dashboard"
              className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
            >
              {t.play.dashboard}
            </Link>
            <Link
              href="/parent/children/new"
              className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
            >
              {t.play.addChild}
            </Link>
            <Link
              href="/play/select-child"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              {t.play.playMode}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <span className="text-sm text-gray-500">
            👋 {displayName}
          </span>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              {t.common.signOut}
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
