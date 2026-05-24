"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { requireUser } from "@/lib/auth";
import {
  parseRole,
  requireWorldAccess,
} from "@/lib/permissions";
import { WorldRole } from "@prisma/client";

export async function createWorld(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const cover = formData.get("coverImage") as File | null;

  if (!name) throw new Error("World name is required");

  const world = await prisma.world.create({
    data: {
      name,
      tagline,
      description,
      ownerId: user.id,
      memberships: {
        create: { userId: user.id, role: WorldRole.OWNER },
      },
    },
  });

  if (cover && cover.size > 0) {
    const coverKey = await saveUpload(world.id, cover, "covers");
    await prisma.world.update({
      where: { id: world.id },
      data: { coverImage: coverKey },
    });
  }

  revalidatePath("/");
  redirect(`/worlds/${world.id}`);
}

export async function updateWorld(id: string, formData: FormData) {
  await requireWorldAccess(id, "editor");
  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const cover = formData.get("coverImage") as File | null;

  if (!name) throw new Error("World name is required");

  let coverKey: string | undefined;
  if (cover && cover.size > 0) {
    coverKey = await saveUpload(id, cover, "covers");
  }

  await prisma.world.update({
    where: { id },
    data: {
      name,
      tagline,
      description,
      ...(coverKey ? { coverImage: coverKey } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath(`/worlds/${id}`);
  redirect(`/worlds/${id}`);
}

export async function deleteWorld(id: string) {
  const access = await requireWorldAccess(id, "owner");
  if (!access.isOwner) throw new Error("FORBIDDEN");
  await prisma.world.delete({ where: { id } });
  revalidatePath("/");
}

/** Add or update a user's role in a world. Only the owner may call this. */
export async function upsertMembership(
  worldId: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireWorldAccess(worldId, "owner");

  const identifier = String(formData.get("identifier") ?? "")
    .trim()
    .toLowerCase();
  const role = parseRole(formData.get("role"));
  if (!identifier) return { ok: false, error: "Username or email is required" };
  if (!role) return { ok: false, error: "Pick a role" };
  if (role === WorldRole.OWNER) {
    return { ok: false, error: "Use transfer ownership to change owners" };
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
    select: { id: true },
  });
  if (!user) return { ok: false, error: "No user matches that username or email" };

  const world = await prisma.world.findUnique({
    where: { id: worldId },
    select: { ownerId: true },
  });
  if (!world) return { ok: false, error: "World not found" };
  if (world.ownerId === user.id) {
    return { ok: false, error: "The owner already has full access" };
  }

  await prisma.worldMembership.upsert({
    where: { worldId_userId: { worldId, userId: user.id } },
    create: { worldId, userId: user.id, role },
    update: { role },
  });

  revalidatePath(`/worlds/${worldId}/members`);
  return { ok: true };
}

export async function removeMembership(worldId: string, userId: string) {
  await requireWorldAccess(worldId, "owner");
  await prisma.worldMembership.delete({
    where: { worldId_userId: { worldId, userId } },
  });
  revalidatePath(`/worlds/${worldId}/members`);
}
