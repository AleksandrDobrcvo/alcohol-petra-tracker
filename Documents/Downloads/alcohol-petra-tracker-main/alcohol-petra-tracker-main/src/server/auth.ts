import { getServerSession } from "next-auth";
import { ApiError } from "@/src/server/errors";
import { authOptions } from "@/src/server/authOptions";

export type AuthContext = {
  userId: string;
  discordId: string;
  role: "LEADER" | "DEPUTY" | "SENIOR" | "ALCO_STAFF" | "PETRA_STAFF" | "MEMBER";
  moderatesAlco: boolean;
  moderatesPetra: boolean;
  isFrozen: boolean;
};

export async function requireSession(): Promise<AuthContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new ApiError(401, "UNAUTHENTICATED", "Sign-in required");
  }
  if (session.user.isBlocked) {
    throw new ApiError(403, "BLOCKED", "User is blocked");
  }
  if (!session.user.isApproved) {
    throw new ApiError(403, "NOT_APPROVED", "Access requires admin approval");
  }
  if (session.user.isFrozen) {
    throw new ApiError(403, "FROZEN", session.user.frozenReason ?? "Profile is frozen");
  }

  return {
    userId: session.user.id,
    discordId: (session.user as any).discordId || "",
    role: (session.user.role as any) || "MEMBER",
    moderatesAlco: session.user.moderatesAlco,
    moderatesPetra: session.user.moderatesPetra,
    isFrozen: session.user.isFrozen,
  };
}

