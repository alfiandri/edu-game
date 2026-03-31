"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { QuestionRenderProps } from "./GameEngine";
import type { CountingQuestionData, MultipleChoiceQuestionData } from "@/lib/types";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";

// ── Counting Question (Preschool) ──────────────────────────

export function CountingQuestion({ question, onAnswer }: QuestionRenderProps) {
  const [count, setCount] = useState(0);
  const data = question.question_data as CountingQuestionData;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        {data.prompt}
      </h2>

      {/* Objects to count */}
      <div className="flex flex-wrap justify-center gap-3 max-w-md">
        {Array.from({ length: data.objectCount }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            className="text-5xl cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setCount((c) => c + 1)}
          >
            {data.objectEmoji}
          </motion.span>
        ))}
      </div>

      {/* Counter */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          className="w-14 h-14 rounded-full bg-red-100 text-red-600 text-2xl font-bold hover:bg-red-200 transition-colors"
        >
          −
        </button>
        <motion.span
          key={count}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="text-5xl font-bold text-purple-600 w-16 text-center"
        >
          {count}
        </motion.span>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="w-14 h-14 rounded-full bg-green-100 text-green-600 text-2xl font-bold hover:bg-green-200 transition-colors"
        >
          +
        </button>
      </div>

      <Button
        variant="success"
        size="lg"
        onClick={() => onAnswer(count)}
      >
        {t.common.submitAnswer}
      </Button>
    </div>
  );
}

// ── Multiple Choice Question ───────────────────────────────

export function MultipleChoiceQuestion({
  question,
  onAnswer,
}: QuestionRenderProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const data = question.question_data as MultipleChoiceQuestionData;

  const handleSelect = (option: string) => {
    if (selected) return; // Already answered
    setSelected(option);
    // Convert to number if all options are numeric
    const isNumeric = data.options.every((o) => !isNaN(Number(o)));
    onAnswer(isNumeric ? Number(option) : option);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
        {data.prompt}
      </h2>

      {data.imageUrl && (
        <div className="w-48 h-48 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
          <span className="text-6xl">{data.imageUrl}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {data.options.map((option, i) => {
          const isSelected = selected === option;
          const isCorrect =
            selected !== null &&
            (option === String(question.correct_answer) ||
              option === question.correct_answer);
          const isWrong = isSelected && !isCorrect;

          return (
            <motion.button
              key={i}
              whileHover={!selected ? { scale: 1.05 } : {}}
              whileTap={!selected ? { scale: 0.95 } : {}}
              onClick={() => handleSelect(option)}
              disabled={!!selected}
              className={`p-4 rounded-2xl border-3 text-lg font-bold transition-all ${
                isCorrect && selected
                  ? "bg-green-100 border-green-500 text-green-700 ring-4 ring-green-300"
                  : isWrong
                    ? "bg-red-100 border-red-500 text-red-700 ring-4 ring-red-300"
                    : isSelected
                      ? "bg-purple-100 border-purple-500 text-purple-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Router: Pick the right component based on question type ──

export function MathQuestionRenderer(props: QuestionRenderProps) {
  const type = props.question.question_data.type;

  switch (type) {
    case "counting":
      return <CountingQuestion {...props} />;
    case "multiple_choice":
      return <MultipleChoiceQuestion {...props} />;
    default:
      return <MultipleChoiceQuestion {...props} />;
  }
}
