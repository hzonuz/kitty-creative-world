import { putImage } from "./storage";

/**
 * Upload an image into a world's namespace and return the resulting storage
 * object key (e.g. "worlds/<worldId>/covers/<file>.png"). The key is later
 * rendered with `assetUrl(key)` which produces "/api/files/<key>".
 */
export async function saveUpload(
  worldId: string,
  file: File,
  subfolder = "general",
): Promise<string> {
  if (!worldId) throw new Error("worldId is required for uploads");
  const { key } = await putImage(file, `worlds/${worldId}/${subfolder}`);
  return key;
}

/** Upload an avatar for a user. Keys live under `users/<userId>/avatar/...`. */
export async function saveAvatarUpload(
  userId: string,
  file: File,
): Promise<string> {
  if (!userId) throw new Error("userId is required for avatar uploads");
  const { key } = await putImage(file, `users/${userId}/avatar`);
  return key;
}
