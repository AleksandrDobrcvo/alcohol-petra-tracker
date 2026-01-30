"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium",
        "border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

