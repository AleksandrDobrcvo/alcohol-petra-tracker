"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        await signIn("discord", { callbackUrl: "/" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    })();
  }, []);

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-0px)] max-w-4xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-400/18 blur-3xl" />
        <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-amber-400/18 blur-3xl" />
        <div className="absolute left-1/2 top-[55%] h-96 w-96 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-20 hidden w-[220px] select-none sm:block md:w-[280px]">
          <img className="float-petra opacity-90" src="/petra.png" alt="Петра" draggable={false} />
        </div>
        <div className="absolute right-0 top-28 hidden w-[220px] select-none sm:block md:w-[280px]">
          <img className="float-alco opacity-90" src="/alco.png" alt="Алко" draggable={false} />
        </div>
      </div>

      <div className="relative z-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="mx-auto w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
          🚀 Авторизація
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Відкриваємо Discord...
        </h1>
        <p className="mt-3 text-sm text-zinc-200/80 sm:text-base">
          Якщо нічого не відбулось — натисни кнопку нижче.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => signIn("discord", { callbackUrl: "/" })}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400"
          >
            🔁 Повторити вхід
          </button>
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            href="/"
          >
            🏠 На головну
          </Link>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">
            ❌ {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
