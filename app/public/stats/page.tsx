import { unstable_noStore } from "next/cache";
import { prisma } from "@/src/server/prisma";

export const dynamic = "force-dynamic";

export default async function PublicStatsPage() {
  unstable_noStore();
  const [alcoStats, petraStats] = await Promise.all([
    prisma.entry.groupBy({
      by: ["submitterId"],
      where: { type: "ALCO" },
      _sum: { quantity: true, amount: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.entry.groupBy({
      by: ["submitterId"],
      where: { type: "PETRA" },
      _sum: { quantity: true, amount: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  const submitterIds = new Set([
    ...alcoStats.map((s) => s.submitterId),
    ...petraStats.map((s) => s.submitterId),
  ]);

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(submitterIds) } },
    select: { id: true, name: true },
  });

  const nameById = Object.fromEntries(users.map((u) => [u.id, u.name]));

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-0px)] max-w-5xl flex-col px-6 py-12">
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

      <header className="relative z-10 flex flex-col gap-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
          📊 Публічна статистика
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          🏆 Топ клану по Алко та Петрі
        </h1>
        <p className="max-w-2xl text-base text-zinc-200/80 sm:text-lg">
          Прозорий рейтинг внесків. Бачимо, хто і скільки приніс клану.
        </p>
      </header>

      <section className="relative z-10 mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
            🍺 Алко — топ
          </h2>
          <div className="space-y-2 text-sm">
            {alcoStats.map((s, i) => (
              <div key={s.submitterId} className="flex justify-between">
                <span className="text-zinc-200">
                  {i + 1}. {nameById[s.submitterId] ?? "????"}
                </span>
                <span className="font-mono text-zinc-300">
                  {s._sum.quantity ?? 0} шт / {Number(s._sum.amount ?? 0).toFixed(2)} ₴
                </span>
              </div>
            ))}
            {alcoStats.length === 0 && (
              <div className="text-zinc-400">Поки що немає записів</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
            💎 Петра — топ
          </h2>
          <div className="space-y-2 text-sm">
            {petraStats.map((s, i) => (
              <div key={s.submitterId} className="flex justify-between">
                <span className="text-zinc-200">
                  {i + 1}. {nameById[s.submitterId] ?? "????"}
                </span>
                <span className="font-mono text-zinc-300">
                  {s._sum.quantity ?? 0} шт / {Number(s._sum.amount ?? 0).toFixed(2)} ₴
                </span>
              </div>
            ))}
            {petraStats.length === 0 && (
              <div className="text-zinc-400">Поки що немає записів</div>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 mt-auto pt-10 text-center text-xs text-zinc-200/60">
        <p>🏰 Клановий трекер — дані оновлюються в реальному часі</p>
      </footer>
    </main>
  );
}
