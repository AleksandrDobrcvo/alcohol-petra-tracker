import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col px-6 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          🍺 Clan Tracker
        </h1>
        <p className="text-xl text-zinc-300 mb-8">
          Облік здачі Алко та Петри
        </p>
        
        <div className="space-y-4">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 text-lg font-medium text-white backdrop-blur hover:bg-white/15 transition-colors"
            href="/api/test"
          >
            🧪 Перевірити API
          </Link>
          
          <div className="block">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 text-lg font-medium text-white backdrop-blur hover:bg-white/15 transition-colors"
              href="/public/stats"
            >
              � Публічна статистика клану
            </Link>
          </div>
        </div>
      </div>

      <section className="relative z-10 mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm font-medium">Прозоро</div>
          <div className="mt-1 text-sm text-zinc-200/80">Видно, хто саме додав Алко/Петру.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm font-medium">Зручно</div>
          <div className="mt-1 text-sm text-zinc-200/80">Швидке додавання і пошук по записах.</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm font-medium">Безпечно</div>
          <div className="mt-1 text-sm text-zinc-200/80">Доступ лише через Discord-акаунт.</div>
        </div>
      </section>

      <section className="relative z-10 mt-6 text-center">
        <p className="text-sm text-zinc-400">
          ✨ Сайт працює на Vercel!
        </p>
      </section>
    </main>
  );
}

