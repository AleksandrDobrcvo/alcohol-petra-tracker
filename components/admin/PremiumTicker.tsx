"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

type Contributor = {
  id: string;
  name: string;
  totalAmount: number;
};

export function PremiumTicker({ contributors }: { contributors: Contributor[] }) {
  // Limit to 15 items max and ensure no duplicates in sequence
  const limitedContributors = contributors.length > 0 
    ? contributors.slice(0, 15)
    : [
        { name: "Очікуємо лідерів...", totalAmount: 0, id: "fallback1" },
        { name: "Склад поповнюється...", totalAmount: 0, id: "fallback2" },
        { name: "Будь першим!", totalAmount: 0, id: "fallback3" }
      ];

  // Create double track for seamless infinite loop
  const trackContent = [...limitedContributors, ...limitedContributors];

  return (
    <div className="relative border-b border-white/5 bg-black/40 overflow-hidden h-12 flex items-center select-none group/ticker">
      {/* Smooth fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#05080a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#05080a] to-transparent z-10 pointer-events-none" />
      
      <div className="flex whitespace-nowrap items-center w-full">
        <motion.div
          className="flex gap-16 items-center px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 30,
            repeat: Infinity, 
            ease: "linear",
            repeatType: "loop"
          }}
        >
          {trackContent.map((contributor, idx) => (
            <div 
              key={`${contributor.id || contributor.name}-${idx}`} 
              className="flex items-center gap-4 hover:scale-105 transition-transform duration-300 ease-out cursor-default"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="font-black text-xs text-white uppercase tracking-wide group-hover/ticker:text-amber-300 transition-colors duration-300">
                  {contributor.name}
                </span>
              </div>
              {contributor.totalAmount > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  <span className="text-[11px] font-black text-emerald-300 tracking-wider">
                    {contributor.totalAmount.toLocaleString()} ₴
                  </span>
                </div>
              )}
              <span className="text-white/15 font-black text-lg">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}