import { ApiError } from "@/src/server/errors";
import type { AuthContext } from "@/src/server/auth";
import { prisma } from "@/src/server/prisma";

export interface Permission {
  action: string;
  resource: string;
  allowed: boolean;
}

export interface RolePermissions {
  [key: string]: boolean;
}

export async function getUserPermissions(userId: string): Promise<RolePermissions> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        additionalRoles: true
      }
    });
    
    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "User not found");
    }
    
    // Get user's primary role definition
    const primaryRole = await prisma.roleDefinition.findUnique({
      where: { name: user.role }
    });
    
    // Get additional role definitions
    const additionalRoles = await prisma.roleDefinition.findMany({
      where: { name: { in: user.additionalRoles } }
    });
    
    // Combine permissions from all roles
    const allRoles = [primaryRole, ...additionalRoles].filter(role => role !== null);
    
    let permissions: RolePermissions = {};
    
    for (const role of allRoles) {
      if (role) {
        const roleWithPerms = role as any;
        if (roleWithPerms.permissions) {
          const rolePerms = typeof roleWithPerms.permissions === 'string' ? JSON.parse(roleWithPerms.permissions) : roleWithPerms.permissions;
          permissions = { ...permissions, ...rolePerms };
        }
      }
    }
    
    return permissions;
  } catch (e) {
    console.error("Error fetching user permissions:", e);
    throw new ApiError(500, "PERMISSION_FETCH_ERROR", "Could not fetch user permissions");
  }
}

export async function checkPermission(ctx: AuthContext, permission: string): Promise<boolean> {
  const permissions = await getUserPermissions(ctx.userId);
  return permissions[permission] === true;
}

export async function assertPermissionOrThrow(ctx: AuthContext, permission: string) {
  const hasPermission = await checkPermission(ctx, permission);
  if (!hasPermission) {
    throw new ApiError(403, "FORBIDDEN", `Insufficient permissions for ${permission}`);
  }
}

export function assertRoleOrThrow(ctx: AuthContext, allowed: AuthContext['role'][]) {
  if (!allowed.includes(ctx.role)) {
    throw new ApiError(403, "FORBIDDEN", "Insufficient role-based permissions");
  }
}

export function assertOwner(ctx: AuthContext) {
  assertRoleOrThrow(ctx, ["LEADER"]);
}

export async function assertCanModerateOrThrow(ctx: AuthContext, type: "ALCO" | "PETRA") {
  // Check if user has moderation permission for this type
  const canModerate = await checkPermission(ctx, `moderate_${type.toLowerCase()}`);
  if (canModerate) return;
  
  // Fallback to legacy role checks
  if (ctx.role === "LEADER" || ctx.role === "DEPUTY" || ctx.role === "SENIOR") return;
  if (type === "ALCO" && (ctx.role === "ALCO_STAFF" || ctx.moderatesAlco)) return;
  if (type === "PETRA" && (ctx.role === "PETRA_STAFF" || ctx.moderatesPetra)) return;
  throw new ApiError(403, "FORBIDDEN", "Insufficient permissions to moderate");
}

// Specific permission checks
export async function canManageUsers(ctx: AuthContext): Promise<boolean> {
  return await checkPermission(ctx, 'manage_users');
}

export async function canManageRoles(ctx: AuthContext): Promise<boolean> {
  return await checkPermission(ctx, 'manage_roles');
}

export async function canManageRequests(ctx: AuthContext): Promise<boolean> {
  return await checkPermission(ctx, 'manage_requests');
}

export async function canDeleteEntries(ctx: AuthContext): Promise<boolean> {
  return await checkPermission(ctx, 'delete_entries');
}

export async function canBanUsers(ctx: AuthContext): Promise<boolean> {
  return await checkPermission(ctx, 'ban_users');
}


