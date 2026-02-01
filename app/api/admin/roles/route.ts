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

export async function GET() {
  try {
    const ctx = await requireSession();
    // Only leaders and deputies can manage roles
    assertRoleOrThrow(ctx, ["LEADER", "DEPUTY"]);

    const roles = await prisma.roleDefinition.findMany({
      orderBy: { power: "desc" },
    });

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

    const role = await prisma.roleDefinition.upsert({
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

    await prisma.roleDefinition.delete({
      where: { name },
    });

    return jsonOk({ success: true });
  } catch (e) {
    return jsonError(e);
  }
}
