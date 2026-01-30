import { ApiError } from "@/src/server/errors";
import type { AuthContext } from "@/src/server/auth";

export function assertRoleOrThrow(ctx: AuthContext, allowed: AuthContext["role"][]) {
  if (!allowed.includes(ctx.role)) {
    throw new ApiError(403, "FORBIDDEN", "Insufficient permissions");
  }
}

export function assertOwner(ctx: AuthContext) {
  assertRoleOrThrow(ctx, ["OWNER"]);
}

export function assertCanModerateOrThrow(ctx: AuthContext, type: "ALCO" | "PETRA") {
  if (ctx.role === "OWNER" || ctx.role === "ADMIN") return;
  if (type === "ALCO" && ctx.moderatesAlco) return;
  if (type === "PETRA" && ctx.moderatesPetra) return;
  throw new ApiError(403, "FORBIDDEN", "Insufficient permissions");
}

