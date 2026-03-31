"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  color?: "purple" | "blue" | "green" | "yellow" | "red";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ProgressBar({
  value,
  max = 100,
  className,
  color = "purple",
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorMap = {
    purple: "from-purple-400 to-purple-600",
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-green-600",
    yellow: "from-yellow-400 to-orange-500",
    red: "from-red-400 to-red-600",
  };

  const sizeMap = {
    sm: "h-2",
    md: "h-4",
    lg: "h-6",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full rounded-full bg-gray-200 overflow-hidden",
          sizeMap[size]
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            colorMap[color]
          )}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1 text-right font-medium">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}
