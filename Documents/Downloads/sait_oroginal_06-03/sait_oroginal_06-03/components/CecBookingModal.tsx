"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface CecBookingModalProps {
  isOpen: boolean;
  cecType: "PETRA" | "ALCO";
  onClose: () => void;
  onSuccess: () => void;
  queueCount?: number;
  hasActive?: boolean;
}

export function CecBookingModal({
  isOpen,
  cecType,
  onClose,
  onSuccess,
  queueCount = 0,
  hasActive = false,
}: CecBookingModalProps) {
  const { data: session } = useSession();
  const [duration, setDuration] = useState(2);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cecLabel = cecType === "PETRA" ? "🍃 Петрушка" : "🍺 Алкоголь";
  const cecColor = cecType === "PETRA" ? "emerald" : "amber";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cec-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cecType,
          duration,
          reason: reason || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Помилка при бронюванні");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невідома помилка");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const endTime = new Date();
  endTime.setHours(endTime.getHours() + duration);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        {/* Заголовок */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-white">
              📅 Бронювання цеху
            </h2>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${
                cecType === "PETRA"
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-400/40 bg-amber-500/10 text-amber-200"
              }`}
            >
              {cecLabel}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Якщо цех зараз зайнятий, твоя заявка автоматично потрапить в чергу
            очікування.
          </p>
          {(hasActive || queueCount > 0) && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
              {hasActive && (
                <span className="inline-flex items-center gap-1 text-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Цех зараз <span className="font-semibold">зайнятий</span>
                </span>
              )}
              {queueCount > 0 && (
                <span className="inline-flex items-center gap-1 text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Перед тобою{" "}
                  <span className="font-semibold">
                    {queueCount} {queueCount === 1 ? "людина" : "людей"}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Тривалість */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Тривалість:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDuration(h)}
                  className={`py-2 rounded-lg font-medium transition-all ${
                    duration === h
                      ? `bg-${cecColor}-600 text-white`
                      : `bg-white/10 text-zinc-300 hover:bg-white/20`
                  }`}
                >
                  {h}ч
                </button>
              ))}
            </div>
          </div>

          {/* Час закінчення */}
          <div className="rounded-lg bg-white/5 p-4 border border-white/10">
            <p className="text-sm text-zinc-400 mb-1">Приблизно до:</p>
            <p className="text-xl font-bold text-white">
              {endTime.toLocaleTimeString("uk-UA", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Причина (опціонально) */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Причина (опціонально):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Наприклад: евро на морях, лут..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-white/40 focus:outline-none transition-colors"
            />
          </div>

          {/* Помилка */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <p className="text-sm text-red-400">⚠️ {error}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-${cecColor}-600 hover:bg-${cecColor}-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors`}
            >
              {loading ? "Завантаження..." : "Забронювати"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
