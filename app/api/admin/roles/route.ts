import { z } from "zod";
import { prisma } from "@/src/server/prisma";
import { requireSession } from "@/src/server/auth";
import { assertRoleOrThrow } from "@/src/server/rbac";
import { jsonError, jsonOk } from "@/src/server/http";

const roleSchema = z.object({
  name: z.string().min(2).max(20),
  label: z.string().min(2).max(30),
  emoji: z.string().default("👤"),
  color: z.string().default("from-sky-500/50 to-sky-600/50"),
  textColor: z.string().default("text-sky-400"),
  power: z.number().int().min(0).max(100).default(0),
  desc: z.string().optional(),
});

// Default roles to seed if database is empty
const DEFAULT_ROLES = [
  { name: "LEADER", label: "Лідер", emoji: "👑", color: "from-amber-500 to-yellow-500", textColor: "text-amber-400", power: 100 },
  { name: "DEPUTY", label: "Заступник", emoji: "⭐", color: "from-amber-400 to-orange-400", textColor: "text-orange-400", power: 80 },
  { name: "SENIOR", label: "Старший", emoji: "🛡️", color: "from-amber-500/50 to-amber-600/50", textColor: "text-amber-300", power: 60 },
  { name: "ALCO_STAFF", label: "Алко-персонал", emoji: "🍺", color: "from-emerald-500/50 to-emerald-600/50", textColor: "text-emerald-400", power: 40 },
  { name: "PETRA_STAFF", label: "Петра-персонал", emoji: "🌿", color: "from-emerald-500/50 to-teal-600/50", textColor: "text-teal-400", power: 40 },
  { name: "MEMBER", label: "Учасник", emoji: "✅", color: "from-sky-500/50 to-sky-600/50", textColor: "text-sky-400", power: 20 },
];

export async function GET() {
  try {
    // Allow all authenticated users to view roles (for UI display)
    await requireSession();

    let roles = await (prisma as any).roleDefinition.findMany({
      orderBy: { power: "desc" },
    });

    // Auto-seed default roles if none exist
    if (roles.length === 0) {
      for (const role of DEFAULT_ROLES) {
        await (prisma as any).roleDefinition.upsert({
          where: { name: role.name },
          update: role,
          create: role,
        });
      }
      roles = await (prisma as any).roleDefinition.findMany({
        orderBy: { power: "desc" },
      });
    }

    return jsonOk({ roles });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY"]);

    const body = roleSchema.parse(await req.json());

    const role = await (prisma as any).roleDefinition.upsert({
      where: { name: body.name },
      update: body,
      create: body,
    });

    return jsonOk({ role });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const ctx = await requireSession();
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY"]);

    const { name } = await req.json();
    if (!name) throw new Error("Name required");

    // Cannot delete core roles
    const coreRoles = ["LEADER", "DEPUTY", "SENIOR", "MEMBER"];
    if (coreRoles.includes(name)) {
      throw new Error("Cannot delete core roles");
    }

    await (prisma as any).roleDefinition.delete({
      where: { name },
    });

    return jsonOk({ success: true });
  } catch (e) {
    return jsonError(e);
  }
}
