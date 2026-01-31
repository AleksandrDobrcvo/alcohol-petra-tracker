import { ApiError } from "@/src/server/errors";
import type { AuthContext } from "@/src/server/auth";

export function assertRoleOrThrow(ctx: AuthContext, allowed: AuthContext["role"][]) {
  if (!allowed.includes(ctx.role)) {
    throw new ApiError(403, "FORBIDDEN", "Insufficient permissions");
  }
}

export function assertOwner(ctx: AuthContext) {
  assertRoleOrThrow(ctx, ["LEADER"]);
}

export function assertCanModerateOrThrow(ctx: AuthContext, type: "ALCO" | "PETRA") {
  if (ctx.role === "LEADER" || ctx.role === "DEPUTY" || ctx.role === "SENIOR") return;
  if (type === "ALCO" && (ctx.role === "ALCO_STAFF" || ctx.moderatesAlco)) return;
  if (type === "PETRA" && (ctx.role === "PETRA_STAFF" || ctx.moderatesPetra)) return;
  throw new ApiError(403, "FORBIDDEN", "Insufficient permissions");
}

