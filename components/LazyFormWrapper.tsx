"use client";

import { useState, lazy, Suspense } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

// Lazy load the form
const MultiStepForm = lazy(() => import("./ui/MultiStepForm"));

export default function LazyFormWrapper() {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (formData: any) => {
    console.log("Form submitted:", formData);
  };

  if (!session) return null;

  return (
    <>
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 py-4 text-lg font-bold text-white shadow-2xl hover:shadow-amber-500/25 transition-all duration-300"
          >
            <div className="relative flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Send className="w-6 h-6" />
              </motion.div>
              
              <span className="relative">
                <span className="relative z-10">🚀 Подати заявку на здачу</span>
                <motion.div
                  className="absolute inset-0 blur-sm bg-white/30"
                  animate={{
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              </span>
              
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-5 h-5" />
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

      {showForm && (
        <Suspense fallback={<LoadingSpinner message="Завантаження форми..." />}>
          <MultiStepForm
            onSubmit={handleSubmit}
            onClose={() => setShowForm(false)}
          />
        </Suspense>
      )}
    </>
  );
}
