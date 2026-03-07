import Link from "next/link";
import { CecBookingCards } from "@/components/CecBookingCards";
import { requireSession } from "@/src/server/auth";
import { ApiError } from "@/src/server/errors";

export const dynamic = "force-dynamic";

export default async function CecBookingsPage() {
  let authError: ApiError | null = null;
  try {
    await requireSession();
  } catch (e) {
    authError = e instanceof ApiError ? e : new ApiError(401, "UNAUTHENTICATED", "Sign-in required");
  }

  if (authError) {
    const code = authError.code;
    const title =
      code === "NOT_APPROVED"
        ? "⏳ Очікує підтвердження"
        : code === "BLOCKED"
          ? "⛔ Доступ заблоковано"
          : code === "FROZEN"
            ? "🧊 Профіль заморожено"
            : "🔐 Потрібен вхід";
    const text =
      code === "NOT_APPROVED"
        ? "Адмін ще не дав доступ до бронювання цехів. Напиши власнику клану — і після підтвердження все відкриється."
        : code === "BLOCKED"
          ? "Твій доступ заблокований. Якщо це помилка — напиши власнику."
          : code === "FROZEN"
            ? authError.message || "Твій профіль тимчасово заморожено. Напиши власнику клану."
          : "Увійди через Discord, щоб бронювати цехи та ставати в чергу.";

    return (
      <main className="relative mx-auto flex min-h-[calc(100vh-0px)] max-w-4xl flex-col items-center justify-center px-6 py-12">
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

        <div className="relative z-10 w-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <div className="mx-auto w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
            🏭 Бронювання цехів
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-zinc-200/80 sm:text-base">{text}</p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {code === "UNAUTHENTICATED" ? (
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400"
                href="/signin"
              >
                🚀 Увійти через Discord
              </Link>
            ) : null}
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
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 pb-20">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            Живий статус цехів
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            🏭 Бронювання цехів SOBRANIE
          </h1>
          <p className="mt-2 text-sm text-zinc-300 sm:text-base">
            Обирай вільний цех або ставай у чергу, якщо зараз займають інші гравці.
          </p>
        </div>
        <div className="mt-2 flex gap-2 sm:mt-0">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-zinc-100 backdrop-blur hover:bg-white/10"
          >
            🏠 На головну
          </Link>
          <Link
            href="/entries"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 border border-emerald-400/40 backdrop-blur hover:bg-emerald-500/30 hover:text-white"
          >
            📒 До записів
          </Link>
        </div>
      </header>

      <section className="relative mt-4">
        <CecBookingCards />
      </section>
    </main>
  );
}

