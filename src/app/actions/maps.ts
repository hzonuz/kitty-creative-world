"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";

export async function createMap(worldId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const parentMapId =
    (String(formData.get("parentMapId") ?? "") || null) as string | null;
  const regionId = (String(formData.get("regionId") ?? "") || null) as string | null;
  const file = formData.get("image") as File | null;

  if (!name) throw new Error("Name is required");
  if (!file || file.size === 0) throw new Error("Map image is required");

  const imagePath = await saveUpload(file, "maps");

  // Read width/height from optional inputs (defaults below if missing).
  const width = numOr(formData.get("width"), 2000);
  const height = numOr(formData.get("height"), 1500);

  const map = await prisma.worldMap.create({
    data: {
      worldId,
      name,
      description,
      parentMapId,
      regionId,
      imagePath,
      width,
      height,
    },
  });

  revalidatePath(`/worlds/${worldId}/maps`);
  redirect(`/worlds/${worldId}/maps/${map.id}`);
}

export async function updateMap(
  worldId: string,
  id: string,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const parentMapId =
    (String(formData.get("parentMapId") ?? "") || null) as string | null;
  const regionId = (String(formData.get("regionId") ?? "") || null) as string | null;
  const file = formData.get("image") as File | null;
  const width = numOr(formData.get("width"), undefined);
  const height = numOr(formData.get("height"), undefined);

  let imagePath: string | undefined;
  if (file && file.size > 0) {
    imagePath = await saveUpload(file, "maps");
  }

  await prisma.worldMap.update({
    where: { id },
    data: {
      name,
      description,
      parentMapId,
      regionId,
      ...(imagePath ? { imagePath } : {}),
      ...(width != null ? { width } : {}),
      ...(height != null ? { height } : {}),
    },
  });

  revalidatePath(`/worlds/${worldId}/maps`);
  revalidatePath(`/worlds/${worldId}/maps/${id}`);
  redirect(`/worlds/${worldId}/maps/${id}`);
}

export async function deleteMap(worldId: string, id: string) {
  await prisma.worldMap.delete({ where: { id } });
  revalidatePath(`/worlds/${worldId}/maps`);
}

// ---- Pins ----
export async function createPin(
  worldId: string,
  mapId: string,
  data: {
    label: string;
    x: number;
    y: number;
    color?: string;
    icon?: string;
    linkType: string;
    regionId?: string | null;
    characterId?: string | null;
    eventId?: string | null;
    wikiPageId?: string | null;
    childMapId?: string | null;
  },
) {
  await prisma.mapPin.create({
    data: {
      mapId,
      label: data.label,
      x: data.x,
      y: data.y,
      color: data.color ?? null,
      icon: data.icon ?? null,
      linkType: data.linkType,
      regionId: data.regionId ?? null,
      characterId: data.characterId ?? null,
      eventId: data.eventId ?? null,
      wikiPageId: data.wikiPageId ?? null,
      childMapId: data.childMapId ?? null,
    },
  });
  revalidatePath(`/worlds/${worldId}/maps/${mapId}`);
}

export async function updatePin(
  worldId: string,
  mapId: string,
  pinId: string,
  data: Partial<{
    label: string;
    x: number;
    y: number;
    color: string | null;
    icon: string | null;
    linkType: string;
    regionId: string | null;
    characterId: string | null;
    eventId: string | null;
    wikiPageId: string | null;
    childMapId: string | null;
  }>,
) {
  await prisma.mapPin.update({ where: { id: pinId }, data });
  revalidatePath(`/worlds/${worldId}/maps/${mapId}`);
}

export async function deletePin(worldId: string, mapId: string, pinId: string) {
  await prisma.mapPin.delete({ where: { id: pinId } });
  revalidatePath(`/worlds/${worldId}/maps/${mapId}`);
}

function numOr(v: FormDataEntryValue | null, fallback: number | undefined) {
  if (v == null) return fallback;
  const s = String(v).trim();
  if (s === "") return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}
