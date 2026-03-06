"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Завантаження..." }: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 bg-[#05080a]/80 backdrop-blur-xl flex items-center justify-center z-[100]">
      <div className="relative">
        {/* Анімовані кільця */}
        <motion.div
          className="w-24 h-24 rounded-full border-t-2 border-amber-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 w-24 h-24 rounded-full border-b-2 border-emerald-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Центральна іконка */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,158,11,0.3)]"
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🏰
        </motion.div>

        {/* Текст */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]"
          >
            {message}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
