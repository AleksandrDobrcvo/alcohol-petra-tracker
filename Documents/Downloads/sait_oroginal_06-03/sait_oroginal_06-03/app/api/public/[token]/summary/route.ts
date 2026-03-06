import { prisma } from "@/src/server/prisma";
import { jsonError, jsonOk } from "@/src/server/http";
import { hashPublicToken } from "@/src/server/publicToken";
import { ApiError } from "@/src/server/errors";

export async function GET(_req: Request, ctx2: { params: { token: string } }) {
  try {
    const rawToken = ctx2.params.token;
    const tokenHash = hashPublicToken(rawToken);

    const token = await prisma.publicViewToken.findUnique({ where: { tokenHash } });
    if (!token || token.isRevoked) {
      throw new ApiError(404, "PUBLIC_TOKEN_INVALID", "Public link not found");
    }

    const byUser = await prisma.entry.groupBy({
      by: ["submitterId"],
      _sum: { quantity: true, amount: true },
    });

    const users = await prisma.user.findMany({
      where: { id: { in: byUser.map((x) => x.submitterId) } },
      select: { id: true, name: true },
    });

    const userNameById = new Map(users.map((u) => [u.id, u.name]));
    const summary = byUser.map((x) => ({
      submitterId: x.submitterId,
      name: userNameById.get(x.submitterId) ?? "Unknown",
      quantity: x._sum.quantity ?? 0,
      amount: x._sum.amount ?? "0",
    }));

    return jsonOk({ summary });
  } catch (e) {
    return jsonError(e);
  }
}

