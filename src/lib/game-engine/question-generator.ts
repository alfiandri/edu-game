import type { Question, QuestionData, GameType, AgeTier } from "@/lib/types";
import type { Translations } from "@/lib/i18n";
import { interpolate } from "@/lib/i18n";

// ── Math Question Generator ────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EMOJIS = ["🍎", "⭐", "🐟", "🎈", "🌸", "🐱", "🦋", "🍕", "🚀", "🎵"];

// ── Counting (Preschool) ───────────────────────────────────

function generateCountingQuestion(difficulty: number, t: Translations): {
  data: QuestionData;
  answer: number;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const maxCount = Math.min(2 + difficulty * 2, 20);
  const count = randomInt(1, maxCount);
  const emoji = EMOJIS[randomInt(0, EMOJIS.length - 1)];

  return {
    data: {
      type: "counting",
      prompt: interpolate(t.questions.howMany, { emoji }),
      objectCount: count,
      objectEmoji: emoji,
    },
    answer: count,
    hints: [
      t.questions.hintCount1,
      interpolate(t.questions.hintCount2, { emoji }),
      interpolate(t.questions.hintCount3, { min: Math.max(1, count - 2), max: count + 2 }),
    ],
    explanation: interpolate(t.questions.explanationCount, { count, emoji }),
    xp: 5 + difficulty,
  };
}

// ── Addition/Subtraction ───────────────────────────────────

function generateAddSubQuestion(difficulty: number, t: Translations): {
  data: QuestionData;
  answer: number;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const isAddition = Math.random() > 0.4;
  const maxNum = Math.min(5 + difficulty * 3, 50);
  const a = randomInt(1, maxNum);
  const b = randomInt(1, isAddition ? maxNum : a);
  const answer = isAddition ? a + b : a - b;
  const op = isAddition ? "+" : "-";
  const prompt = interpolate(t.questions.whatIs, { expression: `${a} ${op} ${b}` });

  const options = generateNumberOptions(answer, 4, 0, maxNum * 2);

  return {
    data: {
      type: "multiple_choice",
      prompt,
      options: options.map(String),
    },
    answer,
    hints: [
      isAddition
        ? interpolate(t.questions.hintAddUp, { a, b })
        : interpolate(t.questions.hintSubDown, { a, b }),
      isAddition
        ? interpolate(t.questions.hintAddMore, { a, b, a2: a })
        : interpolate(t.questions.hintSubLess, { a, b, a2: a }),
      interpolate(t.questions.hintClose, { answer }),
    ],
    explanation: `${a} ${op} ${b} = ${answer}`,
    xp: 8 + difficulty * 2,
  };
}

// ── Multiplication ─────────────────────────────────────────

function generateMultiplicationQuestion(difficulty: number, t: Translations): {
  data: QuestionData;
  answer: number;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const maxFactor = Math.min(2 + difficulty, 12);
  const a = randomInt(2, maxFactor);
  const b = randomInt(2, maxFactor);
  const answer = a * b;
  const prompt = interpolate(t.questions.whatIs, { expression: `${a} × ${b}` });

  const options = generateNumberOptions(answer, 4, 1, maxFactor * maxFactor + 10);

  return {
    data: {
      type: "multiple_choice",
      prompt,
      options: options.map(String),
    },
    answer,
    hints: [
      interpolate(t.questions.hintMultGroups, { a, b }),
      interpolate(t.questions.hintMultAdd, { a, b, a2: a }),
      interpolate(t.questions.hintMultBetween, { min: answer - 5, max: answer + 5 }),
    ],
    explanation: interpolate(t.questions.explanationMult, { a, b, answer, a2: a, b2: b }),
    xp: 10 + difficulty * 2,
  };
}

// ── Fractions ──────────────────────────────────────────────

