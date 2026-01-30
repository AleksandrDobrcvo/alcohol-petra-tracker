import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "OWNER" | "ADMIN" | "VIEWER";
      isBlocked: boolean;
      isApproved: boolean;
      moderatesAlco: boolean;
      moderatesPetra: boolean;
      isFrozen: boolean;
      frozenReason?: string | null;
    };
  }
}

