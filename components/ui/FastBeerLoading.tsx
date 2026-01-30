"use client";

import { Beer } from "lucide-react";

interface FastBeerLoadingProps {
  show?: boolean;
}

export default function FastBeerLoading({ show = true }: FastBeerLoadingProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Beer glass container */}
        <div className="relative w-16 h-20 bg-gradient-to-b from-amber-100/20 to-amber-200/30 rounded-b-lg border-2 border-amber-300/50 overflow-hidden">
          {/* Beer filling animation */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 animate-pulse" style={{ height: "85%" }}>
            {/* Beer foam */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/90 to-amber-100/70">
              {/* Simple foam bubbles */}
              <div className="flex justify-center gap-2 pt-1">
                <div className="w-1 h-1 bg-white/80 rounded-full"></div>
                <div className="w-1 h-1 bg-white/80 rounded-full"></div>
                <div className="w-1 h-1 bg-white/80 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Glass shine effect */}
          <div className="absolute top-2 left-2 w-2 h-8 bg-white/20 rounded-full blur-sm" />
        </div>

        {/* Beer icon */}
        <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1">
          <Beer className="w-4 h-4 text-white" />
        </div>

        {/* Loading text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-amber-400 font-medium animate-pulse">Завантаження...</span>
        </div>
      </div>
    </div>
  );
}
