import { getDifficultyMultiplier } from "../game-engine/adaptive-difficulty";

const BASE_XP_PER_QUESTION = 10;
const HINT_PENALTY_FRACTION = 0.33;
const ACCURACY_BONUS_THRESHOLD = 80;
const ACCURACY_BONUS_MULTIPLIER = 1.5;

export function calculateQuestionXP(
  baseXP: number,
  difficultyLevel: number,
  hintsUsed: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return 0;
  const multiplier = getDifficultyMultiplier(difficultyLevel);
  const hintPenalty = 1 - hintsUsed * HINT_PENALTY_FRACTION;
  return Math.round(baseXP * multiplier * Math.max(hintPenalty, 0.01));
}

export function calculateSessionXP(
  totalCorrect: number,
  totalQuestions: number,
  questionXPSum: number,
  difficultyLevel: number
): number {
  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  let bonus = 1;
  if (accuracy >= ACCURACY_BONUS_THRESHOLD) {
    bonus = ACCURACY_BONUS_MULTIPLIER;
  }
  return Math.round(questionXPSum * bonus);
}

export function calculateCurrencyEarned(xpEarned: number): number {
  // 1 coin per 5 XP
  return Math.floor(xpEarned / 5);
}

export const STREAK_BONUSES: Record<number, number> = {
  3: 50,   // 3-day streak bonus
  7: 150,  // 7-day streak bonus
  14: 300, // 14-day streak bonus
  30: 750, // 30-day streak bonus
};

export function getStreakBonus(streakDays: number): number {
  let bonus = 0;
  for (const [days, xp] of Object.entries(STREAK_BONUSES)) {
    if (streakDays >= parseInt(days)) {
      bonus = xp;
    }
  }
  return bonus;
}