function generateFractionQuestion(difficulty: number, t: Translations): {
  data: QuestionData;
  answer: string;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const denominator = randomInt(2, Math.min(3 + difficulty, 12));
  const numerator1 = randomInt(1, denominator - 1);
  const numerator2 = randomInt(1, denominator - numerator1);
  const resultNumerator = numerator1 + numerator2;

  const expr = `${numerator1}/${denominator} + ${numerator2}/${denominator}`;
  const prompt = interpolate(t.questions.whatIs, { expression: expr });
  const answer = `${resultNumerator}/${denominator}`;

  const options = [
    answer,
    `${resultNumerator + 1}/${denominator}`,
    `${Math.max(1, resultNumerator - 1)}/${denominator}`,
    `${resultNumerator}/${denominator + 1}`,
  ];

  return {
    data: {
      type: "multiple_choice",
      prompt,
      options: shuffle(options),
    },
    answer,
    hints: [
      t.questions.hintFracSame,
      interpolate(t.questions.hintFracAdd, { a: numerator1, b: numerator2 }),
      interpolate(t.questions.hintFracBottom, { d: denominator }),
    ],
    explanation: interpolate(t.questions.explanationFrac, { expr, answer }),
    xp: 12 + difficulty * 2,
  };
}

// ── Pattern Recognition (Coding/Logic) ────────────────────

function generatePatternQuestion(difficulty: number, t: Translations): {
  data: QuestionData;
  answer: string;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const patterns = [
    { seq: ["🔴", "🔵", "🔴", "🔵", "🔴"], answer: "🔵", rule: t.questions.alternatingRedBlue },
    { seq: ["⭐", "⭐", "🌙", "⭐", "⭐"], answer: "🌙", rule: t.questions.starStarMoon },
    { seq: ["1", "2", "3", "4", "5"], answer: "6", rule: t.questions.countingBy1 },
    { seq: ["2", "4", "6", "8", "10"], answer: "12", rule: t.questions.countingBy2 },
    { seq: ["🔺", "🔵", "🔺", "🔵", "🔺"], answer: "🔵", rule: t.questions.alternatingTriangleCircle },
    { seq: ["A", "B", "C", "D", "E"], answer: "F", rule: t.questions.alphabeticalOrder },
    { seq: ["1", "3", "5", "7", "9"], answer: "11", rule: t.questions.oddNumbers },
    { seq: ["🌞", "🌧", "🌞", "🌧", "🌞"], answer: "🌧", rule: t.questions.alternatingSunRain },
  ];

  const maxIndex = Math.min(difficulty + 2, patterns.length);
  const pattern = patterns[randomInt(0, maxIndex - 1)];
  const prompt = interpolate(t.questions.whatComesNext, { sequence: pattern.seq.join("  ") });

  const wrongOptions = ["🟢", "🔶", "7", "X"].filter((o) => o !== pattern.answer);
  const options = shuffle([pattern.answer, ...wrongOptions.slice(0, 3)]);

  return {
    data: {
      type: "multiple_choice",
      prompt,
      options,
    },
    answer: pattern.answer,
    hints: [
      t.questions.hintPattern,
      interpolate(t.questions.hintPatternRule, { rule: pattern.rule }),
      interpolate(t.questions.hintPatternAnswer, { answer: pattern.answer }),
    ],
    explanation: interpolate(t.questions.explanationPattern, { rule: pattern.rule, answer: pattern.answer }),
    xp: 8 + difficulty * 2,
  };
}

// ── Sequencing (Coding/Logic) ──────────────────────────────

