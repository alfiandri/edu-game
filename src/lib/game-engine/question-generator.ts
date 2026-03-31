import type { Question, QuestionData, GameType, AgeTier } from "@/lib/types";

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

function generateCountingQuestion(difficulty: number): {
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
      prompt: `How many ${emoji} do you see?`,
      objectCount: count,
      objectEmoji: emoji,
    },
    answer: count,
    hints: [
      "Try pointing at each one as you count!",
      `Start from the first ${emoji} and count slowly.`,
      `The answer is between ${Math.max(1, count - 2)} and ${count + 2}.`,
    ],
    explanation: `There are ${count} ${emoji}!`,
    xp: 5 + difficulty,
  };
}

// ── Addition/Subtraction ───────────────────────────────────

function generateAddSubQuestion(difficulty: number): {
  data: QuestionData;
  answer: number;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const isAddition = Math.random() > 0.4;
  const maxNum = Math.min(5 + difficulty * 3, 50);
  const a = randomInt(1, maxNum);
  const b = randomInt(1, isAddition ? maxNum : a); // For subtraction, b <= a
  const answer = isAddition ? a + b : a - b;
  const op = isAddition ? "+" : "-";
  const prompt = `What is ${a} ${op} ${b}?`;

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
        ? `Try counting up from ${a}, add ${b} more.`
        : `Start at ${a} and count back ${b}.`,
      isAddition
        ? `${a} + ${b} is a bit more than ${a}.`
        : `${a} - ${b} is less than ${a}.`,
      `The answer is close to ${answer}.`,
    ],
    explanation: `${a} ${op} ${b} = ${answer}`,
    xp: 8 + difficulty * 2,
  };
}

// ── Multiplication ─────────────────────────────────────────

function generateMultiplicationQuestion(difficulty: number): {
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
  const prompt = `What is ${a} × ${b}?`;

  const options = generateNumberOptions(answer, 4, 1, maxFactor * maxFactor + 10);

  return {
    data: {
      type: "multiple_choice",
      prompt,
      options: options.map(String),
    },
    answer,
    hints: [
      `Think of ${a} groups of ${b}.`,
      `${a} × ${b} is the same as adding ${b} together ${a} times.`,
      `The answer is between ${answer - 5} and ${answer + 5}.`,
    ],
    explanation: `${a} × ${b} = ${answer}. That's ${a} groups of ${b}!`,
    xp: 10 + difficulty * 2,
  };
}

// ── Fractions ──────────────────────────────────────────────

function generateFractionQuestion(difficulty: number): {
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

  const prompt = `What is ${numerator1}/${denominator} + ${numerator2}/${denominator}?`;
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
      "When fractions have the same bottom number, just add the top numbers!",
      `Add ${numerator1} + ${numerator2} for the top number.`,
      `The bottom number stays as ${denominator}.`,
    ],
    explanation: `${numerator1}/${denominator} + ${numerator2}/${denominator} = ${answer}. When denominators are the same, add the numerators!`,
    xp: 12 + difficulty * 2,
  };
}

// ── Pattern Recognition (Coding/Logic) ────────────────────

function generatePatternQuestion(difficulty: number): {
  data: QuestionData;
  answer: string;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const patterns = [
    { seq: ["🔴", "🔵", "🔴", "🔵", "🔴"], answer: "🔵", rule: "alternating red and blue" },
    { seq: ["⭐", "⭐", "🌙", "⭐", "⭐"], answer: "🌙", rule: "star, star, moon repeating" },
    { seq: ["1", "2", "3", "4", "5"], answer: "6", rule: "counting up by 1" },
    { seq: ["2", "4", "6", "8", "10"], answer: "12", rule: "counting up by 2" },
    { seq: ["🔺", "🔵", "🔺", "🔵", "🔺"], answer: "🔵", rule: "alternating triangle and circle" },
    { seq: ["A", "B", "C", "D", "E"], answer: "F", rule: "alphabetical order" },
    { seq: ["1", "3", "5", "7", "9"], answer: "11", rule: "odd numbers" },
    { seq: ["🌞", "🌧", "🌞", "🌧", "🌞"], answer: "🌧", rule: "alternating sun and rain" },
  ];

  const maxIndex = Math.min(difficulty + 2, patterns.length);
  const pattern = patterns[randomInt(0, maxIndex - 1)];
  const prompt = `What comes next? ${pattern.seq.join("  ")}  ?`;

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
      "Look at the pattern carefully. Do some items repeat?",
      `The pattern follows a rule: ${pattern.rule}.`,
      `The answer is ${pattern.answer}.`,
    ],
    explanation: `The pattern is ${pattern.rule}, so the next item is ${pattern.answer}!`,
    xp: 8 + difficulty * 2,
  };
}

