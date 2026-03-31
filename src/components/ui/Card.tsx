import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "game" | "stat" | "achievement";
  glow?: boolean;
}

export default function Card({
  className,
  variant = "default",
  glow = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-6 transition-all duration-200",
        {
          "bg-white shadow-lg border border-gray-100": variant === "default",
          "bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl border-2 border-purple-200 hover:shadow-2xl hover:scale-[1.02]":
            variant === "game",
          "bg-gradient-to-br from-white to-gray-50 shadow-md border border-gray-200":
            variant === "stat",
          "bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg border-2 border-yellow-300":
            variant === "achievement",
        },
        glow && "ring-4 ring-purple-400/30 animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
