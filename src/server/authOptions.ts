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

      // Refresh user data from DB on sign-in or when triggered
      if (discordId || trigger === "update") {
        const lookupId = discordId || (token.discordId as string);
        if (!lookupId) return token;
        
        const name =
          (profile as { username?: string; global_name?: string } | null)?.global_name ??
          (profile as { username?: string } | null)?.username ??
          token.name ??
          "Unknown";

        const isOwner = process.env.OWNER_DISCORD_ID
          ? process.env.OWNER_DISCORD_ID === lookupId
          : false;

        const existing = await prisma.user.findUnique({ where: { discordId: lookupId } });
        
        // If existing user's ID matches the owner ID, but role is not LEADER, fix it
        if (existing && isOwner && existing.role !== "LEADER") {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: "LEADER", isApproved: true },
          });
          existing.role = "LEADER";
          existing.isApproved = true;
        }

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

        if (user.isBlocked) {
          // Soft fail: session will be rejected via signIn callback
          token.isBlocked = true;
        }

        token.discordId = lookupId; // Store for future updates
        token.userId = user.id;
        token.role = user.role;
        token.isBlocked = user.isBlocked;
        token.isApproved = user.isApproved;
        token.moderatesAlco = (user as any).moderatesAlco ?? false;
        token.moderatesPetra = (user as any).moderatesPetra ?? false;
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
        session.user.role = (token.role as any) ?? "MEMBER";
        session.user.isBlocked = Boolean(token.isBlocked);
        session.user.isApproved = Boolean(token.isApproved);
        session.user.moderatesAlco = Boolean((token as any).moderatesAlco);
        session.user.moderatesPetra = Boolean((token as any).moderatesPetra);
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

      const user = await prisma.user.findUnique({ where: { discordId } });
      if (user?.isBlocked) return false;

      // Allow any Discord user to sign in; approval is checked later via requireSession
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

