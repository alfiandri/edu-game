"use client";

import { motion } from "framer-motion";
import { formatXP } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface XPBarProps {
  currentXP: number;
  levelXP: number;
  level: number;
}

function getLevelFromXP(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
  // Each level requires progressively more XP
  // Level 1: 0-100, Level 2: 100-250, Level 3: 250-500, etc.
  let level = 1;
  let totalRequired = 0;
  let nextRequired = 100;

  while (xp >= totalRequired + nextRequired) {
    totalRequired += nextRequired;
    level++;
    nextRequired = Math.floor(nextRequired * 1.5);
  }

  return {
    level,
    currentLevelXP: xp - totalRequired,
    nextLevelXP: nextRequired,
  };
}

export default function XPBar({ currentXP, levelXP, level }: XPBarProps) {
  const { t } = useTranslation();
  const { currentLevelXP, nextLevelXP } = getLevelFromXP(currentXP);
  const percentage = (currentLevelXP / nextLevelXP) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm shadow-lg">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
          <span>{t.gamification.levelLabel} {level}</span>
          <span>
            {formatXP(currentLevelXP)} / {formatXP(nextLevelXP)} {t.common.xp}
          </span>
        </div>
        <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
          />
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-purple-600">
          {formatXP(currentXP)} {t.common.xp}
        </span>
      </div>
    </div>
  );
}

export { getLevelFromXP };
