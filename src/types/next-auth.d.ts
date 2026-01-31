import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "LEADER" | "DEPUTY" | "SENIOR" | "ALCO_STAFF" | "PETRA_STAFF" | "MEMBER";
      isBlocked: boolean;
      isApproved: boolean;
      moderatesAlco: boolean;
      moderatesPetra: boolean;
      isFrozen: boolean;
      frozenReason?: string | null;
    };
  }
}

