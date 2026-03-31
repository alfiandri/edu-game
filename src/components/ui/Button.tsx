import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "xl";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-200",
          "focus:outline-none focus:ring-4 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "active:scale-95",
          {
            // Variants
            "bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-purple-800 focus:ring-purple-400":
              variant === "primary",
            "bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-blue-700 focus:ring-blue-400":
              variant === "secondary",
            "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300":
              variant === "ghost",
            "bg-gradient-to-b from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-500 hover:to-red-700 focus:ring-red-400":
              variant === "danger",
            "bg-gradient-to-b from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30 hover:from-green-500 hover:to-green-700 focus:ring-green-400":
              variant === "success",
            // Sizes
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-base": size === "md",
            "px-7 py-3.5 text-lg": size === "lg",
            "px-10 py-5 text-xl": size === "xl",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