// ── Sequencing (Coding/Logic) ──────────────────────────────

function generateSequencingQuestion(difficulty: number): {
  data: QuestionData;
  answer: number[];
  hints: string[];
  explanation: string;
  xp: number;
} {
  const sequences = [
    { items: ["Wake up", "Brush teeth", "Eat breakfast", "Go to school"], name: "morning routine" },
    { items: ["Get ingredients", "Mix batter", "Pour in pan", "Bake in oven"], name: "making a cake" },
    { items: ["Plant seed", "Water it", "Seedling grows", "Flower blooms"], name: "growing a flower" },
    { items: ["Open book", "Read pages", "Close book", "Think about story"], name: "reading a book" },
    { items: ["Put on socks", "Put on shoes", "Tie laces", "Walk outside"], name: "getting ready to go out" },
  ];

  const maxIndex = Math.min(difficulty + 1, sequences.length);
  const seq = sequences[randomInt(0, maxIndex - 1)];
  const correctOrder = seq.items.map((_, i) => i);

  return {
    data: {
      type: "sequencing",
      prompt: `Put these steps in the right order for ${seq.name}:`,
      items: shuffle(seq.items),
      correctOrder,
    },
    answer: correctOrder,
    hints: [
      "Think about what needs to happen first.",
      `What's the very first step in ${seq.name}?`,
      `The first step is: "${seq.items[0]}"`,
    ],
    explanation: `The correct order for ${seq.name} is: ${seq.items.join(" → ")}`,
    xp: 10 + difficulty * 2,
  };
}

// ── Block Programming (Coding/Logic) ──────────────────────

function generateBlockProgrammingQuestion(difficulty: number): {
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
      prompt: `Guide the robot 🤖 to reach the star ⭐! Use the blocks to create a path.`,
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
      "First, think about which direction the robot needs to go.",
      `The robot needs to move ${stepsRight} step(s) right and ${stepsDown} step(s) down.`,
      `Try: ${solution.map((s) => s.replace("_", " ")).join(", ")}`,
    ],
    explanation: `The robot goes right ${stepsRight} step(s) then down ${stepsDown} step(s) to reach the star!`,
    xp: 15 + difficulty * 3,
  };
}

// ── Number Shapes (Preschool) ──────────────────────────────

function generateShapeQuestion(difficulty: number): {
  data: QuestionData;
  answer: string;
  hints: string[];
  explanation: string;
  xp: number;
} {
  const shapes = [
    { name: "Circle", sides: 0, emoji: "⭕" },
    { name: "Triangle", sides: 3, emoji: "🔺" },
    { name: "Square", sides: 4, emoji: "🟥" },
    { name: "Rectangle", sides: 4, emoji: "📐" },
    { name: "Pentagon", sides: 5, emoji: "⬠" },
    { name: "Hexagon", sides: 6, emoji: "⬡" },
  ];

  const maxIndex = Math.min(2 + difficulty, shapes.length);
  const shape = shapes[randomInt(0, maxIndex - 1)];
  const prompt =
    difficulty < 3
      ? `What shape is this? ${shape.emoji}`
      : `Which shape has ${shape.sides} sides?`;

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
      `Look at the shape carefully. Count its sides!`,
      `This shape has ${shape.sides === 0 ? "no corners" : `${shape.sides} sides`}.`,
      `It's a ${shape.name}!`,
    ],
    explanation: `A ${shape.name} ${shape.sides === 0 ? "has no sides — it's round!" : `has ${shape.sides} sides.`}`,
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
  difficulty: number
): {
  data: QuestionData;
  answer: unknown;
  hints: string[];
  explanation: string;
  xp: number;
} {
  switch (gameType) {
    case "counting":
      return generateCountingQuestion(difficulty);
    case "number_recognition":
    case "shapes":
      return generateShapeQuestion(difficulty);
    case "addition_subtraction":
      return generateAddSubQuestion(difficulty);
    case "multiplication":
    case "word_problems":
      return generateMultiplicationQuestion(difficulty);
    case "fractions":
    case "algebra":
      return generateFractionQuestion(difficulty);
    case "pattern_recognition":
    case "sorting":
      return generatePatternQuestion(difficulty);
    case "sequencing":
      return generateSequencingQuestion(difficulty);
    case "block_sequencing":
    case "conditionals":
    case "block_programming":
    case "algorithm_challenge":
    case "debugging":
      return generateBlockProgrammingQuestion(difficulty);
    default:
      return generateAddSubQuestion(difficulty);
  }
}

export function generateQuestionSet(
  gameType: GameType,
  difficulty: number,
  count: number = 10
): Omit<Question, "id" | "game_id">[] {
  return Array.from({ length: count }, (_, i) => {
    const q = generateQuestion(gameType, difficulty);
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
