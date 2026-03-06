"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, Info, AlertTriangle, Bell, Crown, Star, UserCheck } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning" | "role" | "approval" | "rejection";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  error: {
    icon: XCircle,
    bg: "from-red-500/20 to-red-600/10",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "shadow-red-500/20",
  },
  info: {
    icon: Info,
    bg: "from-sky-500/20 to-sky-600/10",
    border: "border-sky-500/30",
    text: "text-sky-400",
    glow: "shadow-sky-500/20",
  },
  warning: {
    icon: AlertTriangle,
    bg: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
  },
  role: {
    icon: Crown,
    bg: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
  },
  approval: {
    icon: UserCheck,
    bg: "from-emerald-500/20 to-teal-600/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  rejection: {
    icon: XCircle,
    bg: "from-red-500/20 to-rose-600/10",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "shadow-red-500/20",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`
        relative overflow-hidden rounded-2xl border ${config.border}
        bg-gradient-to-r ${config.bg} backdrop-blur-xl
        shadow-xl ${config.glow} shadow-lg
        p-4 pr-12 min-w-[280px] max-w-[380px]
      `}
    >
      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${config.text.replace("text-", "bg-")} opacity-30`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
      />

      {/* Glow effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full ${config.bg} blur-3xl opacity-50`} />

      <div className="relative flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${config.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{toast.message}</p>
          )}
        </div>
      </div>

      <button
        onClick={onRemove}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast Container - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Utility hook for common toast patterns
export function useNotifications() {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string) => 
      addToast({ type: "success", title, message }),
    
    error: (title: string, message?: string) => 
      addToast({ type: "error", title, message }),
    
    info: (title: string, message?: string) => 
      addToast({ type: "info", title, message }),
    
    warning: (title: string, message?: string) => 
      addToast({ type: "warning", title, message }),
    
    roleChange: (role: string) => 
      addToast({ type: "role", title: "Роль змінено!", message: `Вашу роль змінено на: ${role}` }),
    
    approved: (message?: string) => 
      addToast({ type: "approval", title: "Заявку схвалено! ✨", message: message || "Виплата буде найближчим часом" }),
    
    rejected: (reason?: string) => 
      addToast({ type: "rejection", title: "Заявку відхилено", message: reason || "Зверніться до адміністрації" }),
    
    requestSent: () => 
      addToast({ type: "success", title: "Заявку відправлено! 🚀", message: "Очікуйте на перевірку адміністратором" }),
  };
}
