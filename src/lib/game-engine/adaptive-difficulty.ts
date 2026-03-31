import type { DifficultyState } from "@/lib/types";

const CORRECT_STREAK_THRESHOLD = 3;
const WRONG_STREAK_THRESHOLD = 2;
const DIFFICULTY_STEP = 0.5;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;

export interface DifficultyUpdate {
  newLevel: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
}

export function calculateDifficultyUpdate(
  currentState: Pick<DifficultyState, "current_level" | "consecutive_correct" | "consecutive_wrong">,
  isCorrect: boolean
): DifficultyUpdate {
  let { current_level, consecutive_correct, consecutive_wrong } = currentState;

  if (isCorrect) {
    consecutive_correct += 1;
    consecutive_wrong = 0;
  } else {
    consecutive_wrong += 1;
    consecutive_correct = 0;
  }

  let newLevel = current_level;

  if (consecutive_correct >= CORRECT_STREAK_THRESHOLD) {
    newLevel = Math.min(MAX_DIFFICULTY, current_level + DIFFICULTY_STEP);
    consecutive_correct = 0; // Reset after adjustment
  } else if (consecutive_wrong >= WRONG_STREAK_THRESHOLD) {
    newLevel = Math.max(MIN_DIFFICULTY, current_level - DIFFICULTY_STEP);
    consecutive_wrong = 0; // Reset after adjustment
  }

  return {
    newLevel: Math.round(newLevel * 10) / 10,
    consecutiveCorrect: consecutive_correct,
    consecutiveWrong: consecutive_wrong,
  };
}

export function getQuestionDifficultyRange(currentLevel: number): { min: number; max: number } {
  return {
    min: Math.max(MIN_DIFFICULTY, Math.floor(currentLevel - 1)),
    max: Math.min(MAX_DIFFICULTY, Math.ceil(currentLevel + 1)),
  };
}

export function getDifficultyMultiplier(level: number): number {
  // 1.0x at level 1, up to 2.5x at level 10
  return 1 + (level - 1) * (1.5 / 9);
}

export function getInitialDifficulty(ageTier: string): number {
  switch (ageTier) {
    case "preschool":
      return 1;
    case "early_elementary":
      return 3;
    case "upper_elementary":
      return 5;
    default:
      return 1;
  }
}
