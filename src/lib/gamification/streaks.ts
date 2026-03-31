export function calculateStreak(activityDates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (activityDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Sort dates in descending order
  const sorted = [...activityDates].sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split("T")[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if the most recent activity was today or yesterday
  const mostRecent = sorted[0];
  const dayDiff = dateDiffDays(mostRecent, today);

  if (dayDiff > 1) {
    // Streak is broken, current streak is 0
    currentStreak = 0;
  }

  // Calculate streaks
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = dateDiffDays(sorted[i + 1], sorted[i]);
    if (diff === 1) {
      tempStreak++;
    } else if (diff > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
    // diff === 0 means same day, skip
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Current streak: count consecutive days backwards from today
  if (dayDiff <= 1) {
    currentStreak = 1;
    let checkDate = mostRecent;
    for (let i = 1; i < sorted.length; i++) {
      const diff = dateDiffDays(sorted[i], checkDate);
      if (diff === 1) {
        currentStreak++;
        checkDate = sorted[i];
      } else if (diff > 1) {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

function dateDiffDays(earlier: string, later: string): number {
  const d1 = new Date(earlier);
  const d2 = new Date(later);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isNewDay(lastActiveDate: string | null): boolean {
  if (!lastActiveDate) return true;
  const today = new Date().toISOString().split("T")[0];
  return lastActiveDate !== today;
}
