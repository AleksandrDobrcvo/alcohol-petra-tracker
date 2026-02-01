import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/src/server/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, account, profile, trigger }) {
      // On first sign-in, profile/account are available
      const discordId =
        (profile as { id?: string } | null)?.id ?? (account?.providerAccountId ?? null);

      // ALWAYS refresh user data from DB (not just on sign-in)
      const lookupId = discordId || (token.discordId as string);
      if (lookupId) {
        const name =
          (profile as { username?: string; global_name?: string } | null)?.global_name ??
          (profile as { username?: string } | null)?.username ??
          token.name ??
          "Unknown";

        const ROOT_ID = "1223246458975686750";
        const isOwner = process.env.OWNER_DISCORD_ID
          ? process.env.OWNER_DISCORD_ID === lookupId || lookupId === ROOT_ID
          : lookupId === ROOT_ID;

        const existing = await prisma.user.findUnique({ where: { discordId: lookupId } });
        
        // Note: Removed auto-upgrade to LEADER - roles are now managed manually via admin panel

        const shouldBootstrapOwner =
          process.env.NODE_ENV === "development" &&
          !isOwner &&
          !existing &&
          !(await prisma.user.findFirst({ where: { role: "LEADER" } }));

        const user =
          existing ??
          (await prisma.user.create({
            data: {
              discordId: lookupId,
              name: String(name),
              role: isOwner || shouldBootstrapOwner ? "LEADER" : "MEMBER",
              isBlocked: false,
              isApproved: isOwner || shouldBootstrapOwner,
            },
          }));

        // Update lastSeenAt (throttled - only if more than 1 minute since last update)
        const now = new Date();
        const lastSeen = (user as any).lastSeenAt as Date | null;
        if (!lastSeen || now.getTime() - lastSeen.getTime() > 60000) {
          await (prisma.user as any).update({
            where: { id: user.id },
            data: { lastSeenAt: now }
          }).catch(() => {}); // Silently fail if DB is slow
        }

        if (user.isBlocked) {
          // Soft fail: session will be rejected via signIn callback
          token.isBlocked = true;
        }

        token.discordId = lookupId; // Store for future updates
        token.userId = user.id;
        token.role = user.role;
        token.isBlocked = user.isBlocked;
        token.banReason = (user as any).banReason ?? null;
        token.unbanDate = (user as any).unbanDate ? (user as any).unbanDate.toISOString() : null;
        token.isApproved = user.isApproved;
        token.moderatesAlco = (user as any).moderatesAlco ?? false;
        token.moderatesPetra = (user as any).moderatesPetra ?? false;
        token.additionalRoles = (user as any).additionalRoles ?? [];
        token.isFrozen = (user as any).isFrozen ?? false;
        token.frozenReason = (user as any).frozenReason ?? null;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      // Use token data directly (no DB lookup - faster, no timeouts)
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        (session.user as any).discordId = token.discordId as string;
        session.user.role = (token.role as any) ?? "MEMBER";
        session.user.isBlocked = Boolean(token.isBlocked);
        session.user.banReason = ((token as any).banReason as string | null | undefined) ?? null;
        session.user.unbanDate = ((token as any).unbanDate as string | null | undefined) ?? null;
        session.user.isApproved = Boolean(token.isApproved);
        session.user.moderatesAlco = Boolean((token as any).moderatesAlco);
        session.user.moderatesPetra = Boolean((token as any).moderatesPetra);
        session.user.additionalRoles = ((token as any).additionalRoles as string[]) ?? [];
        session.user.isFrozen = Boolean((token as any).isFrozen);
        session.user.frozenReason = ((token as any).frozenReason as string | null | undefined) ?? null;
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
    async signIn({ account, profile }) {
      const discordId =
        (profile as { id?: string } | null)?.id ?? (account?.providerAccountId ?? null);
      if (!discordId) return false;

      // We allow sign in even if blocked, so we can show a "Banned" screen with details
      return true;
    },
    async redirect({ url, baseUrl }) {
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) return url;
        return baseUrl;
      } catch {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        return baseUrl;
      }
    },
  },
};

