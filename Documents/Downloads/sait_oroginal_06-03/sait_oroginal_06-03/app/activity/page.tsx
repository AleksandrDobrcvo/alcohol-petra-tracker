import { requireSession } from "@/src/server/auth";
import { ApiError } from "@/src/server/errors";
import Link from "next/link";
import { ClanActivityFeed } from "@/components/ClanActivityFeed";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  let authError: ApiError | null = null;

  try {
    await requireSession();
  } catch (e) {
    authError = e instanceof ApiError ? e : new ApiError(401, "UNAUTHENTICATED", "Потрібен вхід");
  }

  if (authError) {
    return (
      <main className="relative mx-auto flex min-h-[calc(100vh-0px)] max-w-5xl flex-col items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-400/18 blur-3xl" />
          <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-amber-400/18 blur-3xl" />
          <div className="absolute left-1/2 top-[55%] h-96 w-96 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <div className="mx-auto w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
            📰 Стрічка активності
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Доступ лише після входу
          </h1>
          <p className="mt-3 text-sm text-zinc-200/80 sm:text-base">{authError.message}</p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400"
              href="/signin"
            >
              🚀 Увійти через Discord
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
              href="/"
            >
              🏠 На головну
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex max-w-7xl flex-col px-6 py-10 pb-20">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -right-28 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              📰 Стрічка
            </div>
            <h1 className="mt-3 text-3xl font-black text-white tracking-tight sm:text-4xl">
              Активність клану SOBRANIE
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-xl">
              Останні дії лідерів та учасників: заявки, підтвердження, ролі та внески.
            </p>
          </div>
          <div className="mt-3 flex gap-2 sm:mt-0">
            <Link
              href="/public/stats"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15"
            >
              🏆 Публічні топи
            </Link>
            <Link
              href="/entries"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 border border-emerald-400/40 hover:bg-emerald-500/30 hover:text-white"
            >
              📒 Записи
            </Link>
          </div>
        </header>

        <ClanActivityFeed />
      </div>
    </main>
  );
}

