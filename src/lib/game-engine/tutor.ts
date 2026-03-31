import type { TutorMessage } from "@/lib/types";

const ENCOURAGEMENT_CORRECT = [
  "Amazing job! You got it right! 🎉",
  "You're a superstar! ⭐",
  "Fantastic! Keep going! 🚀",
  "Way to go! That was perfect! 💪",
  "Brilliant! You're so smart! 🧠",
  "Awesome! You're on fire! 🔥",
  "Incredible work! 🌟",
  "Yes! Nailed it! 🎯",
  "You're doing so great! 💖",
  "That's the right answer! Well done! 👏",
];

const ENCOURAGEMENT_WRONG = [
  "Good try! Let's look at this together. 🤔",
  "Almost there! Don't give up! 💪",
  "That takes courage to try! Let's learn from this. 📚",
  "Oops! But mistakes help us learn! 🌱",
  "Not quite, but you're getting closer! 🎯",
  "Keep going — every mistake makes you smarter! 🧠",
  "That's okay! Let's try to understand why. 💡",
];

const STREAK_MESSAGES: Record<number, string> = {
  3: "Three in a row! You're on a roll! 🎳",
  5: "FIVE correct! Unstoppable! 🏆",
  7: "Seven streak! You're a genius! 🌟",
  10: "TEN IN A ROW! LEGENDARY! 👑",
};

const CELEBRATION_MESSAGES = [
  "🎉🎊 Level Complete! 🎊🎉",
  "🏆 Amazing performance! 🏆",
  "⭐ You earned a star! ⭐",
];

export function getTutorMessage(
  isCorrect: boolean,
  consecutiveCorrect: number,
  explanation?: string
): TutorMessage {
  if (isCorrect) {
    // Check for streak milestone
    if (STREAK_MESSAGES[consecutiveCorrect]) {
      return {
        type: "celebration",
        text: STREAK_MESSAGES[consecutiveCorrect],
      };
    }
    return {
      type: "encouragement",
      text: ENCOURAGEMENT_CORRECT[Math.floor(Math.random() * ENCOURAGEMENT_CORRECT.length)],
    };
  }

  const base = ENCOURAGEMENT_WRONG[Math.floor(Math.random() * ENCOURAGEMENT_WRONG.length)];
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

export function getHintMessage(hintIndex: number, totalHints: number): TutorMessage {
  const prefix =
    hintIndex === 0
      ? "Here's a little help: "
      : hintIndex === 1
        ? "Another clue: "
        : "Big hint: ";

  return {
    type: "hint",
    text: prefix,
  };
}

export function getCompletionMessage(accuracy: number, xpEarned: number): TutorMessage {
  let text: string;
  if (accuracy >= 90) {
    text = `🌟 Outstanding! ${accuracy}% accuracy — you earned ${xpEarned} XP! You're a champion!`;
  } else if (accuracy >= 70) {
    text = `💪 Great job! ${accuracy}% accuracy — you earned ${xpEarned} XP! Keep practicing!`;
  } else if (accuracy >= 50) {
    text = `👍 Good effort! ${accuracy}% accuracy — you earned ${xpEarned} XP! Practice makes perfect!`;
  } else {
    text = `🌱 Nice try! ${accuracy}% accuracy — you earned ${xpEarned} XP! Let's try again and improve!`;
  }

  return { type: "celebration", text };
}
