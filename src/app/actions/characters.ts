"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { requireWorldAccess } from "@/lib/permissions";

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  const biography = String(formData.get("biography") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const factionId = (String(formData.get("factionId") ?? "") || null) as string | null;
  const currentRegionId = (String(formData.get("currentRegionId") ?? "") || null) as string | null;
  const birthYear = numOrNull(formData.get("birthYear"));
  const deathYear = numOrNull(formData.get("deathYear"));
  return { name, title, biography, status, notes, factionId, currentRegionId, birthYear, deathYear };
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function createCharacter(worldId: string, formData: FormData) {
  await requireWorldAccess(worldId, "editor");
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");
  const portrait = formData.get("portrait") as File | null;
  let portraitKey: string | null = null;
  if (portrait && portrait.size > 0) {
    portraitKey = await saveUpload(worldId, portrait, "portraits");
  }

  const c = await prisma.character.create({
    data: {
      worldId,
      ...data,
      portrait: portraitKey,
    },
  });

  revalidatePath(`/worlds/${worldId}/characters`);
  redirect(`/worlds/${worldId}/characters/${c.id}`);
}

export async function updateCharacter(
  worldId: string,
  id: string,
  formData: FormData,
) {
  await requireWorldAccess(worldId, "editor");
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");
  const portrait = formData.get("portrait") as File | null;
  let portraitKey: string | undefined;
  if (portrait && portrait.size > 0) {
    portraitKey = await saveUpload(worldId, portrait, "portraits");
  }

  await prisma.character.update({
    where: { id },
    data: {
      ...data,
      ...(portraitKey ? { portrait: portraitKey } : {}),
    },
  });

  revalidatePath(`/worlds/${worldId}/characters`);
  revalidatePath(`/worlds/${worldId}/characters/${id}`);
  redirect(`/worlds/${worldId}/characters/${id}`);
}

export async function deleteCharacter(worldId: string, id: string) {
  await requireWorldAccess(worldId, "editor");
  await prisma.character.delete({ where: { id } });
  revalidatePath(`/worlds/${worldId}/characters`);
}
