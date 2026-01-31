import { unstable_noStore } from "next/cache";
import { prisma } from "@/src/server/prisma";
import { TrendingUp } from "lucide-react";
import { StatsClient } from "@/components/StatsClient";

export const dynamic = "force-dynamic";

export default async function PublicStatsPage() {
  unstable_noStore();
  const [alcoStats, petraStats, topSubmitters] = await Promise.all([
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
    prisma.entry.groupBy({
      by: ["submitterId"],
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    })
  ]);

  const submitterIds = new Set([
    ...alcoStats.map((s) => s.submitterId),
    ...petraStats.map((s) => s.submitterId),
    ...topSubmitters.map((s) => s.submitterId),
  ]);

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(submitterIds) } },
    select: { id: true, name: true },
  });

  const nameById = Object.fromEntries(users.map((u) => [u.id, u.name]));

  return (
    <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute -right-28 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <header className="relative z-10 flex flex-col gap-6 text-center lg:text-left">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mx-auto lg:mx-0">
          <TrendingUp className="w-3 h-3 text-amber-500" />
          Публічна статистика клану
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tight uppercase sm:text-7xl">
            🏆 Топ клану
          </h1>
          <p className="max-w-2xl text-lg text-zinc-500 font-medium mx-auto lg:mx-0">
            Прозорий рейтинг внесків. Бачимо справжніх героїв, що розвивають наш клан.
          </p>
        </div>
      </header>

      {/* Top 3 High-End Cards */}
      <StatsClient 
        alcoStats={alcoStats} 
        petraStats={petraStats} 
        topSubmitters={topSubmitters} 
        nameById={nameById} 
      />

      <footer className="relative z-10 mt-20 pb-10 text-center">
        <div className="flex items-center justify-center gap-4 text-zinc-600">
          <div className="h-px w-12 bg-white/5" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">SOBRANIE ELITE TRACKER</p>
          <div className="h-px w-12 bg-white/5" />
        </div>
      </footer>
    </main>
  );
}
