"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { requireWorldAccess } from "@/lib/permissions";

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const motto = String(formData.get("motto") ?? "").trim() || null;
  const alignment = String(formData.get("alignment") ?? "").trim() || null;
  return { name, description, motto, alignment };
}

export async function createFaction(worldId: string, formData: FormData) {
  await requireWorldAccess(worldId, "editor");
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");
  const banner = formData.get("banner") as File | null;
  let bannerKey: string | null = null;
  if (banner && banner.size > 0) bannerKey = await saveUpload(worldId, banner, "banners");

  const f = await prisma.faction.create({
    data: { worldId, ...data, banner: bannerKey },
  });

  revalidatePath(`/worlds/${worldId}/factions`);
  redirect(`/worlds/${worldId}/factions/${f.id}`);
}

export async function updateFaction(
  worldId: string,
  id: string,
  formData: FormData,
) {
  await requireWorldAccess(worldId, "editor");
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");
  const banner = formData.get("banner") as File | null;
  let bannerKey: string | undefined;
  if (banner && banner.size > 0) bannerKey = await saveUpload(worldId, banner, "banners");

  await prisma.faction.update({
    where: { id },
    data: { ...data, ...(bannerKey ? { banner: bannerKey } : {}) },
  });

  revalidatePath(`/worlds/${worldId}/factions`);
  revalidatePath(`/worlds/${worldId}/factions/${id}`);
  redirect(`/worlds/${worldId}/factions/${id}`);
}

export async function deleteFaction(worldId: string, id: string) {
  await requireWorldAccess(worldId, "editor");
  await prisma.faction.delete({ where: { id } });
  revalidatePath(`/worlds/${worldId}/factions`);
}
