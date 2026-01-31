"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-clan flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Щось пішло не так</h2>
              <p className="text-zinc-400 mb-6">
                Ми вже працюємо над вирішенням цієї проблеми
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-zinc-300 font-mono">
                {this.state.error?.message || "Невідома помилка"}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Спробувати знову
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Хук для глобального обробника помилок
export function useErrorHandler() {
  return (error: Error) => {
    console.error("Handled error:", error);
    // Тут можна додати логування в Sentry/LogRocket тощо
  };
}