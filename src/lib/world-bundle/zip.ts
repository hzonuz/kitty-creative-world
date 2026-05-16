import JSZip from "jszip";
import type { BundleManifest, WorldBundle } from "./types";
import {
  BUNDLE_FORMAT,
  BUNDLE_VERSION,
} from "./types";
import {
  assetZipPath,
  collectUploadPaths,
  readAssetFromDisk,
} from "./assets";

const MANIFEST_FILE = "manifest.json";
const DATA_FILE = "data.json";

export function slugifyFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "world";
}

export async function buildWorldZip(bundle: WorldBundle): Promise<Buffer> {
  const zip = new JSZip();

  const manifest: BundleManifest = {
    format: BUNDLE_FORMAT,
    formatVersion: BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    worldName: bundle.world.name,
    sourceWorldId: bundle.world.id,
  };

  zip.file(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  zip.file(DATA_FILE, JSON.stringify(bundle, null, 2));

  const assetPaths = collectUploadPaths(bundle);
  for (const publicPath of assetPaths) {
    const zipPath = assetZipPath(publicPath);
    if (!zipPath) continue;
    const data = await readAssetFromDisk(publicPath);
    if (data) zip.file(zipPath, data);
  }

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export async function parseWorldZip(buffer: Buffer): Promise<{
  manifest: BundleManifest;
  bundle: WorldBundle;
  zip: JSZip;
}> {
  const zip = await JSZip.loadAsync(buffer);

  const manifestFile = zip.file(MANIFEST_FILE);
  const dataFile = zip.file(DATA_FILE);
  if (!manifestFile || !dataFile) {
    throw new Error(
      "Invalid archive: missing manifest.json or data.json. Use a .kcworld.zip export from Kitty Creative World.",
    );
  }

  const manifest = JSON.parse(
    await manifestFile.async("string"),
  ) as BundleManifest;

  if (manifest.format !== BUNDLE_FORMAT) {
    throw new Error(
      `Unsupported archive format: ${manifest.format ?? "unknown"}`,
    );
  }
  if (manifest.formatVersion !== BUNDLE_VERSION) {
    throw new Error(
      `Unsupported archive version ${manifest.formatVersion}. This app supports version ${BUNDLE_VERSION}.`,
    );
  }

  const bundle = JSON.parse(await dataFile.async("string")) as WorldBundle;
  if (bundle.version !== BUNDLE_VERSION) {
    throw new Error(
      `Unsupported data version ${bundle.version}. Expected ${BUNDLE_VERSION}.`,
    );
  }
  if (!bundle.world?.name) {
    throw new Error("Invalid archive: world data is missing or corrupt.");
  }

  return { manifest, bundle, zip };
}
