import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "LEADER" | "DEPUTY" | "SENIOR" | "ALCO_STAFF" | "PETRA_STAFF" | "MEMBER" | string;
      additionalRoles?: string[];
      isBlocked: boolean;
      banReason?: string | null;
      unbanDate?: string | null;
      isApproved: boolean;
      moderatesAlco: boolean;
      moderatesPetra: boolean;
      isFrozen: boolean;
      frozenReason?: string | null;
    };
  }
}

