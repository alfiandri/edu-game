"use client";

import { useRouter } from "next/navigation";
import { useChildStore } from "@/stores/child-store";
import { motion } from "framer-motion";
import type { AdventureNode, AgeTier, GameType } from "@/lib/types";
import AdventureMap from "@/components/gamification/AdventureMap";
import XPBar from "@/components/gamification/XPBar";
import { getLevelFromXP } from "@/components/gamification/XPBar";
import { useTranslation } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n";

// Static adventure nodes for MVP (would come from DB in production)
function getAdventureNodes(subject: "math" | "coding-logic", ageTier: AgeTier, t: Translations): AdventureNode[] {
  const mathNodes: Record<AgeTier, AdventureNode[]> = {
    preschool: [
      { id: "m-p-1", subject_id: "math", age_tier: "preschool", order_index: 1, title: t.nodes.countTheStars, game_id: "g-count-1", node_type: "game", xp_requirement: 0 },
      { id: "m-p-2", subject_id: "math", age_tier: "preschool", order_index: 2, title: t.nodes.shapeWorld, game_id: "g-shape-1", node_type: "game", xp_requirement: 20 },
      { id: "m-p-3", subject_id: "math", age_tier: "preschool", order_index: 3, title: t.nodes.numberBoss, game_id: "g-count-2", node_type: "boss", xp_requirement: 50 },
      { id: "m-p-4", subject_id: "math", age_tier: "preschool", order_index: 4, title: t.nodes.treasure, game_id: null, node_type: "reward", xp_requirement: 80 },
      { id: "m-p-5", subject_id: "math", age_tier: "preschool", order_index: 5, title: t.nodes.moreCounting, game_id: "g-count-3", node_type: "game", xp_requirement: 100 },
    ],
    early_elementary: [
      { id: "m-e-1", subject_id: "math", age_tier: "early_elementary", order_index: 1, title: t.nodes.addItUp, game_id: "g-addsub-1", node_type: "game", xp_requirement: 0 },
      { id: "m-e-2", subject_id: "math", age_tier: "early_elementary", order_index: 2, title: t.nodes.subtractionStation, game_id: "g-addsub-2", node_type: "game", xp_requirement: 30 },
      { id: "m-e-3", subject_id: "math", age_tier: "early_elementary", order_index: 3, title: t.nodes.timesTables, game_id: "g-mult-1", node_type: "game", xp_requirement: 70 },
      { id: "m-e-4", subject_id: "math", age_tier: "early_elementary", order_index: 4, title: t.nodes.mathDragon, game_id: "g-mult-2", node_type: "boss", xp_requirement: 120 },
      { id: "m-e-5", subject_id: "math", age_tier: "early_elementary", order_index: 5, title: t.nodes.rewardChest, game_id: null, node_type: "reward", xp_requirement: 160 },
      { id: "m-e-6", subject_id: "math", age_tier: "early_elementary", order_index: 6, title: t.nodes.wordProblems, game_id: "g-word-1", node_type: "game", xp_requirement: 200 },
    ],
    upper_elementary: [
      { id: "m-u-1", subject_id: "math", age_tier: "upper_elementary", order_index: 1, title: t.nodes.multiplyMaster, game_id: "g-mult-3", node_type: "game", xp_requirement: 0 },
      { id: "m-u-2", subject_id: "math", age_tier: "upper_elementary", order_index: 2, title: t.nodes.fractionFun, game_id: "g-frac-1", node_type: "game", xp_requirement: 50 },
      { id: "m-u-3", subject_id: "math", age_tier: "upper_elementary", order_index: 3, title: t.nodes.fractionBoss, game_id: "g-frac-2", node_type: "boss", xp_requirement: 120 },
      { id: "m-u-4", subject_id: "math", age_tier: "upper_elementary", order_index: 4, title: t.nodes.algebraIntro, game_id: "g-alg-1", node_type: "game", xp_requirement: 180 },
      { id: "m-u-5", subject_id: "math", age_tier: "upper_elementary", order_index: 5, title: t.nodes.prizeVault, game_id: null, node_type: "reward", xp_requirement: 250 },
    ],
  };

  const codingNodes: Record<AgeTier, AdventureNode[]> = {
    preschool: [
      { id: "c-p-1", subject_id: "coding-logic", age_tier: "preschool", order_index: 1, title: t.nodes.patternTime, game_id: "g-pattern-1", node_type: "game", xp_requirement: 0 },
      { id: "c-p-2", subject_id: "coding-logic", age_tier: "preschool", order_index: 2, title: t.nodes.sortItOut, game_id: "g-sort-1", node_type: "game", xp_requirement: 20 },
      { id: "c-p-3", subject_id: "coding-logic", age_tier: "preschool", order_index: 3, title: t.nodes.sequenceSteps, game_id: "g-seq-1", node_type: "game", xp_requirement: 50 },
      { id: "c-p-4", subject_id: "coding-logic", age_tier: "preschool", order_index: 4, title: t.nodes.logicBoss, game_id: "g-pattern-2", node_type: "boss", xp_requirement: 80 },
      { id: "c-p-5", subject_id: "coding-logic", age_tier: "preschool", order_index: 5, title: t.nodes.treasure, game_id: null, node_type: "reward", xp_requirement: 100 },
    ],
    early_elementary: [
      { id: "c-e-1", subject_id: "coding-logic", age_tier: "early_elementary", order_index: 1, title: t.nodes.robotWalk, game_id: "g-block-1", node_type: "game", xp_requirement: 0 },
      { id: "c-e-2", subject_id: "coding-logic", age_tier: "early_elementary", order_index: 2, title: t.nodes.mazeRunner, game_id: "g-block-2", node_type: "game", xp_requirement: 40 },
      { id: "c-e-3", subject_id: "coding-logic", age_tier: "early_elementary", order_index: 3, title: t.nodes.ifThen, game_id: "g-cond-1", node_type: "game", xp_requirement: 90 },
      { id: "c-e-4", subject_id: "coding-logic", age_tier: "early_elementary", order_index: 4, title: t.nodes.codeBoss, game_id: "g-block-3", node_type: "boss", xp_requirement: 140 },
      { id: "c-e-5", subject_id: "coding-logic", age_tier: "early_elementary", order_index: 5, title: t.nodes.prizeBox, game_id: null, node_type: "reward", xp_requirement: 180 },
    ],
    upper_elementary: [
      { id: "c-u-1", subject_id: "coding-logic", age_tier: "upper_elementary", order_index: 1, title: t.nodes.loopMaster, game_id: "g-block-4", node_type: "game", xp_requirement: 0 },
      { id: "c-u-2", subject_id: "coding-logic", age_tier: "upper_elementary", order_index: 2, title: t.nodes.algorithmArena, game_id: "g-algo-1", node_type: "game", xp_requirement: 60 },
      { id: "c-u-3", subject_id: "coding-logic", age_tier: "upper_elementary", order_index: 3, title: t.nodes.debugQuest, game_id: "g-debug-1", node_type: "game", xp_requirement: 130 },
      { id: "c-u-4", subject_id: "coding-logic", age_tier: "upper_elementary", order_index: 4, title: t.nodes.finalBoss, game_id: "g-block-5", node_type: "boss", xp_requirement: 200 },
      { id: "c-u-5", subject_id: "coding-logic", age_tier: "upper_elementary", order_index: 5, title: t.nodes.grandPrize, game_id: null, node_type: "reward", xp_requirement: 280 },
    ],
  };

  return subject === "math" ? mathNodes[ageTier] : codingNodes[ageTier];
}

