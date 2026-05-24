"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWorldAccess } from "@/lib/permissions";

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const rulerId = (String(formData.get("rulerId") ?? "") || null) as string | null;
  const resources = String(formData.get("resources") ?? "").trim() || null;
  const settlements = String(formData.get("settlements") ?? "").trim() || null;
  const factionIds = formData.getAll("factionIds").map(String).filter(Boolean);
  return { name, description, rulerId, resources, settlements, factionIds };
}

export async function createRegion(worldId: string, formData: FormData) {
  await requireWorldAccess(worldId, "editor");
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");

  const region = await prisma.region.create({
    data: {
      worldId,
      name: data.name,
      description: data.description,
      rulerId: data.rulerId,
      resources: data.resources,
      settlements: data.settlements,
      factions: {
        create: data.factionIds.map((factionId) => ({ factionId })),
      },
    },
  });

  revalidatePath(`/worlds/${worldId}/regions`);
  redirect(`/worlds/${worldId}/regions/${region.id}`);
}

export async function updateRegion(
  worldId: string,
  id: string,
  formData: FormData,
) {
  await requireWorldAccess(worldId, "editor");
  const data = readForm(formData);
  if (!data.name) throw new Error("Name is required");

  await prisma.$transaction([
    prisma.regionFaction.deleteMany({ where: { regionId: id } }),
    prisma.region.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        rulerId: data.rulerId,
        resources: data.resources,
        settlements: data.settlements,
        factions: {
          create: data.factionIds.map((factionId) => ({ factionId })),
        },
      },
    }),
  ]);

  revalidatePath(`/worlds/${worldId}/regions`);
  revalidatePath(`/worlds/${worldId}/regions/${id}`);
  redirect(`/worlds/${worldId}/regions/${id}`);
}

export async function deleteRegion(worldId: string, id: string) {
  await requireWorldAccess(worldId, "editor");
  await prisma.region.delete({ where: { id } });
  revalidatePath(`/worlds/${worldId}/regions`);
}
