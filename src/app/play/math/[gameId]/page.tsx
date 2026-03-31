"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useChildStore } from "@/stores/child-store";
import { getInitialDifficulty } from "@/lib/game-engine/adaptive-difficulty";
import GameEngine, { type GameResult } from "@/components/game/GameEngine";
import { MathQuestionRenderer } from "@/components/game/MathGame";
import type { GameType } from "@/lib/types";
import { use } from "react";

interface Props {
  params: Promise<{ gameId: string }>;
}

export default function MathGamePage({ params }: Props) {
  const { gameId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedChild, updateChild } = useChildStore();

  const gameType = (searchParams.get("type") || "addition_subtraction") as GameType;

  if (!selectedChild) return null;

  const initialDifficulty = getInitialDifficulty(selectedChild.age_tier);

  const handleComplete = (result: GameResult) => {
    // Update local state (in production, also persist to MySQL)
    updateChild({
      id: selectedChild.id,
      xp_total: selectedChild.xp_total + result.xpEarned,
      currency_balance: selectedChild.currency_balance + result.currencyEarned,
    });
  };

  const handleExit = () => {
    router.push("/play");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <GameEngine
        gameId={gameId}
        gameType={gameType}
        initialDifficulty={initialDifficulty}
        questionCount={8}
        onComplete={handleComplete}
        onExit={handleExit}
        renderQuestion={(props) => <MathQuestionRenderer {...props} />}
      />
    </div>
  );
}
