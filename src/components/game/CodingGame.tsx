"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { QuestionRenderProps } from "./GameEngine";
import type {
  SequencingQuestionData,
  BlockProgrammingQuestionData,
  ProgramBlock,
} from "@/lib/types";
import { MultipleChoiceQuestion } from "./MathGame";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";

// ── Sequencing Question ──────────────────────────────────

export function SequencingQuestion({ question, onAnswer }: QuestionRenderProps) {
  const data = question.question_data as SequencingQuestionData;
  const [orderedItems, setOrderedItems] = useState<string[]>([]);
  const [remainingItems, setRemainingItems] = useState<string[]>([...data.items]);
  const { t } = useTranslation();

  const addItem = (item: string) => {
    setOrderedItems([...orderedItems, item]);
    setRemainingItems(remainingItems.filter((i) => i !== item));
  };

  const removeItem = (index: number) => {
    const item = orderedItems[index];
    setRemainingItems([...remainingItems, item]);
    setOrderedItems(orderedItems.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onAnswer(orderedItems);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-xl font-bold text-gray-800 text-center">
        {data.prompt}
      </h2>

      {/* Ordered sequence */}
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-gray-500 mb-2">
          {t.play.yourOrder}
        </p>
        <div className="min-h-[60px] p-3 rounded-2xl bg-purple-50 border-2 border-purple-200 flex flex-wrap gap-2">
          {orderedItems.length === 0 ? (
            <p className="text-gray-400 text-sm">
              {t.play.tapToAdd}
            </p>
          ) : (
            orderedItems.map((item, i) => (
              <motion.button
                key={`ordered-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => removeItem(i)}
                className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-purple-700"
              >
                <span className="w-5 h-5 rounded-full bg-purple-400 text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                {item}
                <span className="text-purple-300">✕</span>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Available items */}
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-gray-500 mb-2">
          {t.play.availableSteps}
        </p>
        <div className="flex flex-wrap gap-2">
          {remainingItems.map((item, i) => (
            <motion.button
              key={`remaining-${item}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addItem(item)}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-purple-300 hover:bg-purple-50"
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>

      <Button
        variant="success"
        size="lg"
        onClick={handleSubmit}
        disabled={orderedItems.length !== data.items.length}
      >
        {t.common.checkOrder}
      </Button>
    </div>
  );
}

// ── Block Programming Question ───────────────────────────

export function BlockProgrammingQuestion({
  question,
  onAnswer,
}: QuestionRenderProps) {
  const data = question.question_data as BlockProgrammingQuestionData;
  const [program, setProgram] = useState<ProgramBlock[]>([]);
  const [robotPos, setRobotPos] = useState(data.startPosition);
  const [robotDir, setRobotDir] = useState<"right" | "down" | "left" | "up">("right");
  const [isRunning, setIsRunning] = useState(false);
  const [trail, setTrail] = useState<{ row: number; col: number }[]>([]);
  const { t } = useTranslation();

  const addBlock = (block: ProgramBlock) => {
    setProgram([...program, { ...block, id: `${block.id}-${Date.now()}` }]);
  };

  const removeBlock = (index: number) => {
    setProgram(program.filter((_, i) => i !== index));
  };

  const runProgram = useCallback(async () => {
    setIsRunning(true);
    let pos = { ...data.startPosition };
    let dir = "right" as "right" | "down" | "left" | "up";
    const newTrail: { row: number; col: number }[] = [{ ...pos }];

    for (const block of program) {
      await new Promise((r) => setTimeout(r, 500));

      switch (block.type) {
        case "move_forward": {
          const moves = {
            right: { row: 0, col: 1 },
            down: { row: 1, col: 0 },
            left: { row: 0, col: -1 },
            up: { row: -1, col: 0 },
          };
          const move = moves[dir];
          pos = {
            row: Math.max(0, Math.min(data.gridSize.rows - 1, pos.row + move.row)),
            col: Math.max(0, Math.min(data.gridSize.cols - 1, pos.col + move.col)),
          };
          break;
        }
        case "turn_left": {
          const turns = { right: "up", up: "left", left: "down", down: "right" } as const;
          dir = turns[dir];
          break;
        }
        case "turn_right": {
          const turns = { right: "down", down: "left", left: "up", up: "right" } as const;
          dir = turns[dir];
          break;
        }
      }

      newTrail.push({ ...pos });
      setRobotPos({ ...pos });
      setRobotDir(dir);
      setTrail([...newTrail]);
    }

    setIsRunning(false);
    // Submit the block types as the answer
    onAnswer(program.map((b) => b.type));
  }, [program, data, onAnswer]);

  const resetRobot = () => {
    setRobotPos(data.startPosition);
    setRobotDir("right");
    setTrail([]);
    setProgram([]);
  };

  const dirEmoji = {
    right: "▶️",
    down: "🔽",
    left: "◀️",
    up: "🔼",
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">
        {data.prompt}
      </h2>

      {/* Grid */}
      <div
        className="inline-grid gap-1 bg-gray-100 p-2 rounded-2xl"
        style={{
          gridTemplateColumns: `repeat(${data.gridSize.cols}, 3rem)`,
        }}
      >
        {Array.from({ length: data.gridSize.rows }, (_, row) =>
          Array.from({ length: data.gridSize.cols }, (_, col) => {
            const isRobot = robotPos.row === row && robotPos.col === col;
            const isGoal =
              data.goalPosition.row === row && data.goalPosition.col === col;
            const isObstacle = data.obstacles.some(
              (o) => o.row === row && o.col === col
            );
            const isTrail = trail.some(
              (t) => t.row === row && t.col === col
            );

            return (
              <motion.div
                key={`${row}-${col}`}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                  isObstacle
                    ? "bg-gray-700"
                    : isTrail
                      ? "bg-blue-100"
                      : "bg-white"
                } border border-gray-200`}
              >
                {isRobot ? (
                  <motion.span
                    key={`robot-${robotPos.row}-${robotPos.col}`}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                  >
                    🤖
                  </motion.span>
                ) : isGoal ? (
                  "⭐"
                ) : isObstacle ? (
                  "🧱"
                ) : (
                  ""
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Available Blocks */}
      <div className="flex gap-2 flex-wrap justify-center">
        {data.availableBlocks.map((block) => (
          <motion.button
            key={block.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isRunning && addBlock(block)}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl font-bold text-white text-sm shadow-md"
            style={{ backgroundColor: block.color }}
          >
            {block.label}
          </motion.button>
        ))}
      </div>

      {/* Program Sequence */}
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-gray-500 mb-2">
          {t.play.yourProgram}
        </p>
        <div className="min-h-[48px] p-2 rounded-xl bg-gray-50 border-2 border-gray-200 flex flex-wrap gap-1">
          {program.length === 0 ? (
            <p className="text-gray-400 text-xs p-1">
              {t.play.addBlocks}
            </p>
          ) : (
            program.map((block, i) => (
              <motion.button
                key={block.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => !isRunning && removeBlock(i)}
                className="px-2 py-1 rounded-lg text-white text-xs font-bold"
                style={{ backgroundColor: block.color }}
              >
                {block.label} ✕
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button variant="ghost" size="sm" onClick={resetRobot} disabled={isRunning}>
          {t.common.reset}
        </Button>
        <Button
          variant="success"
          size="lg"
          onClick={runProgram}
          disabled={isRunning || program.length === 0}
        >
          {isRunning ? t.common.running : t.common.runProgram}
        </Button>
      </div>
    </div>
  );
}

// ── Router ─────────────────────────────────────────────────

export function CodingQuestionRenderer(props: QuestionRenderProps) {
  const type = props.question.question_data.type;

  switch (type) {
    case "sequencing":
      return <SequencingQuestion {...props} />;
    case "block_programming":
      return <BlockProgrammingQuestion {...props} />;
    case "multiple_choice":
      return <MultipleChoiceQuestion {...props} />;
    default:
      return <MultipleChoiceQuestion {...props} />;
  }
}
