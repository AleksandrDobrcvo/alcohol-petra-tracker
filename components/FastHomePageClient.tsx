"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import FastMultiStepForm from "./ui/FastMultiStepForm";
import { Send, Zap, Sparkles } from "lucide-react";

export default function FastHomePageClient() {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (formData: any) => {
    // TODO: Implement form submission
    console.log("Form submitted:", formData);
  };

  return (
    <>
      {session && (
        <div className="relative z-10 mt-8 text-center">
          <div className="inline-block">
            <button
              onClick={() => setShowForm(true)}
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 py-4 text-lg font-bold text-white shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative flex items-center gap-3">
                <div className="transform hover:rotate-12 transition-transform duration-200">
                  <Send className="w-6 h-6" />
                </div>
                
                <span className="relative">
                  <span className="relative z-10">🚀 Подати заявку на здачу</span>
                  <div className="absolute inset-0 blur-sm bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </span>
                
                <div className="transform hover:scale-110 transition-transform duration-200">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-30 blur-lg group-hover:opacity-60 transition-opacity duration-300" />
            </button>
          </div>
          
          <p className="mt-4 text-sm text-zinc-400 animate-pulse">
            ✨ Натисни, щоб подати заявку на здачу Алко або Петри
          </p>
        </div>
      )}

      {showForm && (
        <FastMultiStepForm
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
