"use client";

import { motion } from "framer-motion";
import type { AdventureNode, ChildAdventureProgress } from "@/lib/types";

interface AdventureMapProps {
  nodes: AdventureNode[];
  progress: ChildAdventureProgress | null;
  childXP: number;
  onNodeClick: (node: AdventureNode) => void;
}

export default function AdventureMap({
  nodes,
  progress,
  childXP,
  onNodeClick,
}: AdventureMapProps) {
  const completedNodes = new Set(progress?.nodes_completed || []);

  const getNodeStatus = (node: AdventureNode) => {
    if (completedNodes.has(node.id)) return "completed";
    if (childXP >= node.xp_requirement) return "unlocked";
    return "locked";
  };

  const getNodeEmoji = (nodeType: string, status: string) => {
    if (status === "locked") return "🔒";
    switch (nodeType) {
      case "game":
        return "⭐";
      case "boss":
        return "🐉";
      case "checkpoint":
        return "🏁";
      case "reward":
        return "🎁";
      default:
        return "⭐";
    }
  };

  const getNodeColors = (nodeType: string, status: string) => {
    if (status === "locked")
      return "from-gray-300 to-gray-400 border-gray-400";
    if (status === "completed")
      return "from-green-400 to-green-600 border-green-500";
    switch (nodeType) {
      case "game":
        return "from-purple-400 to-purple-600 border-purple-500";
      case "boss":
        return "from-red-400 to-red-600 border-red-500";
      case "checkpoint":
        return "from-blue-400 to-blue-600 border-blue-500";
      case "reward":
        return "from-yellow-400 to-orange-500 border-yellow-500";
      default:
        return "from-purple-400 to-purple-600 border-purple-500";
    }
  };

  return (
    <div className="relative w-full overflow-x-auto py-8">
      <div className="flex flex-col items-center min-w-[400px]">
        {nodes.map((node, index) => {
          const status = getNodeStatus(node);
          const isClickable = status !== "locked";

          return (
            <div key={node.id} className="flex flex-col items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`w-1 h-12 ${
                    status === "locked" ? "bg-gray-300" : "bg-purple-400"
                  }`}
                />
              )}

              {/* Node */}
              <motion.button
                whileHover={isClickable ? { scale: 1.15 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                onClick={() => isClickable && onNodeClick(node)}
                disabled={!isClickable}
                className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getNodeColors(
                  node.node_type,
                  status
                )} border-4 flex items-center justify-center shadow-lg transition-all ${
                  isClickable
                    ? "cursor-pointer hover:shadow-xl"
                    : "cursor-not-allowed opacity-60"
                } ${
                  status === "completed" ? "ring-4 ring-green-300/50" : ""
                }`}
              >
                <span className="text-2xl">
                  {getNodeEmoji(node.node_type, status)}
                </span>

                {/* Node number */}
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 shadow">
                  {node.order_index}
                </span>
              </motion.button>

              {/* Node label */}
              <span
                className={`text-sm font-bold mt-2 text-center max-w-[120px] ${
                  status === "locked" ? "text-gray-400" : "text-gray-700"
                }`}
              >
                {node.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
