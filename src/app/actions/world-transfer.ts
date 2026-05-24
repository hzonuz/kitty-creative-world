"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { importWorldFromZip } from "@/lib/world-bundle";
import { requireUser } from "@/lib/auth";

const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024; // 100 MB

export async function importWorldArchive(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("archive") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Please choose a world archive (.kcworld.zip) to import.");
  }

  if (file.size > MAX_ARCHIVE_BYTES) {
    throw new Error("Archive is too large (max 100 MB).");
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".zip") && !name.endsWith(".kcworld.zip")) {
    throw new Error("File must be a .zip or .kcworld.zip archive.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let worldId: string;
  try {
    worldId = await importWorldFromZip(buffer, user.id);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Import failed unexpectedly.";
    throw new Error(message);
  }

  revalidatePath("/");
  redirect(`/worlds/${worldId}`);
}
