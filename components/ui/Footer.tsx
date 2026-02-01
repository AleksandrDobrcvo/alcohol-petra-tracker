"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/5 bg-[#05080a]/95 backdrop-blur-xl py-6 text-center overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-400/30"
            style={{
              left: `${15 + i * 15}%`,
              bottom: '20%',
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span 
              className="text-xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🏰
            </motion.span>
            <span className="bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent uppercase font-black text-sm tracking-[0.15em]">
              SOBRANIE
            </span>
          </motion.div>

          <div className="hidden md:block h-4 w-px bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
          
          {/* Tagline */}
          <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/5 font-bold">
              Created for the elite ❤️
            </span>
            <span className="font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              By Саня Космос
            </span>
          </div>

          <div className="hidden md:block h-4 w-px bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />

          {/* Icons */}
          <div className="flex gap-2 items-center">
            {['🍺', '🌿', '⭐'].map((icon, i) => (
              <motion.span
                key={i}
                className="text-sm filter drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]"
                animate={{
                  y: [0, -3, 0],
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
        
        <div className="mt-4">
          <div className="text-[7px] uppercase tracking-[0.3em] text-zinc-700 font-bold">
            &copy; {new Date().getFullYear()} Sobranie Clan Tracker
          </div>
        </div>
      </div>
    </footer>
  );
}
