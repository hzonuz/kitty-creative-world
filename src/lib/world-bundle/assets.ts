import crypto from "node:crypto";
import type JSZip from "jszip";
import {
  ensureBucket,
  getObjectBuffer,
  putAssetPreserveKey,
  putObjectBuffer,
  guessMimeFromKey,
} from "@/lib/storage";

const KEY_REF = /worlds\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|gif|svg)/g;
const LEGACY_REF = /\/uploads\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|gif|svg)/g;
const API_REF = /\/api\/files\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|gif|svg)/g;

function normalizeKey(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/api/files/")) return value.slice("/api/files/".length);
  if (value.startsWith("/uploads/")) return value.slice(1); // strip leading slash
  if (value.startsWith("/")) return value.slice(1);
  return value;
}

/** Bundle path used inside the zip archive for an asset (always `assets/<key>`). */
export function assetZipPath(key: string): string {
  return `assets/${key}`;
}

export function collectKeyRefsFromText(text: string | null | undefined): string[] {
  if (!text) return [];
  const out = new Set<string>();
  for (const m of text.matchAll(KEY_REF)) out.add(m[0]);
  for (const m of text.matchAll(LEGACY_REF)) out.add(m[0].slice(1));
  for (const m of text.matchAll(API_REF)) out.add(m[0].slice("/api/files/".length));
  return [...out];
}

export function collectUploadPaths(bundle: {
  world: { coverImage: string | null };
  factions: { banner: string | null }[];
  characters: { portrait: string | null; biography: string | null; notes: string | null }[];
  maps: { imagePath: string; description: string | null }[];
  wikiPages: { content: string }[];
}): string[] {
  const keys = new Set<string>();

  const add = (raw: string | null | undefined) => {
    const k = normalizeKey(raw);
    if (k) keys.add(k);
  };

  add(bundle.world.coverImage);
  for (const f of bundle.factions) add(f.banner);
  for (const c of bundle.characters) {
    add(c.portrait);
    for (const p of collectKeyRefsFromText(c.biography)) keys.add(p);
    for (const p of collectKeyRefsFromText(c.notes)) keys.add(p);
  }
  for (const m of bundle.maps) {
    add(m.imagePath);
    for (const p of collectKeyRefsFromText(m.description)) keys.add(p);
  }
  for (const w of bundle.wikiPages) {
    for (const p of collectKeyRefsFromText(w.content)) keys.add(p);
  }

  return [...keys];
}

/** Read an asset by its storage key (or legacy path) from MinIO. */
export async function readAssetFromStorage(
  keyOrPath: string,
): Promise<Buffer | null> {
  await ensureBucket();
  const key = normalizeKey(keyOrPath);
  if (!key) return null;
  return getObjectBuffer(key);
}

/**
 * Re-key an asset onto a new world prefix so that storage keys never leak
 * cross-world. Returns the destination key under `worlds/<worldId>/...`.
 */
export async function rehomeAssetToWorld(
  sourceKey: string,
  data: Buffer,
  worldId: string,
): Promise<string> {
  await ensureBucket();
  const cleanSource = normalizeKey(sourceKey) ?? sourceKey;
  const tail = cleanSource.replace(/^worlds\/[^/]+\//, "");
  const target = tail.startsWith("worlds/")
    ? `worlds/${worldId}/${cleanSource}`
    : `worlds/${worldId}/${tail}`;

  const resolved = await putAssetPreserveKey(target, data);
  return resolved;
}

/**
 * Rewrite legacy `/uploads/...` and `/api/files/...` references inside text
 * to the new `/api/files/<remapped key>` form so wiki HTML stays valid.
 */
export function rewritePathsInText(
  text: string | null | undefined,
  pathMap: Map<string, string>,
): string | null {
  if (!text) return text ?? null;
  let out = text;
  for (const [from, to] of pathMap) {
    out = out.split(from).join(`/api/files/${to}`);
    out = out.split(`/${from}`).join(`/api/files/${to}`);
    out = out.split(`/api/files/${from}`).join(`/api/files/${to}`);
  }
  return out;
}

export function remapKey(
  value: string | null | undefined,
  pathMap: Map<string, string>,
): string | null {
  const key = normalizeKey(value);
  if (!key) return null;
  return pathMap.get(key) ?? key;
}

export async function importAssetsFromZip(
  zip: JSZip,
  assetKeys: string[],
  worldId: string,
): Promise<Map<string, string>> {
  const pathMap = new Map<string, string>();

  for (const key of assetKeys) {
    const entryPath = assetZipPath(key);
    let entry = zip.file(entryPath);
    if (!entry) {
      // Fallback for archives produced with legacy `/uploads/` prefix.
      entry = zip.file(`assets/${key}`) ?? zip.file(`assets/uploads/${key}`);
    }
    if (!entry) continue;

    const data = await entry.async("nodebuffer");
    const dest = await rehomeAssetToWorld(key, data, worldId);
    pathMap.set(key, dest);
  }

  return pathMap;
}

/**
 * Copy an arbitrary buffer into a world's storage namespace, preserving the
 * (key-style) basename. Used when exporting/seeding.
 */
export async function importBufferToWorld(
  key: string,
  data: Buffer,
  worldId: string,
): Promise<string> {
  const dest = await rehomeAssetToWorld(key, data, worldId);
  // Re-uploads use the basename mime guess.
  await putObjectBuffer(dest, data, guessMimeFromKey(dest));
  return dest;
}

// Kept for backwards-compat with older imports of this module.
export const remapPath = remapKey;
export const collectUploadPathsFromText = collectKeyRefsFromText;
export { normalizeKey as normalizeAssetKey };
// Hash helper retained in case future code paths need stable digests.
export function hashBuffer(buf: Buffer): string {
  return crypto.createHash("sha1").update(buf).digest("hex");
}
