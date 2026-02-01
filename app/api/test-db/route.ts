import { NextResponse } from "next/server";
import { prisma } from "@/src/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test database connection
    const userCount = await (prisma as any).user.count();
    const requestCount = await (prisma as any).entryRequest.count();
    
    return NextResponse.json({ 
      ok: true,
      message: "Database connected",
      stats: {
        users: userCount,
        requests: requestCount,
      },
      dbUrl: process.env.DATABASE_URL ? "set" : "missing",
    });
  } catch (e) {
    console.error("[test-db] Error:", e);
    return NextResponse.json({ 
      ok: false,
      message: e instanceof Error ? e.message : "Unknown error",
      dbUrl: process.env.DATABASE_URL ? "set" : "missing",
    }, { status: 500 });
  }
}