function generateSequencingQuestion(difficulty: number, t: Translations): {
  data: QuestionData;
  answer: number[];
  hints: string[];
  explanation: string;
  xp: number;
} {
  const sequences = [
    { items: [t.questions.wakeUp, t.questions.brushTeeth, t.questions.eatBreakfast, t.questions.goToSchool], name: t.questions.morningRoutine },
    { items: [t.questions.getIngredients, t.questions.mixBatter, t.questions.pourInPan, t.questions.bakeInOven], name: t.questions.makingCake },
    { items: [t.questions.plantSeed, t.questions.waterIt, t.questions.seedlingGrows, t.questions.flowerBlooms], name: t.questions.growingFlower },
    { items: [t.questions.openBook, t.questions.readPages, t.questions.closeBook, t.questions.thinkAboutStory], name: t.questions.readingBook },
    { items: [t.questions.putOnSocks, t.questions.putOnShoes, t.questions.tieLaces, t.questions.walkOutside], name: t.questions.gettingReady },
  ];

  const maxIndex = Math.min(difficulty + 1, sequences.length);
  const seq = sequences[randomInt(0, maxIndex - 1)];
  const correctOrder = seq.items.map((_, i) => i);

  return {
    data: {
      type: "sequencing",
      prompt: interpolate(t.questions.putInOrder, { activity: seq.name }),
      items: shuffle(seq.items),
      correctOrder,
    },
    answer: correctOrder,
    hints: [
      t.questions.hintSequence1,
      interpolate(t.questions.hintSequence2, { activity: seq.name }),
      interpolate(t.questions.hintSequence3, { step: seq.items[0] }),
    ],
    explanation: interpolate(t.questions.explanationSequence, { activity: seq.name, steps: seq.items.join(" → ") }),
    xp: 10 + difficulty * 2,
  };
}

// ── Block Programming (Coding/Logic) ──────────────────────

function generateBlockProgrammingQuestion(difficulty: number, t: Translations): {
  data: QuestionData;
  answer: string[];
  hints: string[];
  explanation: string;
  xp: number;
} {
  const gridSize = Math.min(3 + Math.floor(difficulty / 2), 8);
  const startPos = { row: 0, col: 0 };

  // Generate a simple path to goal
  const stepsRight = randomInt(1, Math.min(difficulty, gridSize - 1));
  const stepsDown = randomInt(1, Math.min(difficulty, gridSize - 1));
  const goalPos = { row: stepsDown, col: stepsRight };

  // Build the solution
  const solution: string[] = [];
  for (let i = 0; i < stepsRight; i++) solution.push("move_forward");
  solution.push("turn_right");
  for (let i = 0; i < stepsDown; i++) solution.push("move_forward");

  const obstacles: { row: number; col: number }[] = [];
  const numObstacles = Math.min(Math.floor(difficulty / 3), 3);
  for (let i = 0; i < numObstacles; i++) {
    const obsRow = randomInt(0, gridSize - 1);
    const obsCol = randomInt(0, gridSize - 1);
    if (
      (obsRow !== startPos.row || obsCol !== startPos.col) &&
      (obsRow !== goalPos.row || obsCol !== goalPos.col)
    ) {
      obstacles.push({ row: obsRow, col: obsCol });
    }
  }

  return {
    data: {
      type: "block_programming",
      prompt: t.questions.robotPrompt,
      availableBlocks: [
        { id: "mf", type: "move_forward", label: "Move Forward", color: "#4CAF50" },
        { id: "tl", type: "turn_left", label: "Turn Left", color: "#2196F3" },
        { id: "tr", type: "turn_right", label: "Turn Right", color: "#FF9800" },
      ],
      gridSize: { rows: gridSize, cols: gridSize },
      startPosition: startPos,
      goalPosition: goalPos,
      obstacles,
    },
    answer: solution,
    hints: [
      t.questions.hintRobot1,
      interpolate(t.questions.hintRobot2, { right: stepsRight, down: stepsDown }),
      interpolate(t.questions.hintRobot3, { solution: solution.map((s) => s.replace("_", " ")).join(", ") }),
    ],
    explanation: interpolate(t.questions.explanationRobot, { right: stepsRight, down: stepsDown }),
    xp: 15 + difficulty * 3,
  };
}

// ── Number Shapes (Preschool) ──────────────────────────────

