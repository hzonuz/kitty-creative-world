"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";

export async function createWorld(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const cover = formData.get("coverImage") as File | null;

  if (!name) throw new Error("World name is required");

  let coverPath: string | null = null;
  if (cover && cover.size > 0) {
    coverPath = await saveUpload(cover, "covers");
  }

  const world = await prisma.world.create({
    data: {
      name,
      tagline,
      description,
      coverImage: coverPath,
    },
  });

  revalidatePath("/");
  redirect(`/worlds/${world.id}`);
}

export async function updateWorld(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const cover = formData.get("coverImage") as File | null;

  if (!name) throw new Error("World name is required");

  let coverPath: string | undefined;
  if (cover && cover.size > 0) {
    coverPath = await saveUpload(cover, "covers");
  }

  await prisma.world.update({
    where: { id },
    data: {
      name,
      tagline,
      description,
      ...(coverPath ? { coverImage: coverPath } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath(`/worlds/${id}`);
  redirect(`/worlds/${id}`);
}

export async function deleteWorld(id: string) {
  await prisma.world.delete({ where: { id } });
  revalidatePath("/");
}
