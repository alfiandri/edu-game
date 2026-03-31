"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Badge } from "@/lib/types";

interface BadgePopupProps {
  badge: Badge | null;
  show: boolean;
  onClose: () => void;
}

export function BadgePopup({ badge, show, onClose }: BadgePopupProps) {
  if (!badge) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative z-10 flex flex-col items-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-10 shadow-2xl border-4 border-yellow-400"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-8xl mb-4"
            >
              🏅
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Badge Unlocked!
            </h2>
            <h3 className="text-xl font-bold text-purple-600 mb-2">
              {badge.name}
            </h3>
            <p className="text-gray-600 text-center max-w-xs mb-6">
              {badge.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-3 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-700 text-white font-bold shadow-lg"
            >
              Awesome! 🎉
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface BadgeDisplayProps {
  badges: (Badge & { earned: boolean; earned_at?: string })[];
}

export function BadgeGrid({ badges }: BadgeDisplayProps) {
  const BADGE_EMOJIS: Record<string, string> = {
    first_game: "🎮",
    math_beginner: "🔢",
    math_whiz: "🧮",
    coding_beginner: "💻",
    coding_whiz: "🖥️",
    perfect_score_1: "💯",
    perfect_score_5: "🌟",
    streak_3: "🔥",
    streak_7: "⚔️",
    streak_30: "👑",
    xp_100: "⭐",
    xp_500: "🌟",
    xp_1000: "💫",
    xp_5000: "🏆",
    accuracy_90: "🎯",
    ten_games: "📚",
    fifty_games: "🎓",
    hundred_games: "🏅",
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {badges.map((badge) => (
        <motion.div
          key={badge.id}
          whileHover={{ scale: 1.1 }}
          className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
            badge.earned
              ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-md"
              : "bg-gray-100 border-2 border-gray-200 opacity-40"
          }`}
        >
          <span className="text-3xl mb-1">
            {BADGE_EMOJIS[badge.slug] || "🏅"}
          </span>
          <span className="text-xs font-bold text-center text-gray-700 leading-tight">
            {badge.name}
          </span>
          {badge.earned && badge.earned_at && (
            <span className="text-[10px] text-gray-500 mt-0.5">
              {new Date(badge.earned_at).toLocaleDateString()}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
