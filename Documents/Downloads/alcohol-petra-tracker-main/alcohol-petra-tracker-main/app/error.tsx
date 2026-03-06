"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-4xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-red-400/20 blur-3xl" />
        <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-4xl font-bold text-white mb-4">🚨 Помилка</h1>
        <p className="text-lg text-zinc-300 mb-6">
          Щось пішло не так. Спробуй перезавантажити сторінку.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-medium text-white hover:bg-amber-400"
          >
            🔄 Перезавантажити
          </button>
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            href="/"
          >
            🏠 На головну
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">
            <p className="font-semibold mb-2">Деталі помилки:</p>
            <p className="font-mono text-xs">{error.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
