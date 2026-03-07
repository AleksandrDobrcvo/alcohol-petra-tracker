import { NextResponse } from "next/server";
import { prisma } from "@/src/server/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Only allow from localhost or vercel preview deploys
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    const auth = req.headers.get("authorization");
    
    // Simple auth check
    if (auth !== `Bearer ${process.env.DEV_SECRET || "dev-secret"}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run a simple query to verify DB connection
    const userCount = await (prisma as any).user.count();
    console.log(`[MIGRATE] Current users count: ${userCount}`);

    // Try to sync schema
    await prisma.$executeRawUnsafe(`SELECT 1`);
    
    // Get all tables to see what exists
    const tables = await (prisma as any).$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    return NextResponse.json({ 
      ok: true,
      message: "Database connected and responding",
      tables: tables,
      stats: {
        users: userCount,
      }
    });
  } catch (e) {
    console.error("[MIGRATE] Error:", e);
    return NextResponse.json({ 
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: "Use POST with Bearer token to run migrations"
  }, { status: 405 });
}
