import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/authOptions";
import { prisma } from "@/src/server/prisma";

export async function GET() {
  try {
    console.log("🔍 Auth debug endpoint called");

    // Check environment variables
    const envCheck = {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
    };

    // Check session
    const session = await getServerSession(authOptions);
    console.log("📋 Current session:", !!session);

    // Check database connection
    let dbStatus = "unknown";
    try {
      await prisma.user.count();
      dbStatus = "connected";
      console.log("✅ Database connected");
    } catch (err) {
      dbStatus = "error";
      console.error("❌ Database error:", err);
    }

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      session: {
        authenticated: !!session,
        user: session?.user ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        } : null,
      },
      database: dbStatus,
      nextauthUrl: process.env.NEXTAUTH_URL,
    });
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    return Response.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
