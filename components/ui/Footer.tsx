"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="relative mt-auto py-6 text-center"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none" />
      
      <motion.div
        className="relative z-10"
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <motion.span
            animate={{
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="font-medium bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
          >
            By Саня Космос
          </motion.span>
          
          <motion.div
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="text-amber-400"
          >
            ⚡
          </motion.div>
          
          <motion.span
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            •
          </motion.span>
          
          <motion.span
            animate={{
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="text-zinc-400"
          >
            Made with 💛 for the clan
          </motion.span>
        </div>
        
        {/* Decorative elements */}
        <motion.div
          className="mt-2 flex justify-center gap-4 text-xs text-zinc-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.span
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🍺
          </motion.span>
          <motion.span
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            🌿
          </motion.span>
          <motion.span
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            ⭐
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}
