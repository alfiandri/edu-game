"use client";

import { useState } from "react";
import { useChildStore } from "@/stores/child-store";
import type { LeaderboardEntry, LeaderboardPeriod } from "@/lib/types";
import LeaderboardComponent from "@/components/gamification/Leaderboard";

// Demo leaderboard data (MVP — in production from Supabase)
function generateDemoEntries(
  childId: string,
  childName: string,
  childXP: number,
  period: LeaderboardPeriod
): LeaderboardEntry[] {
  const multiplier = period === "daily" ? 0.1 : period === "weekly" ? 0.5 : 1;
  const names = [
    "Alex", "Jordan", "Sam", "Taylor", "Morgan",
    "Riley", "Casey", "Quinn", "Avery", "Dakota",
  ];

  const entries: LeaderboardEntry[] = names.map((name, i) => ({
    child_id: `demo-${i}`,
    age_tier: "early_elementary",
    period,
    xp_total: Math.round((1000 - i * 80) * multiplier),
    rank: i + 1,
    updated_at: new Date().toISOString(),
    child: { display_name: name, avatar_config: null },
  }));

  // Insert the real child
  const childEntry: LeaderboardEntry = {
    child_id: childId,
    age_tier: "early_elementary",
    period,
    xp_total: Math.round(childXP * multiplier),
    rank: 0,
    updated_at: new Date().toISOString(),
    child: { display_name: childName, avatar_config: null },
  };

  entries.push(childEntry);
  entries.sort((a, b) => b.xp_total - a.xp_total);
  entries.forEach((e, i) => (e.rank = i + 1));

  return entries.slice(0, 15);
}

export default function LeaderboardPage() {
  const { selectedChild } = useChildStore();
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");

  if (!selectedChild) return null;

  const entries = generateDemoEntries(
    selectedChild.id,
    selectedChild.display_name,
    selectedChild.xp_total,
    period
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🏆 Leaderboard</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
        <LeaderboardComponent
          entries={entries}
          currentChildId={selectedChild.id}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>
    </div>
  );
}
