"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useChildStore } from "@/stores/child-store";
import { getInitialDifficulty } from "@/lib/game-engine/adaptive-difficulty";
import GameEngine, { type GameResult } from "@/components/game/GameEngine";
import { CodingQuestionRenderer } from "@/components/game/CodingGame";
import type { GameType } from "@/lib/types";
import { use } from "react";

interface Props {
  params: Promise<{ gameId: string }>;
}

export default function CodingGamePage({ params }: Props) {
  const { gameId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedChild, updateChild } = useChildStore();

  const gameType = (searchParams.get("type") || "block_programming") as GameType;

  if (!selectedChild) return null;

  const initialDifficulty = getInitialDifficulty(selectedChild.age_tier);

  const handleComplete = (result: GameResult) => {
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
        questionCount={6}
        onComplete={handleComplete}
        onExit={handleExit}
        renderQuestion={(props) => <CodingQuestionRenderer {...props} />}
      />
    </div>
  );
}
