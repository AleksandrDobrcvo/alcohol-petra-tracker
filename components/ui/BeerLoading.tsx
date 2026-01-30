"use client";

import { motion } from "framer-motion";
import { Beer } from "lucide-react";

interface BeerLoadingProps {
  show?: boolean;
}

export default function BeerLoading({ show = true }: BeerLoadingProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="relative">
        {/* Beer glass container */}
        <div className="relative w-16 h-20 bg-gradient-to-b from-amber-100/20 to-amber-200/30 rounded-b-lg border-2 border-amber-300/50 overflow-hidden">
          {/* Beer filling animation */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400"
            initial={{ height: "0%" }}
            animate={{ height: ["0%", "85%", "85%", "0%"] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Beer foam */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/90 to-amber-100/70"
              animate={{
                height: ["8px", "12px", "8px"],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Foam bubbles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/80 rounded-full"
                  style={{
                    left: `${20 + i * 12}%`,
                    top: "2px"
                  }}
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0.8, 0.3, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
            
            {/* Beer bubbles rising */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-300/60 rounded-full"
                style={{
                  left: `${10 + (i % 4) * 20}%`,
                  bottom: "0px"
                }}
                animate={{
                  y: [0, -60, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>

          {/* Glass shine effect */}
          <div className="absolute top-2 left-2 w-2 h-8 bg-white/20 rounded-full blur-sm" />
        </div>

        {/* Beer icon */}
        <motion.div
          className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Beer className="w-4 h-4 text-white" />
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-xs text-amber-400 font-medium">Завантаження...</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
