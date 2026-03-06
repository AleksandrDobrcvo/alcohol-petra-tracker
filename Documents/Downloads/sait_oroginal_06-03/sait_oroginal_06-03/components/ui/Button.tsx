"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50",
        size === "default" && "px-3 py-2 text-sm",
        size === "sm" && "px-2 py-1 text-xs",
        size === "lg" && "px-4 py-2 text-base",
        size === "icon" && "h-9 w-9",
        variant === "primary" && "border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white",
        variant === "outline" && "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}