// Map game IDs to game types
const GAME_TYPE_MAP: Record<string, GameType> = {
  "g-count-1": "counting", "g-count-2": "counting", "g-count-3": "counting",
  "g-shape-1": "shapes",
  "g-addsub-1": "addition_subtraction", "g-addsub-2": "addition_subtraction",
  "g-mult-1": "multiplication", "g-mult-2": "multiplication", "g-mult-3": "multiplication",
  "g-word-1": "word_problems",
  "g-frac-1": "fractions", "g-frac-2": "fractions",
  "g-alg-1": "algebra",
  "g-pattern-1": "pattern_recognition", "g-pattern-2": "pattern_recognition",
  "g-sort-1": "sorting",
  "g-seq-1": "sequencing",
  "g-block-1": "block_sequencing", "g-block-2": "block_programming", "g-block-3": "block_programming",
  "g-block-4": "block_programming", "g-block-5": "block_programming",
  "g-cond-1": "conditionals",
  "g-algo-1": "algorithm_challenge",
  "g-debug-1": "debugging",
};

export default function PlayHomePage() {
  const router = useRouter();
  const { selectedChild } = useChildStore();
  const { t } = useTranslation();

  if (!selectedChild) return null;

  const ageTier = selectedChild.age_tier;
  const mathNodes = getAdventureNodes("math", ageTier, t);
  const codingNodes = getAdventureNodes("coding-logic", ageTier, t);
  const level = getLevelFromXP(selectedChild.xp_total);

  const handleNodeClick = (node: AdventureNode) => {
    if (!node.game_id) return; // Reward nodes don't navigate
    const gameType = GAME_TYPE_MAP[node.game_id] || "addition_subtraction";
    const subject = node.subject_id === "math" ? "math" : "coding";
    router.push(`/play/${subject}/${node.game_id}?type=${gameType}`);
  };

  return (
    <div>
      {/* XP Header */}
      <div className="mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
        <XPBar
          currentXP={selectedChild.xp_total}
          levelXP={level.currentLevelXP}
          level={level.level}
        />
      </div>

      {/* Subject Tabs */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Math Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50/80 to-indigo-100/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-blue-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🧮</span>
            <h2 className="text-2xl font-bold text-blue-800">{t.play.mathAdventure}</h2>
          </div>
          <AdventureMap
            nodes={mathNodes}
            progress={null}
            childXP={selectedChild.xp_total}
            onNodeClick={handleNodeClick}
          />
        </motion.div>

        {/* Coding Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50/80 to-emerald-100/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-green-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">💻</span>
            <h2 className="text-2xl font-bold text-green-800">
              {t.play.codingAdventure}
            </h2>
          </div>
          <AdventureMap
            nodes={codingNodes}
            progress={null}
            childXP={selectedChild.xp_total}
            onNodeClick={handleNodeClick}
          />
        </motion.div>
      </div>
    </div>
  );
}
