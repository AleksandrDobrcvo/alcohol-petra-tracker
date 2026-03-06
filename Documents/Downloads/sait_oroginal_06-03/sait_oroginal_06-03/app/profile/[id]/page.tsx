import { notFound } from "next/navigation";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { UserProfileClient } from "@/components/UserProfileClient";

type PageProps = {
  params: { id: string };
};

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: PageProps) {
  const ctx = await requireSession();
  const userId = params.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      discordId: true,
      role: true,
      additionalRoles: true,
      isApproved: true,
      isBlocked: true,
      banReason: true,
      unbanDate: true,
      isFrozen: true,
      frozenReason: true,
      cardNumber: true,
      createdAt: true,
      lastSeenAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  type AggregatedStats = {
    totalEntries: number;
    totalQuantity: number;
    totalAmount: number;
    alcoQuantity: number;
    alcoAmount: number;
    petraQuantity: number;
    petraAmount: number;
  };

  const entryStatsRaw = await prisma.entry.groupBy({
    by: ["type"],
    where: { submitterId: userId },
    _sum: { quantity: true, amount: true },
    _count: { _all: true },
  });

  const [recentEntries, recentRequests] = await Promise.all([
    prisma.entry.findMany({
      where: { submitterId: userId },
      orderBy: { date: "desc" },
      take: 6,
      select: {
        id: true,
        date: true,
        type: true,
        stars: true,
        quantity: true,
        amount: true,
        paymentStatus: true,
      },
    }),
    prisma.entryRequest.findMany({
      where: { submitterId: userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        date: true,
        type: true,
        stars1Qty: true,
        stars2Qty: true,
        stars3Qty: true,
        totalAmount: true,
        status: true,
        decisionNote: true,
        decidedAt: true,
        decidedBy: {
          select: {
            id: true,
            name: true,
            role: true,
            additionalRoles: true,
          },
        },
      },
    }),
  ]);

  const entryStats = entryStatsRaw as unknown as any[];

  const totalStats: AggregatedStats = entryStats.reduce(
    (acc: AggregatedStats, s: any) => {
      const qty = s._sum.quantity ?? 0;
      const amount = s._sum.amount ?? 0;
      acc.totalQuantity += qty;
      acc.totalAmount += amount;
      if (s.type === "ALCO") {
        acc.alcoQuantity += qty;
        acc.alcoAmount += amount;
      } else if (s.type === "PETRA") {
        acc.petraQuantity += qty;
        acc.petraAmount += amount;
      }
      acc.totalEntries += s._count._all;
      return acc;
    },
    {
      totalEntries: 0,
      totalQuantity: 0,
      totalAmount: 0,
      alcoQuantity: 0,
      alcoAmount: 0,
      petraQuantity: 0,
      petraAmount: 0,
    }
  );

  const viewer = {
    id: ctx.userId,
    role: ctx.role,
  };

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
        <UserProfileClient
          user={JSON.parse(JSON.stringify(user))}
          stats={totalStats}
          recentEntries={JSON.parse(JSON.stringify(recentEntries))}
          recentRequests={JSON.parse(JSON.stringify(recentRequests))}
          viewer={viewer}
        />
      </div>
    </main>
  );
}

