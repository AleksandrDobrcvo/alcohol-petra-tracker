"use client";

import { useState, useEffect } from "react";
import { Beer } from "lucide-react";

interface BeerLoadingProps {
  show?: boolean;
}

export default function BeerLoading({ show = true }: BeerLoadingProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [show]);

  if (!show || !visible) return null;

  return (
    <div
      className="beer-loading-fade fixed bottom-6 right-6 z-50"
      aria-hidden
    >
      <div className="relative">
        <div className="relative w-16 h-20 bg-gradient-to-b from-amber-100/20 to-amber-200/30 rounded-b-lg border-2 border-amber-300/50 overflow-hidden">
          <div
            className="beer-fill absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400"
            style={{ height: "85%" }}
          />
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/90 to-amber-100/70 rounded-t" />
          <div className="absolute top-2 left-2 w-2 h-8 bg-white/20 rounded-full blur-sm" />
        </div>
        <div className="beer-icon-bob absolute -top-2 -right-2 bg-amber-500 rounded-full p-1">
          <Beer className="w-4 h-4 text-white" />
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="beer-text-pulse text-xs text-amber-400 font-medium">Завантаження...</span>
        </div>
      </div>
    </div>
  );
}
