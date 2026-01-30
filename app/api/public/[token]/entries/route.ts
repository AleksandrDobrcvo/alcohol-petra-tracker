import { prisma } from "@/src/server/prisma";
import { jsonError, jsonOk } from "@/src/server/http";
import { hashPublicToken } from "@/src/server/publicToken";
import { ApiError } from "@/src/server/errors";

export async function GET(req: Request, ctx2: { params: { token: string } }) {
  try {
    const rawToken = ctx2.params.token;
    const tokenHash = hashPublicToken(rawToken);

    const token = await prisma.publicViewToken.findUnique({ where: { tokenHash } });
    if (!token || token.isRevoked) {
      throw new ApiError(404, "PUBLIC_TOKEN_INVALID", "Public link not found");
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? undefined;
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;
    const paymentStatus = url.searchParams.get("paymentStatus") ?? undefined;

    const entries = await prisma.entry.findMany({
      where: {
        type: type === "ALCO" || type === "PETRA" ? type : undefined,
        paymentStatus:
          paymentStatus === "PAID" || paymentStatus === "UNPAID" ? paymentStatus : undefined,
        date:
          from || to
            ? {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(to) : undefined,
              }
            : undefined,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        submitter: { select: { id: true, name: true } },
      },
    });

    return jsonOk({ entries });
  } catch (e) {
    return jsonError(e);
  }
}

