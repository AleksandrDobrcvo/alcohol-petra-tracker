import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/authOptions";
import LazyFormWrapper from "@/components/LazyFormWrapper";
import { motion } from "framer-motion";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "VIEWER";

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

        {session ? (
          <>
            <p className="text-lg text-zinc-300 mb-4">
              👋 Вітаю, {session.user?.name || "користувач"}!
            </p>
            {role === "VIEWER" && (
              <p className="text-sm text-amber-400 mb-4">
                ⏳ Твій акаунт очікує на підтвердження адміністратором
              </p>
            )}
            {(role === "ADMIN" || role === "OWNER") && (
              <p className="text-sm text-green-400 mb-4">
                ✅ Ти маєш доступ до всіх функцій
              </p>
            )}
          </>
        ) : (
          <p className="text-lg text-zinc-300 mb-4">
            🔐 Увійдіть через Discord для доступу до функцій
          </p>
        )}

        {session && (
          <section className="relative z-10 mt-6 text-center">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
              href="/entries"
            >
              📒 Перейти до записів
            </Link>
          </section>
        )}

        {session && role === "ADMIN" && (
          <section className="relative z-10 mt-4 text-center">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-red-500/20 px-4 py-3 text-sm font-medium text-red-300 backdrop-blur hover:bg-red-500/30"
              href="/admin"
            >
              ⚙️ Адмін панель
            </Link>
          </section>
        )}
      </div>

      <section className="relative z-10 mt-6 text-center">
        <Link
          className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
          href="/public/stats"
        >
          📊 Публічна статистика клану
        </Link>
      </section>

      <section className="relative z-10 mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm font-medium">🍺 Алкоголь</div>
          <div className="mt-1 text-sm text-zinc-200/80">Здавай алкоголь на склад клану</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm font-medium">🌿 Петра</div>
          <div className="mt-1 text-sm text-zinc-200/80">Здавай петру для клану</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm font-medium">Безпечно</div>
          <div className="mt-1 text-sm text-zinc-200/80">Доступ лише через Discord-акаунт.</div>
        </div>
      </section>

      <section className="relative z-10 mt-12 text-center">
        <div className="border-t border-white/10 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-lg font-medium text-white">
              ✨ Створено з любов'ю Саня космос
            </p>
            <p className="text-sm text-zinc-400">
              🚀 Сучасний трекер для клану
            </p>
            <div className="flex justify-center items-center gap-6 text-xs text-zinc-500">
              <span>Next.js</span>
              <span>•</span>
              <span>TailwindCSS</span>
              <span>•</span>
              <span>Vercel</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated submission button */}
      <LazyFormWrapper />
    </main>
  );
}

