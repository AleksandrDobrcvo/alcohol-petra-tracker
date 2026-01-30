import Link from "next/link";
import { requireSession } from "@/src/server/auth";
import { EntriesClient } from "@/components/EntriesClient";
import { ApiError } from "@/src/server/errors";

export default async function EntriesPage() {
  let session = null;
  let authError: ApiError | null = null;
  try {
    session = await requireSession();
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
        ? "Адмін ще не дав доступ. Напиши власнику клану — і після підтвердження все відкриється."
        : code === "BLOCKED"
          ? "Твій доступ заблокований. Якщо це помилка — напиши власнику."
          : code === "FROZEN"
            ? authError.message || "Твій профіль тимчасово заморожено. Напиши власнику клану."
          : "Увійди через Discord, щоб бачити записи та додавати Алко/Петру.";

    return (
      <main className="relative mx-auto flex min-h-[calc(100vh-0px)] max-w-5xl flex-col items-center justify-center px-6 py-12">
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
            🏰 Клановий доступ
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
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">📒 Записи</h1>
        <Link className="text-sm text-zinc-300 hover:text-zinc-100" href="/">
          🏠 На головну
        </Link>
      </header>
      <EntriesClient />
    </main>
  );
}

