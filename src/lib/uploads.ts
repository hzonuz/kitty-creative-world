import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function saveUpload(file: File, subfolder = "general"): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const folder = path.join(UPLOADS_DIR, subfolder);
  await mkdir(folder, { recursive: true });

  const ext =
    {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
    }[file.type] ?? "bin";

  const id = crypto.randomBytes(8).toString("hex");
  const safe = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .slice(0, 40)
    .toLowerCase();
  const filename = `${Date.now()}-${id}-${safe || "file"}.${ext}`;
  const filepath = path.join(folder, filename);

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);

  return `/uploads/${subfolder}/${filename}`;
}
