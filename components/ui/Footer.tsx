"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#05080a]/95 backdrop-blur-xl py-4 text-center">
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-400/40"
            style={{
              left: `${15 + i * 15}%`,
              top: '50%',
            }}
            animate={{
              y: [-5, -15, -5],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <motion.div 
            className="flex items-center gap-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span 
              className="text-lg filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🏰
            </motion.span>
            <span className="bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent uppercase font-black text-xs tracking-[0.12em]">
              SOBRANIE
            </span>
          </motion.div>

          <div className="hidden sm:block h-3 w-px bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
          
          {/* Tagline */}
          <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.15em] text-zinc-500">
            <span className="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/5 font-bold">
              Created for the elite ❤️
            </span>
            <span className="font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              By Саня Космос
            </span>
          </div>

          <div className="hidden sm:block h-3 w-px bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />

          {/* Icons */}
          <div className="flex gap-1.5 items-center">
            {['🍺', '🌿', '⭐'].map((icon, i) => (
              <motion.span
                key={i}
                className="text-xs filter drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]"
                animate={{
                  y: [0, -2, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {icon}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
