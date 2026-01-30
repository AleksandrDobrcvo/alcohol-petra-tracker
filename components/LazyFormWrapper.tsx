"use client";

import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

// Lazy load the form
const MultiStepForm = lazy(() => import("./ui/MultiStepForm"));

export default function LazyFormWrapper() {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (formData: any) => {
    console.log("Form submitted:", formData);
  };

  return (
    <>
      <div className="relative z-10 mt-8 text-center">
        <div className="inline-block">
          <button
            onClick={() => setShowForm(true)}
            className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 py-4 text-lg font-bold text-white shadow-2xl hover:shadow-amber-500/25 transition-all duration-300"
          >
            <div className="relative flex items-center gap-3">
              <Send className="w-6 h-6" />
              <span>🚀 Подати заявку на здачу</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </button>
        </div>
        
        <p className="mt-4 text-sm text-zinc-400">
          ✨ Натисни, щоб подати заявку на здачу Алко або Петри
        </p>
      </div>

      {showForm && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-white text-xl">Завантаження форми...</div>
          </div>
        }>
          <MultiStepForm
            onSubmit={handleSubmit}
            onClose={() => setShowForm(false)}
          />
        </Suspense>
      )}
    </>
  );
}
