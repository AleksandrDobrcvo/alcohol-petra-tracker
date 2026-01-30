import { NextResponse } from "next/server";
import { prisma } from "@/src/server/prisma";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev-only endpoint" }, { status: 403 });
  }

  try {
    const existing = await prisma.user.findFirst({ where: { role: "OWNER" } });
    if (existing) {
      return NextResponse.json({ ok: true, message: "Owner already exists", user: existing });
    }

    const owner = await prisma.user.create({
      data: {
        discordId: "dev-owner-12345",
        name: "Dev Owner",
        role: "OWNER",
        isBlocked: false,
        isApproved: true,
      },
    });

    return NextResponse.json({ ok: true, message: "Dev owner created", user: owner });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
