"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createFamilyTree(worldId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) throw new Error("Name is required");

  const tree = await prisma.familyTree.create({
    data: { worldId, name, description },
  });
  revalidatePath(`/worlds/${worldId}/family`);
  redirect(`/worlds/${worldId}/family/${tree.id}`);
}

export async function updateFamilyTree(
  worldId: string,
  id: string,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) throw new Error("Name is required");

  await prisma.familyTree.update({ where: { id }, data: { name, description } });
  revalidatePath(`/worlds/${worldId}/family`);
  revalidatePath(`/worlds/${worldId}/family/${id}`);
  redirect(`/worlds/${worldId}/family/${id}`);
}

export async function deleteFamilyTree(worldId: string, id: string) {
  await prisma.familyTree.delete({ where: { id } });
  revalidatePath(`/worlds/${worldId}/family`);
}

export async function addFamilyMember(
  worldId: string,
  treeId: string,
  formData: FormData,
) {
  const characterId = String(formData.get("characterId") ?? "").trim();
  if (!characterId) throw new Error("Pick a character");
  await prisma.familyMember.upsert({
    where: { treeId_characterId: { treeId, characterId } },
    create: { treeId, characterId },
    update: {},
  });
  revalidatePath(`/worlds/${worldId}/family/${treeId}`);
}

export async function removeFamilyMember(
  worldId: string,
  treeId: string,
  memberId: string,
) {
  await prisma.familyMember.delete({ where: { id: memberId } });
  revalidatePath(`/worlds/${worldId}/family/${treeId}`);
}

export async function addFamilyEdge(
  worldId: string,
  treeId: string,
  formData: FormData,
) {
  const fromId = String(formData.get("fromId") ?? "").trim();
  const toId = String(formData.get("toId") ?? "").trim();
  const type = String(formData.get("type") ?? "parent").trim();
  if (!fromId || !toId) throw new Error("Both ends required");
  if (fromId === toId) throw new Error("Cannot link a person to themselves");
  await prisma.familyEdge.create({
    data: { treeId, fromId, toId, type },
  });
  revalidatePath(`/worlds/${worldId}/family/${treeId}`);
}

export async function removeFamilyEdge(
  worldId: string,
  treeId: string,
  edgeId: string,
) {
  await prisma.familyEdge.delete({ where: { id: edgeId } });
  revalidatePath(`/worlds/${worldId}/family/${treeId}`);
}

export async function updateMemberPosition(
  treeId: string,
  memberId: string,
  x: number,
  y: number,
) {
  await prisma.familyMember.update({
    where: { id: memberId },
    data: { x, y },
  });
  revalidatePath(`/worlds/${treeId}`); // not strictly required
}
