"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "lore";
  const tags = String(formData.get("tags") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "");
  return { title, category, tags, content };
}

async function uniqueSlug(worldId: string, base: string, ignoreId?: string) {
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await prisma.wikiPage.findUnique({
      where: { worldId_slug: { worldId, slug } },
    });
    if (!existing || existing.id === ignoreId) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

export async function createWikiPage(worldId: string, formData: FormData) {
  const data = readForm(formData);
  if (!data.title) throw new Error("Title is required");
  const slug = await uniqueSlug(worldId, slugify(data.title));
  const page = await prisma.wikiPage.create({
    data: { worldId, ...data, slug },
  });
  revalidatePath(`/worlds/${worldId}/wiki`);
  redirect(`/worlds/${worldId}/wiki/${page.slug}`);
}

export async function updateWikiPage(
  worldId: string,
  id: string,
  formData: FormData,
) {
  const data = readForm(formData);
  if (!data.title) throw new Error("Title is required");
  const existing = await prisma.wikiPage.findUnique({ where: { id } });
  if (!existing) throw new Error("Page not found");

  let slug = existing.slug;
  if (existing.title !== data.title) {
    slug = await uniqueSlug(worldId, slugify(data.title), id);
  }

  await prisma.wikiPage.update({
    where: { id },
    data: { ...data, slug },
  });

  revalidatePath(`/worlds/${worldId}/wiki`);
  revalidatePath(`/worlds/${worldId}/wiki/${slug}`);
  redirect(`/worlds/${worldId}/wiki/${slug}`);
}

export async function deleteWikiPage(worldId: string, id: string) {
  await prisma.wikiPage.delete({ where: { id } });
  revalidatePath(`/worlds/${worldId}/wiki`);
}
