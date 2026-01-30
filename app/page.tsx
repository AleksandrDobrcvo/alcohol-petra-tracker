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
        <div className="absolute left-1/2 top-[55%] h-96 w-96 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-20 hidden w-[220px] select-none sm:block md:w-[280px]">
          <img
            className="float-petra opacity-90"
            src="/petra.png"
            alt="Петра"
            draggable={false}
          />
        </div>
        <div className="absolute right-0 top-28 hidden w-[220px] select-none sm:block md:w-[280px]">
          <img
            className="float-alco opacity-90"
            src="/alco.png"
            alt="Алко"
            draggable={false}
          />
        </div>
      </div>

      <header className="relative z-10 flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
            Облік внесків клану
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Алко / Петра — затишний трекер внесків
          </h1>
          <p className="max-w-2xl text-base text-zinc-200/80 sm:text-lg">
            Фіксуй здачі, дивись статуси виплат і будь впевнений, хто саме додав запис.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            className="inline-flex w-fit items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            href="/entries"
          >
            📒 Перейти до записів
          </Link>
          {session ? (
            <div className="text-sm text-zinc-200/80">
              Увійшов: <span className="font-medium text-zinc-50">{session.user.name}</span>
              {session.user.isApproved ? null : (
                <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-200">
                  ⏳ Очікує підтвердження
                </span>
              )}
            </div>
          ) : (
            <Link
              className="inline-flex w-fit items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400"
              href="/signin"
            >
              🚀 Увійти через Discord
            </Link>
          )}
          {role === "OWNER" ? (
            <Link
              className="inline-flex w-fit items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10"
              href="/admin/users"
            >
              🛠️ Адмінка
            </Link>
          ) : null}
        </div>
      </header>

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
        <Link
          className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
          href="/public/stats"
        >
          📊 Публічна статистика клану
        </Link>
      </section>

      {/* New animated submission button */}
      <LazyFormWrapper />
    </main>
  );
}

