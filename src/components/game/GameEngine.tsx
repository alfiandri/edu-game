"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { useChildStore } from "@/stores/child-store";
import { calculateDifficultyUpdate } from "@/lib/game-engine/adaptive-difficulty";
import { calculateQuestionXP, calculateSessionXP, calculateCurrencyEarned } from "@/lib/gamification/xp";
import { getTutorMessage, getCompletionMessage } from "@/lib/game-engine/tutor";
import { generateQuestion } from "@/lib/game-engine/question-generator";
import type { Question, GameType, AnswerRecord, TutorMessage } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n";

interface GameEngineProps {
  gameId: string;
  gameType: GameType;
  initialDifficulty: number;
  questionCount?: number;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
  renderQuestion: (props: QuestionRenderProps) => React.ReactNode;
}

export interface GameResult {
  score: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  currencyEarned: number;
  difficultyEnd: number;
  answers: AnswerRecord[];
}

export interface QuestionRenderProps {
  question: Question;
  onAnswer: (answer: unknown) => void;
  hintsUsed: number;
  showingHint: boolean;
  currentHint: string | null;
  onRequestHint: () => void;
  timeElapsed: number;
}

export default function GameEngine({
  gameId,
  gameType,
  initialDifficulty,
  questionCount = 10,
  onComplete,
  onExit,
  renderQuestion,
}: GameEngineProps) {
  const {
    gameState,
    tutorMessage,
    showTutor,
    initGame,
    recordAnswer,
    setTutorMessage,
    setShowTutor,
    nextQuestion,
    updateDifficulty,
    resetGame,
  } = useGameStore();

  const [hintsUsed, setHintsUsed] = useState(0);
  const [showingHint, setShowingHint] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { t } = useTranslation();

  // Generate questions on mount
  useEffect(() => {
    const questions: Question[] = Array.from({ length: questionCount }, (_, i) => {
      const q = generateQuestion(gameType, initialDifficulty, t);
      return {
        id: `q-${i}`,
        game_id: gameId,
        difficulty_level: initialDifficulty,
        question_data: q.data,
        correct_answer: q.answer,
        hints: q.hints,
        explanation: q.explanation,
        xp_reward: q.xp,
      };
    });
    initGame(questions, initialDifficulty);
    setQuestionStartTime(Date.now());
  }, [gameId, gameType, initialDifficulty, questionCount, initGame]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [questionStartTime]);

  const handleAnswer = useCallback(
    (answer: unknown) => {
      if (!gameState || isTransitioning) return;

      const question = gameState.questions[gameState.currentQuestionIndex];
      const timeTaken = Date.now() - questionStartTime;

      // Check correctness
      const isCorrect =
        JSON.stringify(answer) === JSON.stringify(question.correct_answer);

      // Calculate XP for this question
      const questionXP = calculateQuestionXP(
        question.xp_reward,
        gameState.difficultyLevel,
        hintsUsed,
        isCorrect
      );

      // Record the answer
      const record: AnswerRecord = {
        questionId: question.id,
        answer,
        isCorrect,
        timeTakenMs: timeTaken,
        hintsUsed,
      };
      recordAnswer(record);

      // Adaptive difficulty update
      const diffUpdate = calculateDifficultyUpdate(
        {
          current_level: gameState.difficultyLevel,
          consecutive_correct: isCorrect ? gameState.consecutiveCorrect + 1 : 0,
          consecutive_wrong: isCorrect ? 0 : gameState.consecutiveWrong + 1,
        },
        isCorrect
      );
      updateDifficulty(
        diffUpdate.newLevel,
        diffUpdate.consecutiveCorrect,
        diffUpdate.consecutiveWrong
      );

      // Show tutor message
      const msg = getTutorMessage(
        isCorrect,
        isCorrect ? gameState.consecutiveCorrect + 1 : 0,
        t,
        isCorrect ? undefined : question.explanation
      );
      setTutorMessage(msg);
      setIsTransitioning(true);

      // Auto-advance after delay
      setTimeout(() => {
        setTutorMessage(null);
        setHintsUsed(0);
        setShowingHint(false);
        setCurrentHint(null);

        // Check if game is complete
        if (gameState.currentQuestionIndex + 1 >= gameState.questions.length) {
          // Game complete
          const allAnswers = [...gameState.answers, record];
          const totalCorrect = allAnswers.filter((a) => a.isCorrect).length;
          const totalQuestions = allAnswers.length;
          const accuracy =
            totalQuestions > 0
              ? Math.round((totalCorrect / totalQuestions) * 100)
              : 0;
          const totalXP = allAnswers.reduce(
            (sum, a, i) =>
              sum +
              calculateQuestionXP(
                gameState.questions[i].xp_reward,
                gameState.difficultyLevel,
                a.hintsUsed,
                a.isCorrect
              ),
            0
          );
          const sessionXP = calculateSessionXP(
            totalCorrect,
            totalQuestions,
            totalXP,
            gameState.difficultyLevel
          );
          const currency = calculateCurrencyEarned(sessionXP);

          setShowResults(true);
          onComplete({
            score: totalCorrect,
            totalQuestions,
            accuracy,
            xpEarned: sessionXP,
            currencyEarned: currency,
            difficultyEnd: diffUpdate.newLevel,
            answers: allAnswers,
          });
        } else {
          nextQuestion();
          setQuestionStartTime(Date.now());
          setTimeElapsed(0);
        }
        setIsTransitioning(false);
      }, isCorrect ? 1500 : 2500);
    },
    [
      gameState,
      isTransitioning,
      questionStartTime,
      hintsUsed,
      recordAnswer,
      updateDifficulty,
      setTutorMessage,
      nextQuestion,
      onComplete,
    ]
  );

  const handleRequestHint = useCallback(() => {
    if (!gameState) return;
    const question = gameState.questions[gameState.currentQuestionIndex];
    if (hintsUsed < question.hints.length) {
      setCurrentHint(question.hints[hintsUsed]);
      setShowingHint(true);
      setHintsUsed((h) => h + 1);
    }
  }, [gameState, hintsUsed]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🎮</div>
          <p className="text-lg font-bold text-gray-600">{t.common.loadingGame}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  // Results Screen
  if (showResults) {
    const totalCorrect = gameState.answers.filter((a) => a.isCorrect).length;
    const accuracy =
      gameState.answers.length > 0
        ? Math.round((totalCorrect / gameState.answers.length) * 100)
        : 0;
    const completionMsg = getCompletionMessage(accuracy, gameState.xpEarned, t);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] p-8"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-7xl mb-6"
        >
          {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "⭐" : "💪"}
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {t.play.gameComplete}
        </h2>
        <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
          {completionMsg.text}
        </p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {totalCorrect}/{gameState.answers.length}
            </p>
            <p className="text-sm text-gray-500">{t.common.correct}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{accuracy}%</p>
            <p className="text-sm text-gray-500">{t.common.accuracy}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">
              +{gameState.xpEarned}
            </p>
            <p className="text-sm text-gray-500">{t.common.xpEarned}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" onClick={onExit}>
            {t.common.backToMap}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              resetGame();
              setShowResults(false);
              const questions: Question[] = Array.from(
                { length: questionCount },
                (_, i) => {
                  const q = generateQuestion(gameType, gameState.difficultyLevel, t);
                  return {
                    id: `q-${i}`,
                    game_id: gameId,
                    difficulty_level: gameState.difficultyLevel,
                    question_data: q.data,
                    correct_answer: q.answer,
                    hints: q.hints,
                    explanation: q.explanation,
                    xp_reward: q.xp,
                  };
                }
              );
              initGame(questions, gameState.difficultyLevel);
              setQuestionStartTime(Date.now());
            }}
          >
            {t.common.playAgain}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Top Bar: Progress + Timer + Exit */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
        <div className="flex-1">
          <ProgressBar
            value={gameState.currentQuestionIndex}
            max={gameState.questions.length}
            color="purple"
            size="sm"
          />
        </div>
        <span className="text-sm font-bold text-gray-500">
          {gameState.currentQuestionIndex + 1}/{gameState.questions.length}
        </span>
        <span className="text-sm font-mono text-gray-400">
          {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60)
            .toString()
            .padStart(2, "0")}
        </span>
      </div>

      {/* Difficulty indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-gray-400">{t.common.difficulty}</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-4 rounded-sm ${
                i < Math.round(gameState.difficultyLevel)
                  ? "bg-purple-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState.currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion &&
            renderQuestion({
              question: currentQuestion,
              onAnswer: handleAnswer,
              hintsUsed,
              showingHint,
              currentHint,
              onRequestHint: handleRequestHint,
              timeElapsed,
            })}
        </motion.div>
      </AnimatePresence>

      {/* Hint Button */}
      {currentQuestion && hintsUsed < currentQuestion.hints.length && !isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRequestHint}
          >
            {t.common.needHint} ({currentQuestion.hints.length - hintsUsed} {t.common.hintsLeft})
          </Button>
          {hintsUsed > 0 && (
            <p className="text-xs text-yellow-600 mt-1">
              {t.common.hintXPWarning}
            </p>
          )}
        </motion.div>
      )}

      {/* Hint Display */}
      <AnimatePresence>
        {showingHint && currentHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-2xl bg-blue-50 border-2 border-blue-200"
          >
            <p className="text-blue-700 font-medium">💡 {currentHint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutor Message */}
      <AnimatePresence>
        {showTutor && tutorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className={`mt-6 p-6 rounded-3xl text-center font-bold text-lg ${
              tutorMessage.type === "celebration"
                ? "bg-gradient-to-r from-yellow-100 to-green-100 border-2 border-green-300 text-green-700"
                : tutorMessage.type === "explanation"
                  ? "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 text-orange-700"
                  : "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 text-purple-700"
            }`}
          >
            {tutorMessage.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
