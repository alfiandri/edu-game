"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChildStore } from "@/stores/child-store";
import type { Child } from "@/lib/types";
import Link from "next/link";
import XPBar from "@/components/gamification/XPBar";
import StreakDisplay from "@/components/gamification/StreakDisplay";
import { getLevelFromXP } from "@/components/gamification/XPBar";
import { motion } from "framer-motion";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { selectedChild, setSelectedChild } = useChildStore();
  const [loading, setLoading] = useState(!selectedChild);

  useEffect(() => {
    if (selectedChild) return;

    async function loadChild() {
      const childId = document.cookie
        .split("; ")
        .find((c) => c.startsWith("selected_child_id="))
        ?.split("=")[1];

      if (!childId) {
        router.push("/play/select-child");
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (data) {
        setSelectedChild(data as Child);
      } else {
        router.push("/play/select-child");
      }
      setLoading(false);
    }
    loadChild();
  }, [selectedChild, setSelectedChild, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="text-5xl animate-bounce">🎮</div>
      </div>
    );
  }

  if (!selectedChild) return null;

  const level = getLevelFromXP(selectedChild.xp_total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Kid-friendly nav */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/play" className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="text-lg font-bold text-purple-700 hidden sm:inline">
                EduGame
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/play"
                className="px-3 py-1.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-100 transition-colors"
              >
                🗺️ Map
              </Link>
              <Link
                href="/play/shop"
                className="px-3 py-1.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-100 transition-colors"
              >
                🛍️ Shop
              </Link>
              <Link
                href="/play/profile"
                className="px-3 py-1.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-100 transition-colors"
              >
                👤 Avatar
              </Link>
              <Link
                href="/play/leaderboard"
                className="px-3 py-1.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-100 transition-colors"
              >
                🏆 Rankings
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-yellow-100 border border-yellow-300">
              <span>🪙</span>
              <span className="text-sm font-bold text-yellow-700">
                {selectedChild.currency_balance}
              </span>
            </div>

            {/* XP Mini */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-100 border border-purple-300">
              <span className="text-sm font-bold text-purple-700">
                ⭐ {selectedChild.xp_total} XP
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-100 border border-orange-300">
              <span>🔥</span>
              <span className="text-sm font-bold text-orange-700">
                {selectedChild.current_streak}
              </span>
            </div>

            {/* Player */}
            <Link
              href="/play/select-child"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                {selectedChild.display_name[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:inline">
                {selectedChild.display_name}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          <Link href="/play" className="flex flex-col items-center gap-0.5 p-1">
            <span className="text-xl">🗺️</span>
            <span className="text-[10px] font-bold text-gray-600">Map</span>
          </Link>
          <Link href="/play/shop" className="flex flex-col items-center gap-0.5 p-1">
            <span className="text-xl">🛍️</span>
            <span className="text-[10px] font-bold text-gray-600">Shop</span>
          </Link>
          <Link href="/play/profile" className="flex flex-col items-center gap-0.5 p-1">
            <span className="text-xl">👤</span>
            <span className="text-[10px] font-bold text-gray-600">Avatar</span>
          </Link>
          <Link href="/play/leaderboard" className="flex flex-col items-center gap-0.5 p-1">
            <span className="text-xl">🏆</span>
            <span className="text-[10px] font-bold text-gray-600">Rank</span>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
}
