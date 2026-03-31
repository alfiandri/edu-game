"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Child, GameSession, ChildBadge } from "@/lib/types";
import { formatXP } from "@/lib/utils";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import StreakDisplay from "@/components/gamification/StreakDisplay";
import XPBar from "@/components/gamification/XPBar";
import { getLevelFromXP } from "@/components/gamification/XPBar";

interface Props {
  child: Child;
  sessions: GameSession[];
  childBadges: ChildBadge[];
}

export default function ChildAnalyticsClient({
  child,
  sessions,
  childBadges,
}: Props) {
  const stats = useMemo(() => {
    const totalGames = sessions.length;
    const avgAccuracy =
      totalGames > 0
        ? Math.round(
            sessions.reduce((s, ses) => s + ses.accuracy_pct, 0) / totalGames
          )
        : 0;
    const totalXPEarned = sessions.reduce((s, ses) => s + ses.xp_earned, 0);

    // Difficulty trend (last 10 sessions)
    const recentSessions = sessions.slice(0, 10);
    const difficultyTrend = recentSessions.map((s) => ({
      date: new Date(s.started_at).toLocaleDateString(),
      difficulty: s.difficulty_level_end,
      accuracy: s.accuracy_pct,
    }));

    // Insights
    const insights: string[] = [];
    if (avgAccuracy >= 90) {
      insights.push("🌟 Excellent accuracy! Your child is mastering the content.");
    } else if (avgAccuracy >= 70) {
      insights.push("👍 Good progress! Accuracy is solid and improving.");
    } else if (avgAccuracy >= 50) {
      insights.push("📈 Progressing well. More practice will boost accuracy further.");
    } else if (totalGames > 0) {
      insights.push("💪 Keep encouraging practice — every game builds skills!");
    }

    if (child.current_streak >= 7) {
      insights.push(`🔥 Amazing ${child.current_streak}-day streak! Consistency is key.`);
    } else if (child.current_streak >= 3) {
      insights.push(`🔥 ${child.current_streak}-day streak going strong!`);
    }

    const avgDifficulty =
      recentSessions.length > 0
        ? recentSessions.reduce((s, ses) => s + ses.difficulty_level_end, 0) /
          recentSessions.length
        : 0;
    if (avgDifficulty > 6) {
      insights.push("🚀 Working at advanced difficulty levels. Very impressive!");
    }

    return { totalGames, avgAccuracy, totalXPEarned, difficultyTrend, insights };
  }, [sessions, child]);

  const level = getLevelFromXP(child.xp_total);

  return (
    <div>
      <Link
        href="/parent/dashboard"
        className="text-sm text-purple-600 font-semibold hover:text-purple-700 mb-4 inline-block"
      >
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl text-white font-bold shadow-lg">
          {child.display_name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {child.display_name}
          </h1>
          <p className="text-gray-500 capitalize">
            {child.age_tier.replace("_", " ")} · Born{" "}
            {new Date(child.date_of_birth).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* XP Bar */}
      <Card className="mb-6">
        <XPBar
          currentXP={child.xp_total}
          levelXP={level.currentLevelXP}
          level={level.level}
        />
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="stat">
          <p className="text-3xl font-bold text-purple-600">
            {formatXP(child.xp_total)}
          </p>
          <p className="text-sm text-gray-500">Total XP</p>
        </Card>
        <Card variant="stat">
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalGames}
          </p>
          <p className="text-sm text-gray-500">Games Played</p>
        </Card>
        <Card variant="stat">
          <p className="text-3xl font-bold text-green-600">
            {stats.avgAccuracy}%
          </p>
          <p className="text-sm text-gray-500">Avg Accuracy</p>
        </Card>
        <Card variant="stat">
          <p className="text-3xl font-bold text-yellow-600">
            {child.currency_balance}
          </p>
          <p className="text-sm text-gray-500">🪙 Coins</p>
        </Card>
      </div>

      {/* Streak & Insights */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-bold text-gray-700 mb-3">Streak</h3>
          <StreakDisplay
            currentStreak={child.current_streak}
            longestStreak={child.longest_streak}
          />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-gray-700 mb-3">
            Learning Insights
          </h3>
          {stats.insights.length > 0 ? (
            <ul className="space-y-2">
              {stats.insights.map((insight, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-600 p-2 rounded-xl bg-gray-50"
                >
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">
              Play some games to see insights here!
            </p>
          )}
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="mb-8">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          Recent Game Sessions
        </h3>
        {sessions.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            No games played yet. Start playing to see progress! 🎮
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
              >
                <div>
                  <p className="text-sm font-bold text-gray-700">
                    Game Session
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(session.started_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-600">
                      {session.accuracy_pct}%
                    </p>
                    <p className="text-xs text-gray-400">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-purple-600">
                      +{session.xp_earned}
                    </p>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Badges */}
      <Card>
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          Badges Earned ({childBadges.length})
        </h3>
        {childBadges.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            Complete games to earn badges! 🏅
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {childBadges.map((cb) => (
              <div
                key={cb.badge_id}
                className="flex flex-col items-center p-3 rounded-2xl bg-yellow-50 border border-yellow-200"
              >
                <span className="text-3xl mb-1">🏅</span>
                <span className="text-xs font-bold text-center text-gray-700">
                  {cb.badge?.name || "Badge"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
