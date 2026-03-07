import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/src/server/prisma";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  throw new Error(
    "Discord OAuth is not configured: set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in your environment variables."
  );
}

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
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, account, profile, trigger }) {
      try {
        // On first sign-in, profile/account are available
        const discordId =
          (profile as { id?: string } | null)?.id ?? (account?.providerAccountId ?? null);

        console.log("🔐 JWT Callback - discordId:", discordId, "trigger:", trigger);

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

          console.log("👤 User lookup for:", lookupId, "isOwner:", isOwner);

          let existing = null;
          try {
            existing = await prisma.user.findUnique({ where: { discordId: lookupId } });
            console.log("✅ DB Query successful, user exists:", !!existing);
          } catch (dbError) {
            console.error("❌ Database error on user lookup:", dbError);
            throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : "Unknown error"}`);
          }
          
          // Note: Removed auto-upgrade to LEADER - roles are now managed manually via admin panel

          let shouldBootstrapOwner = false;
          if (!existing && !isOwner) {
            try {
              const leaderExists = await prisma.user.findFirst({ where: { role: "LEADER" } });
              shouldBootstrapOwner =
                process.env.NODE_ENV === "development" &&
                !leaderExists;
            } catch (err) {
              console.error("❌ Error checking leader existence:", err);
            }
          }

          let user = existing;
          
          if (!user) {
            try {
              console.log("📝 Creating new user:", lookupId, "name:", name);
              user = await prisma.user.create({
                data: {
                  discordId: lookupId,
                  name: String(name),
                  role: isOwner || shouldBootstrapOwner ? "LEADER" : "MEMBER",
                  isBlocked: false,
                  isApproved: isOwner || shouldBootstrapOwner,
                },
              });
              console.log("✅ User created successfully:", user.id);
            } catch (createError) {
              console.error("❌ Error creating user:", createError);
              throw new Error(`Failed to create user: ${createError instanceof Error ? createError.message : "Unknown error"}`);
            }
          }

          // Update lastSeenAt (throttled - only if more than 1 minute since last update)
          try {
            const now = new Date();
            const lastSeen = (user as any).lastSeenAt as Date | null;
            if (!lastSeen || now.getTime() - lastSeen.getTime() > 60000) {
              await (prisma.user as any).update({
                where: { id: user.id },
                data: { lastSeenAt: now }
              }).catch((err: any) => {
                console.warn("⚠️ Failed to update lastSeenAt:", err.message);
              });
            }
          } catch (err) {
            console.warn("⚠️ Error in lastSeenAt update:", err);
          }

          if (user.isBlocked) {
            // Soft fail: session will be rejected via signIn callback
            token.isBlocked = true;
            console.log("🚫 User is blocked");
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

          console.log("✅ JWT token populated successfully");
        } else {
          console.warn("⚠️ No discordId found in jwt callback");
        }

        return token;
      } catch (error) {
        console.error("❌ CRITICAL ERROR in JWT callback:", error);
        throw error;
      }
    },
    async session({ session, token }) {
      // Use token data directly (no DB lookup - faster, no timeouts)
      try {
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
          console.log("✅ Session created for user:", session.user.id);
        } else {
          console.warn("⚠️ Session callback: missing user or token.userId");
        }
        return session;
      } catch (error) {
        console.error("❌ Error in session callback:", error);
        throw error;
      }
    },
    async signIn({ account, profile }) {
      try {
        const discordId =
          (profile as { id?: string } | null)?.id ?? (account?.providerAccountId ?? null);
        
        console.log("🔑 SignIn callback - discordId:", discordId);
        
        if (!discordId) {
          console.error("❌ SignIn callback - No discordId found!");
          return false;
        }

        // We allow sign in even if blocked, so we can show a "Banned" screen with details
        console.log("✅ SignIn callback - allowed");
        return true;
      } catch (error) {
        console.error("❌ Error in signIn callback:", error);
        return false;
      }
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

