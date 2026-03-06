import { prisma } from "@/src/server/prisma";

function toJsonStringOrNull(v: unknown) {
  if (v === undefined || v === null) return null;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export async function writeAuditLog(args: {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: args.actorUserId,
      action: args.action as any,
      targetType: args.targetType,
      targetId: args.targetId,
      before: toJsonStringOrNull(args.before) as any,
      after: toJsonStringOrNull(args.after) as any,
    },
  });
}

