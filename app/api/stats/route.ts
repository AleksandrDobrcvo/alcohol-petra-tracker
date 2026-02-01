import { prisma } from "@/src/server/prisma";
import { jsonOk } from "@/src/server/http";

export async function GET() {
  try {
    // Get online users (active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineCount = await (prisma.user as any).count({
      where: {
        lastSeenAt: { gte: fiveMinutesAgo }
      }
    });

    // Get top contributors (sum of entries by user)
    const topContributors = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.role,
        COALESCE(SUM(e.quantity), 0)::int as "totalQuantity",
        COALESCE(SUM(e.amount), 0)::float as "totalAmount",
        COUNT(e.id)::int as "entryCount"
      FROM "User" u
      LEFT JOIN "Entry" e ON e."submitterId" = u.id
      WHERE u."isApproved" = true AND u."isBlocked" = false
      GROUP BY u.id, u.name, u.role
      HAVING COALESCE(SUM(e.quantity), 0) > 0
      ORDER BY "totalAmount" DESC
      LIMIT 10
    ` as any[];

    return jsonOk({ 
      onlineCount,
      topContributors: topContributors.map(c => ({
        id: c.id,
        name: c.name,
        role: c.role,
        totalQuantity: c.totalQuantity,
        totalAmount: c.totalAmount,
        entryCount: c.entryCount
      }))
    });
  } catch (e) {
    console.error("Stats error:", e);
    return jsonOk({ onlineCount: 0, topContributors: [] });
  }
}
