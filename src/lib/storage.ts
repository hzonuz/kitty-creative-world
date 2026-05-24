import { Client as MinioClient } from "minio";
import crypto from "node:crypto";

const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const ALLOWED_IMAGE_MIME = new Set(Object.keys(MIME_EXT));

const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

function readEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v == null || v === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function readEnvBool(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  return v === "1" || v.toLowerCase() === "true";
}

let cachedClient: MinioClient | null = null;
let bucketReady = false;

export function getStorageBucket(): string {
  return readEnv("S3_BUCKET", "world-builder");
}

export function getStorageClient(): MinioClient {
  if (cachedClient) return cachedClient;
  const endpoint = readEnv("S3_ENDPOINT", "minio");
  const port = Number(readEnv("S3_PORT", "9000"));
  const useSSL = readEnvBool("S3_USE_SSL", false);
  const accessKey = readEnv("S3_ACCESS_KEY", "minioadmin");
  const secretKey = readEnv("S3_SECRET_KEY", "minioadmin");
  const region = process.env.S3_REGION || "us-east-1";

  cachedClient = new MinioClient({
    endPoint: endpoint,
    port,
    useSSL,
    accessKey,
    secretKey,
    region,
  });
  return cachedClient;
}

/** Idempotently ensure the bucket exists. */
export async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  const client = getStorageClient();
  const bucket = getStorageBucket();
  const exists = await client.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await client.makeBucket(bucket, process.env.S3_REGION || "us-east-1");
  }
  bucketReady = true;
}

function sanitizeBaseName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .slice(0, 40)
    .toLowerCase();
}

function generateKey(subfolder: string, originalName: string, ext: string): string {
  const id = crypto.randomBytes(8).toString("hex");
  const safe = sanitizeBaseName(originalName) || "file";
  return `${subfolder}/${Date.now()}-${id}-${safe}.${ext}`;
}

export type UploadResult = {
  key: string;
  size: number;
  contentType: string;
};

export async function putImage(
  file: File,
  subfolder = "general",
): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  const ext = MIME_EXT[file.type] ?? "bin";
  const bytes = Buffer.from(await file.arrayBuffer());
  const key = generateKey(subfolder, file.name, ext);
  await putObjectBuffer(key, bytes, file.type);
  return { key, size: bytes.length, contentType: file.type };
}

export async function putObjectBuffer(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  await ensureBucket();
  const client = getStorageClient();
  await client.putObject(getStorageBucket(), key, data, data.length, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
}

/**
 * Store a raw asset preserving its key (used by world import).
 * If the key collides we try once with a hash suffix and return the new key.
 */
export async function putAssetPreserveKey(
  key: string,
  data: Buffer,
): Promise<string> {
  await ensureBucket();
  const client = getStorageClient();
  const bucket = getStorageBucket();
  const contentType = guessMimeFromKey(key);

  const exists = await objectExists(key);
  if (!exists) {
    await client.putObject(bucket, key, data, data.length, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    return key;
  }

  const id = crypto.randomBytes(6).toString("hex");
  const dot = key.lastIndexOf(".");
  const newKey =
    dot >= 0 ? `${key.slice(0, dot)}-import-${id}${key.slice(dot)}` : `${key}-import-${id}`;
  await client.putObject(bucket, newKey, data, data.length, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  return newKey;
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    const client = getStorageClient();
    await client.statObject(getStorageBucket(), key);
    return true;
  } catch {
    return false;
  }
}

export async function getObjectBuffer(key: string): Promise<Buffer | null> {
  try {
    await ensureBucket();
    const stream = await getStorageClient().getObject(getStorageBucket(), key);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}

export async function deleteObject(key: string): Promise<void> {
  try {
    await getStorageClient().removeObject(getStorageBucket(), key);
  } catch {
    // best-effort
  }
}

export function guessMimeFromKey(key: string): string {
  const dot = key.lastIndexOf(".");
  if (dot < 0) return "application/octet-stream";
  const ext = key.slice(dot + 1).toLowerCase();
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

export function isStorageKey(value: string | null | undefined): value is string {
  return typeof value === "string" && value.length > 0 && !value.startsWith("/") && !value.startsWith("http");
}
