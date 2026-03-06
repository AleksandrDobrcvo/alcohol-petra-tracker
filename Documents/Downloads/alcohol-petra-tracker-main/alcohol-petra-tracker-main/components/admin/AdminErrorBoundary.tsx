'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || '';
      
      // Перевіряємо, чи це помилка нестачі прав
      if (errorMessage.includes('Insufficient') && (errorMessage.includes('permissions') || errorMessage.includes('role'))) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-xl font-bold text-white mb-2">Недостатньо прав</h2>
              <p className="text-zinc-400 mb-6">
                У вас недостатньо прав для доступу до цієї сторінки
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Повернутися назад
              </Button>
            </div>
          </div>
        );
      }
      
      // Якщо є кастомний fallback
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }
      
      // Стандартна помилка
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Щось пішло не так</h2>
            <p className="text-zinc-400 mb-6">
              Сталася помилка при завантаженні сторінки
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Оновити сторінку
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}