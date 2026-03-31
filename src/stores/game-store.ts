import { create } from "zustand";
import type { GameState, AnswerRecord, Question, TutorMessage } from "@/lib/types";

interface GameStore {
  gameState: GameState | null;
  tutorMessage: TutorMessage | null;
  showTutor: boolean;

  initGame: (questions: Question[], difficultyLevel: number) => void;
  recordAnswer: (record: AnswerRecord) => void;
  setTutorMessage: (msg: TutorMessage | null) => void;
  setShowTutor: (show: boolean) => void;
  nextQuestion: () => void;
  completeGame: (sessionId: string, xpEarned: number) => void;
  resetGame: () => void;
  updateDifficulty: (level: number, cc: number, cw: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  tutorMessage: null,
  showTutor: false,

  initGame: (questions, difficultyLevel) =>
    set({
      gameState: {
        sessionId: null,
        currentQuestionIndex: 0,
        questions,
        answers: [],
        score: 0,
        xpEarned: 0,
        difficultyLevel,
        consecutiveCorrect: 0,
        consecutiveWrong: 0,
        hintsUsed: 0,
        isComplete: false,
        startedAt: new Date().toISOString(),
      },
      tutorMessage: null,
      showTutor: false,
    }),

  recordAnswer: (record) =>
    set((state) => {
      if (!state.gameState) return state;
      const newAnswers = [...state.gameState.answers, record];
      const newScore = newAnswers.filter((a) => a.isCorrect).length;
      return {
        gameState: {
          ...state.gameState,
          answers: newAnswers,
          score: newScore,
          consecutiveCorrect: record.isCorrect
            ? state.gameState.consecutiveCorrect + 1
            : 0,
          consecutiveWrong: record.isCorrect
            ? 0
            : state.gameState.consecutiveWrong + 1,
          hintsUsed: state.gameState.hintsUsed + record.hintsUsed,
        },
      };
    }),

  setTutorMessage: (msg) => set({ tutorMessage: msg, showTutor: !!msg }),
  setShowTutor: (show) => set({ showTutor: show }),

  nextQuestion: () =>
    set((state) => {
      if (!state.gameState) return state;
      const nextIndex = state.gameState.currentQuestionIndex + 1;
      const isComplete = nextIndex >= state.gameState.questions.length;
      return {
        gameState: {
          ...state.gameState,
          currentQuestionIndex: nextIndex,
          isComplete,
        },
        showTutor: false,
        tutorMessage: null,
      };
    }),

  completeGame: (sessionId, xpEarned) =>
    set((state) => {
      if (!state.gameState) return state;
      return {
        gameState: {
          ...state.gameState,
          sessionId,
          xpEarned,
          isComplete: true,
        },
      };
    }),

  resetGame: () =>
    set({ gameState: null, tutorMessage: null, showTutor: false }),

  updateDifficulty: (level, cc, cw) =>
    set((state) => {
      if (!state.gameState) return state;
      return {
        gameState: {
          ...state.gameState,
          difficultyLevel: level,
          consecutiveCorrect: cc,
          consecutiveWrong: cw,
        },
      };
    }),
}));
