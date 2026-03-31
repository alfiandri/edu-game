import type { Badge, BadgeCriteria, ChildBadge, GameSession } from "@/lib/types";

export interface BadgeCheckContext {
  totalGamesCompleted: number;
  gamesCompletedBySubject: Record<string, number>;
  perfectScoreCount: number;
  currentStreak: number;
  longestStreak: number;
  xpTotal: number;
  averageAccuracy: number;
  earnedBadgeIds: Set<string>;
}

export function checkBadgeEligibility(
  badge: Badge,
  context: BadgeCheckContext
): boolean {
  if (context.earnedBadgeIds.has(badge.id)) return false;

  const criteria = badge.criteria as BadgeCriteria;

  switch (criteria.type) {
    case "first_game":
      return context.totalGamesCompleted >= 1;

    case "games_completed":
      return context.totalGamesCompleted >= (criteria.count ?? 1);

    case "subject_games":
      if (!criteria.subject) return false;
      return (context.gamesCompletedBySubject[criteria.subject] ?? 0) >= (criteria.count ?? 1);

    case "perfect_score":
      return context.perfectScoreCount >= (criteria.count ?? 1);

    case "streak_days":
      return context.currentStreak >= (criteria.count ?? 1);

    case "xp_total":
      return context.xpTotal >= (criteria.threshold ?? 0);

    case "accuracy_avg":
      return context.averageAccuracy >= (criteria.threshold ?? 0);

    default:
      return false;
  }
}

export function evaluateBadges(
  allBadges: Badge[],
  context: BadgeCheckContext
): Badge[] {
  return allBadges.filter((badge) => checkBadgeEligibility(badge, context));
}

// Default badge definitions for seeding
export const DEFAULT_BADGES: Omit<Badge, "id">[] = [
  {
    slug: "first_game",
    name: "First Steps",
    description: "Complete your very first game!",
    icon_url: null,
    criteria: { type: "first_game" } as BadgeCriteria,
  },
  {
    slug: "math_beginner",
    name: "Math Explorer",
    description: "Complete 5 math games",
    icon_url: null,
    criteria: { type: "subject_games", subject: "math", count: 5 } as BadgeCriteria,
  },
  {
    slug: "math_whiz",
    name: "Math Whiz",
    description: "Complete 25 math games",
    icon_url: null,
    criteria: { type: "subject_games", subject: "math", count: 25 } as BadgeCriteria,
  },
  {
    slug: "coding_beginner",
    name: "Code Explorer",
    description: "Complete 5 coding games",
    icon_url: null,
    criteria: { type: "subject_games", subject: "coding-logic", count: 5 } as BadgeCriteria,
  },
  {
    slug: "coding_whiz",
    name: "Code Master",
    description: "Complete 25 coding games",
    icon_url: null,
    criteria: { type: "subject_games", subject: "coding-logic", count: 25 } as BadgeCriteria,
  },
  {
    slug: "perfect_score_1",
    name: "Perfect!",
    description: "Get a perfect score in any game",
    icon_url: null,
    criteria: { type: "perfect_score", count: 1 } as BadgeCriteria,
  },
  {
    slug: "perfect_score_5",
    name: "Perfectionist",
    description: "Get 5 perfect scores",
    icon_url: null,
    criteria: { type: "perfect_score", count: 5 } as BadgeCriteria,
  },
  {
    slug: "streak_3",
    name: "Getting Warmed Up",
    description: "Play 3 days in a row",
    icon_url: null,
    criteria: { type: "streak_days", count: 3 } as BadgeCriteria,
  },
  {
    slug: "streak_7",
    name: "Week Warrior",
    description: "Play 7 days in a row",
    icon_url: null,
    criteria: { type: "streak_days", count: 7 } as BadgeCriteria,
  },
  {
    slug: "streak_30",
    name: "Monthly Champion",
    description: "Play 30 days in a row",
    icon_url: null,
    criteria: { type: "streak_days", count: 30 } as BadgeCriteria,
  },
  {
    slug: "xp_100",
    name: "Rising Star",
    description: "Earn 100 XP total",
    icon_url: null,
    criteria: { type: "xp_total", threshold: 100 } as BadgeCriteria,
  },
  {
    slug: "xp_500",
    name: "Shining Star",
    description: "Earn 500 XP total",
    icon_url: null,
    criteria: { type: "xp_total", threshold: 500 } as BadgeCriteria,
  },
  {
    slug: "xp_1000",
    name: "Superstar",
    description: "Earn 1,000 XP total",
    icon_url: null,
    criteria: { type: "xp_total", threshold: 1000 } as BadgeCriteria,
  },
  {
    slug: "xp_5000",
    name: "Legend",
    description: "Earn 5,000 XP total",
    icon_url: null,
    criteria: { type: "xp_total", threshold: 5000 } as BadgeCriteria,
  },
  {
    slug: "accuracy_90",
    name: "Sharp Mind",
    description: "Maintain 90% average accuracy",
    icon_url: null,
    criteria: { type: "accuracy_avg", threshold: 90 } as BadgeCriteria,
  },
  {
    slug: "ten_games",
    name: "Dedicated Learner",
    description: "Complete 10 games total",
    icon_url: null,
    criteria: { type: "games_completed", count: 10 } as BadgeCriteria,
  },
  {
    slug: "fifty_games",
    name: "Knowledge Seeker",
    description: "Complete 50 games total",
    icon_url: null,
    criteria: { type: "games_completed", count: 50 } as BadgeCriteria,
  },
  {
    slug: "hundred_games",
    name: "Grand Scholar",
    description: "Complete 100 games total",
    icon_url: null,
    criteria: { type: "games_completed", count: 100 } as BadgeCriteria,
  },
];
