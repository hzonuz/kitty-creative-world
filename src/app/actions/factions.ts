"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const motto = String(formData.get("motto") ?? "").trim() || null;
  const alignment = String(formData.get("alignment") ?? "").trim() || null;
  return { name, description, motto, alignment };
}

export async function createFaction(worldId: string, formData: FormData) {
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");
  const banner = formData.get("banner") as File | null;
  let bannerPath: string | null = null;
  if (banner && banner.size > 0) bannerPath = await saveUpload(banner, "banners");

  const f = await prisma.faction.create({
    data: { worldId, ...data, banner: bannerPath },
  });

  revalidatePath(`/worlds/${worldId}/factions`);
  redirect(`/worlds/${worldId}/factions/${f.id}`);
}

export async function updateFaction(
  worldId: string,
  id: string,
  formData: FormData,
) {
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");
  const banner = formData.get("banner") as File | null;
  let bannerPath: string | undefined;
  if (banner && banner.size > 0) bannerPath = await saveUpload(banner, "banners");

  await prisma.faction.update({
    where: { id },
    data: { ...data, ...(bannerPath ? { banner: bannerPath } : {}) },
  });

  revalidatePath(`/worlds/${worldId}/factions`);
  revalidatePath(`/worlds/${worldId}/factions/${id}`);
  redirect(`/worlds/${worldId}/factions/${id}`);
}

export async function deleteFaction(worldId: string, id: string) {
  await prisma.faction.delete({ where: { id } });
  revalidatePath(`/worlds/${worldId}/factions`);
}
