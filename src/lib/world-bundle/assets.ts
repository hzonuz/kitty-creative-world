import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type JSZip from "jszip";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const UPLOAD_REF = /\/uploads\/[a-zA-Z0-9_./-]+/g;

/** Public URL path → zip entry path */
export function assetZipPath(publicPath: string): string | null {
  if (!publicPath.startsWith("/uploads/")) return null;
  return `assets${publicPath}`;
}

export function collectUploadPathsFromText(text: string | null | undefined): string[] {
  if (!text) return [];
  const matches = text.match(UPLOAD_REF);
  return matches ? [...new Set(matches)] : [];
}

export function collectUploadPaths(bundle: {
  world: { coverImage: string | null };
  factions: { banner: string | null }[];
  characters: { portrait: string | null; biography: string | null; notes: string | null }[];
  maps: { imagePath: string; description: string | null }[];
  wikiPages: { content: string }[];
}): string[] {
  const paths = new Set<string>();

  const add = (p: string | null | undefined) => {
    if (p?.startsWith("/uploads/")) paths.add(p);
  };

  add(bundle.world.coverImage);
  for (const f of bundle.factions) add(f.banner);
  for (const c of bundle.characters) {
    add(c.portrait);
    for (const p of collectUploadPathsFromText(c.biography)) paths.add(p);
    for (const p of collectUploadPathsFromText(c.notes)) paths.add(p);
  }
  for (const m of bundle.maps) {
    add(m.imagePath);
    for (const p of collectUploadPathsFromText(m.description)) paths.add(p);
  }
  for (const w of bundle.wikiPages) {
    for (const p of collectUploadPathsFromText(w.content)) paths.add(p);
  }

  return [...paths];
}

export async function readAssetFromDisk(
  publicPath: string,
): Promise<Buffer | null> {
  if (!publicPath.startsWith("/uploads/")) return null;
  const rel = publicPath.replace(/^\/uploads\//, "");
  const filepath = path.join(UPLOADS_DIR, rel);
  try {
    return await readFile(filepath);
  } catch {
    return null;
  }
}

async function fileExists(filepath: string): Promise<boolean> {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
}

/** Write bytes to public/uploads, preserving path when free or generating a new name. */
export async function writeAssetToDisk(
  publicPath: string,
  data: Buffer,
): Promise<string> {
  if (!publicPath.startsWith("/uploads/")) return publicPath;

  const rel = publicPath.replace(/^\/uploads\//, "");
  const filepath = path.join(UPLOADS_DIR, rel);

  if (!(await fileExists(filepath))) {
    await mkdir(path.dirname(filepath), { recursive: true });
    await writeFile(filepath, data);
    return publicPath;
  }

  const parts = rel.split("/");
  const subfolder = parts.length > 1 ? parts.slice(0, -1).join("/") : "general";
  const base = path.basename(rel, path.extname(rel));
  const ext = path.extname(rel) || ".bin";
  const id = crypto.randomBytes(6).toString("hex");
  const filename = `${base}-import-${id}${ext}`;
  const destRel = `${subfolder}/${filename}`;
  const destPath = path.join(UPLOADS_DIR, destRel);
  await mkdir(path.dirname(destPath), { recursive: true });
  await writeFile(destPath, data);
  return `/uploads/${destRel}`;
}

export function rewritePathsInText(
  text: string | null | undefined,
  pathMap: Map<string, string>,
): string | null {
  if (!text) return text ?? null;
  let out = text;
  for (const [from, to] of pathMap) {
    if (from !== to) out = out.split(from).join(to);
  }
  return out;
}

export function remapPath(
  publicPath: string | null | undefined,
  pathMap: Map<string, string>,
): string | null {
  if (!publicPath) return null;
  return pathMap.get(publicPath) ?? publicPath;
}

export async function importAssetsFromZip(
  zip: JSZip,
  assetPaths: string[],
): Promise<Map<string, string>> {
  const pathMap = new Map<string, string>();

  for (const publicPath of assetPaths) {
    const zipPath = assetZipPath(publicPath);
    if (!zipPath) continue;

    const entry = zip.file(zipPath);
    if (!entry) continue;

    const data = await entry.async("nodebuffer");
    const dest = await writeAssetToDisk(publicPath, data);
    if (dest !== publicPath) pathMap.set(publicPath, dest);
  }

  return pathMap;
}