function generateShapeQuestion(difficulty: number, t: Translations): {
  data: QuestionData;
  answer: string;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const shapes = [
    { name: t.questions.circle, sides: 0, emoji: "⭕" },
    { name: t.questions.triangle, sides: 3, emoji: "🔺" },
    { name: t.questions.square, sides: 4, emoji: "🟥" },
    { name: t.questions.rectangle, sides: 4, emoji: "📐" },
    { name: t.questions.pentagon, sides: 5, emoji: "⬠" },
    { name: t.questions.hexagon, sides: 6, emoji: "⬡" },
  ];

  const maxIndex = Math.min(2 + difficulty, shapes.length);
  const shape = shapes[randomInt(0, maxIndex - 1)];
  const prompt =
    difficulty < 3
      ? interpolate(t.questions.whatShape, { emoji: shape.emoji })
      : interpolate(t.questions.whichShapeHasSides, { sides: shape.sides });

  const options = shuffle(shapes.slice(0, maxIndex).map((s) => s.name));
  if (!options.includes(shape.name)) {
    options[options.length - 1] = shape.name;
  }

  return {
    data: {
      type: "multiple_choice",
      prompt,
      options: shuffle(options).slice(0, 4),
    },
    answer: shape.name,
    hints: [
      t.questions.hintShape1,
      interpolate(t.questions.hintShape2, {
        detail: shape.sides === 0
          ? t.questions.hintShape2NoCornersText
          : interpolate(t.questions.hintShape2SidesText, { sides: shape.sides }),
      }),
      interpolate(t.questions.hintShape3, { name: shape.name }),
    ],
    explanation: shape.sides === 0
      ? interpolate(t.questions.explanationShapeRound, { name: shape.name })
      : interpolate(t.questions.explanationShapeSides, { name: shape.name, sides: shape.sides }),
    xp: 5 + difficulty,
  };
}

// ── Main Generator ─────────────────────────────────────────

function generateNumberOptions(correct: number, count: number, min: number, max: number): number[] {
  const options = new Set<number>([correct]);
  while (options.size < count) {
    const offset = randomInt(-3, 3);
    const option = correct + offset;
    if (option >= min && option !== correct) {
      options.add(option);
    }
    // Fallback: just add nearby numbers
    if (options.size < count) {
      options.add(correct + options.size);
    }
  }
  return shuffle([...options]).slice(0, count);
}

export function generateQuestion(
  gameType: GameType,
  difficulty: number,
  t: Translations
): {
  data: QuestionData;
  answer: unknown;
  hints: string[];
  explanation: string;
  xp: number;
} {
  switch (gameType) {
    case "counting":
      return generateCountingQuestion(difficulty, t);
    case "number_recognition":
    case "shapes":
      return generateShapeQuestion(difficulty, t);
    case "addition_subtraction":
      return generateAddSubQuestion(difficulty, t);
    case "multiplication":
    case "word_problems":
      return generateMultiplicationQuestion(difficulty, t);
    case "fractions":
    case "algebra":
      return generateFractionQuestion(difficulty, t);
    case "pattern_recognition":
    case "sorting":
      return generatePatternQuestion(difficulty, t);
    case "sequencing":
      return generateSequencingQuestion(difficulty, t);
    case "block_sequencing":
    case "conditionals":
    case "block_programming":
    case "algorithm_challenge":
    case "debugging":
      return generateBlockProgrammingQuestion(difficulty, t);
    default:
      return generateAddSubQuestion(difficulty, t);
  }
}

export function generateQuestionSet(
  gameType: GameType,
  difficulty: number,
  count: number = 10,
  t: Translations
): Omit<Question, "id" | "game_id">[] {
  return Array.from({ length: count }, (_, i) => {
    const q = generateQuestion(gameType, difficulty, t);
    return {
      difficulty_level: difficulty,
      question_data: q.data,
      correct_answer: q.answer,
      hints: q.hints,
      explanation: q.explanation,
      xp_reward: q.xp,
    };
  });
}
