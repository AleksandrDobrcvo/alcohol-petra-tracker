"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LazyFormWrapper() {
  const { data: session } = useSession();
  const router = useRouter();

  // Показивати кнопку тільки для авторизованих
  if (!session) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="relative z-10 mt-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.8,
          duration: 0.5,
          type: "spring",
          stiffness: 200
        }}
        className="inline-block"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/entries')}
          className="group relative inline-flex items-center gap-4 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 px-10 py-5 text-xl font-black text-white shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:shadow-[0_25px_60px_rgba(245,158,11,0.4)] transition-all duration-500"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative flex items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                y: [0, -2, 2, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Send className="w-7 h-7" />
            </motion.div>
            
            <span className="relative flex flex-col items-start">
              <span className="relative z-10 tracking-tight">ПОДАТИ ЗАЯВКУ</span>
              <span className="text-[10px] font-medium opacity-70 tracking-widest">SUBMIT RESOURCES</span>
            </span>
            
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="w-6 h-6 text-amber-200" />
            </motion.div>
          </div>
        </motion.button>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-4 text-sm text-zinc-400"
      >
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
          ✨ Натисни, щоб подати заявку на здачу Алко або Петри
        </motion.span>
      </motion.p>
    </motion.div>
  );
}
