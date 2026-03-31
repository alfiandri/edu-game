import type { TutorMessage } from "@/lib/types";
import type { Translations } from "@/lib/i18n";
import { interpolate } from "@/lib/i18n";

export function getTutorMessage(
  isCorrect: boolean,
  consecutiveCorrect: number,
  t: Translations,
  explanation?: string
): TutorMessage {
  const streakMessages: Record<number, string> = {
    3: t.tutor.streak3,
    5: t.tutor.streak5,
    7: t.tutor.streak7,
    10: t.tutor.streak10,
  };

  if (isCorrect) {
    if (streakMessages[consecutiveCorrect]) {
      return {
        type: "celebration",
        text: streakMessages[consecutiveCorrect],
      };
    }
    return {
      type: "encouragement",
      text: t.tutor.correct[Math.floor(Math.random() * t.tutor.correct.length)],
    };
  }

  const base = t.tutor.wrong[Math.floor(Math.random() * t.tutor.wrong.length)];
  if (explanation) {
    return {
      type: "explanation",
      text: `${base}\n\n${explanation}`,
    };
  }
  return {
    type: "encouragement",
    text: base,
  };
}

export function getHintMessage(hintIndex: number, totalHints: number, t: Translations): TutorMessage {
  const prefix =
    hintIndex === 0
      ? t.tutor.hintPrefix1
      : hintIndex === 1
        ? t.tutor.hintPrefix2
        : t.tutor.hintPrefix3;

  return {
    type: "hint",
    text: prefix,
  };
}

export function getCompletionMessage(accuracy: number, xpEarned: number, t: Translations): TutorMessage {
  let text: string;
  if (accuracy >= 90) {
    text = interpolate(t.tutor.completionOutstanding, { accuracy, xp: xpEarned });
  } else if (accuracy >= 70) {
    text = interpolate(t.tutor.completionGreat, { accuracy, xp: xpEarned });
  } else if (accuracy >= 50) {
    text = interpolate(t.tutor.completionGood, { accuracy, xp: xpEarned });
  } else {
    text = interpolate(t.tutor.completionTry, { accuracy, xp: xpEarned });
  }

  return { type: "celebration", text };
}
