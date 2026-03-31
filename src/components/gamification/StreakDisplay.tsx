"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const { t } = useTranslation();
  const flameSize = Math.min(currentStreak, 10);

  return (
    <div className="flex items-center gap-4">
      <motion.div
        animate={
          currentStreak > 0
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }
            : {}
        }
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="relative"
      >
        <span
          className="block"
          style={{ fontSize: `${Math.max(24, 24 + flameSize * 4)}px` }}
        >
          {currentStreak > 0 ? "🔥" : "❄️"}
        </span>
      </motion.div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-orange-600">
            {currentStreak}
          </span>
          <span className="text-sm font-semibold text-gray-500">
            {currentStreak !== 1 ? t.common.daysStreak : t.common.dayStreak}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {t.common.best}: {longestStreak} {longestStreak !== 1 ? t.common.days : t.common.day}
        </p>
      </div>
    </div>
  );
}
