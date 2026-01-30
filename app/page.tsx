import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/authOptions";
import LazyFormWrapper from "@/components/LazyFormWrapper";

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

      {/* Animated submission button */}
      <LazyFormWrapper />
    </main>
  );
}

