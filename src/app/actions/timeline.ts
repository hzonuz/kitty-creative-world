"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw === "" ? NaN : Number(yearRaw);
  const monthDay = String(formData.get("monthDay") ?? "").trim() || null;
  const era = String(formData.get("era") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const regionId = (String(formData.get("regionId") ?? "") || null) as string | null;
  const factionId = (String(formData.get("factionId") ?? "") || null) as string | null;
  const characterIds = formData.getAll("characterIds").map(String).filter(Boolean);
  return { title, description, year, monthDay, era, category, regionId, factionId, characterIds };
}

export async function createEvent(worldId: string, formData: FormData) {
  const data = readForm(formData);
  if (!data.title) throw new Error("Title is required");
  if (!Number.isFinite(data.year)) throw new Error("Year is required");

  const e = await prisma.timelineEvent.create({
    data: {
      worldId,
      title: data.title,
      description: data.description,
      year: data.year as number,
      monthDay: data.monthDay,
      era: data.era,
      category: data.category,
      regionId: data.regionId,
      factionId: data.factionId,
      characters: {
        connect: data.characterIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath(`/worlds/${worldId}/timeline`);
  redirect(`/worlds/${worldId}/timeline/${e.id}`);
}

export async function updateEvent(
  worldId: string,
  id: string,
  formData: FormData,
) {
  const data = readForm(formData);
  if (!data.title) throw new Error("Title is required");
  if (!Number.isFinite(data.year)) throw new Error("Year is required");

  await prisma.timelineEvent.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      year: data.year as number,
      monthDay: data.monthDay,
      era: data.era,
      category: data.category,
      regionId: data.regionId,
      factionId: data.factionId,
      characters: {
        set: data.characterIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath(`/worlds/${worldId}/timeline`);
  revalidatePath(`/worlds/${worldId}/timeline/${id}`);
  redirect(`/worlds/${worldId}/timeline/${id}`);
}

export async function deleteEvent(worldId: string, id: string) {
  await prisma.timelineEvent.delete({ where: { id } });
  revalidatePath(`/worlds/${worldId}/timeline`);
}
