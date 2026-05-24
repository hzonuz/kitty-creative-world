import { WorldRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser, type SessionUser } from "@/lib/auth";

/**
 * Strict ordering of roles. A user with a higher role automatically inherits
 * all rights of lower roles. Owner is the only role that can manage members,
 * delete the world, and transfer ownership.
 */
export const ROLE_RANK: Record<WorldRole, number> = {
  VIEWER: 1,
  COMMENTOR: 2,
  EDITOR: 3,
  OWNER: 4,
};

export type AccessLevel = "viewer" | "commentor" | "editor" | "owner";

const LEVEL_TO_ROLE: Record<AccessLevel, WorldRole> = {
  viewer: WorldRole.VIEWER,
  commentor: WorldRole.COMMENTOR,
  editor: WorldRole.EDITOR,
  owner: WorldRole.OWNER,
};

export type WorldAccess = {
  user: SessionUser;
  role: WorldRole;
  isOwner: boolean;
  canView: boolean;
  canComment: boolean;
  canEdit: boolean;
  canManage: boolean;
};

export function hasRole(actual: WorldRole, required: WorldRole): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

async function loadRole(
  worldId: string,
  userId: string,
): Promise<{ role: WorldRole; ownerId: string } | null> {
  const world = await prisma.world.findUnique({
    where: { id: worldId },
    select: { ownerId: true, isPublic: true },
  });
  if (!world) return null;
  if (world.ownerId === userId) return { role: WorldRole.OWNER, ownerId: world.ownerId };

  const membership = await prisma.worldMembership.findUnique({
    where: { worldId_userId: { worldId, userId } },
    select: { role: true },
  });
  if (membership) return { role: membership.role, ownerId: world.ownerId };
  if (world.isPublic) return { role: WorldRole.VIEWER, ownerId: world.ownerId };
  return null;
}

export async function getWorldAccess(
  worldId: string,
): Promise<WorldAccess | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const info = await loadRole(worldId, user.id);
  if (!info) return null;
  return toAccess(user, info.role, info.ownerId);
}

export async function requireWorldAccess(
  worldId: string,
  level: AccessLevel,
): Promise<WorldAccess> {
  const user = await requireUser();
  const info = await loadRole(worldId, user.id);
  if (!info) {
    throw new Error("FORBIDDEN");
  }
  if (!hasRole(info.role, LEVEL_TO_ROLE[level])) {
    throw new Error("FORBIDDEN");
  }
  return toAccess(user, info.role, info.ownerId);
}

function toAccess(
  user: SessionUser,
  role: WorldRole,
  ownerId: string,
): WorldAccess {
  return {
    user,
    role,
    isOwner: user.id === ownerId,
    canView: hasRole(role, WorldRole.VIEWER),
    canComment: hasRole(role, WorldRole.COMMENTOR),
    canEdit: hasRole(role, WorldRole.EDITOR),
    canManage: role === WorldRole.OWNER,
  };
}

/** Returns the ids of all worlds the current user can see. */
export async function listAccessibleWorldIds(userId: string): Promise<string[]> {
  const [owned, member] = await Promise.all([
    prisma.world.findMany({
      where: { ownerId: userId },
      select: { id: true },
    }),
    prisma.worldMembership.findMany({
      where: { userId },
      select: { worldId: true },
    }),
  ]);
  const ids = new Set<string>();
  for (const w of owned) ids.add(w.id);
  for (const m of member) ids.add(m.worldId);
  return [...ids];
}

export function describeRole(role: WorldRole): AccessLevel {
  switch (role) {
    case WorldRole.OWNER:
      return "owner";
    case WorldRole.EDITOR:
      return "editor";
    case WorldRole.COMMENTOR:
      return "commentor";
    case WorldRole.VIEWER:
    default:
      return "viewer";
  }
}

/**
 * Page-level helper. Returns the access record if the current user can edit,
 * otherwise throws a redirect to either signin or the world overview.
 */
export async function requirePageEdit(worldId: string): Promise<WorldAccess> {
  const access = await getWorldAccess(worldId);
  if (!access) {
    redirect(`/auth/signin?callbackUrl=/worlds/${worldId}`);
  }
  if (!access.canEdit) {
    redirect(`/worlds/${worldId}`);
  }
  return access;
}

export function parseRole(value: unknown): WorldRole | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  if (
    upper === WorldRole.VIEWER ||
    upper === WorldRole.COMMENTOR ||
    upper === WorldRole.EDITOR ||
    upper === WorldRole.OWNER
  ) {
    return upper as WorldRole;
  }
  return null;
}
