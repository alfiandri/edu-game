"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types";
import { formatXP } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentChildId: string;
  period: "daily" | "weekly" | "alltime";
  onPeriodChange: (period: "daily" | "weekly" | "alltime") => void;
}

export default function Leaderboard({
  entries,
  currentChildId,
  period,
  onPeriodChange,
}: LeaderboardProps) {
  const { t } = useTranslation();
  const periods = [
    { key: "daily" as const, label: t.common.today },
    { key: "weekly" as const, label: t.common.thisWeek },
    { key: "alltime" as const, label: t.common.allTime },
  ];

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="w-full">
      {/* Period Tabs */}
      <div className="flex gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => onPeriodChange(p.key)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              period === p.key
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const isCurrentChild = entry.child_id === currentChildId;
          return (
            <motion.div
              key={entry.child_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${
                isCurrentChild
                  ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-md"
                  : "bg-white border border-gray-100 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl font-bold w-10 text-center">
                {getMedalEmoji(entry.rank)}
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                {entry.child?.display_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <span className={`font-bold ${isCurrentChild ? "text-purple-700" : "text-gray-800"}`}>
                  {entry.child?.display_name || t.common.player}
                  {isCurrentChild && ` ${t.common.you}`}
                </span>
              </div>
              <span className="font-bold text-purple-600">
                {formatXP(entry.xp_total)} XP
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
