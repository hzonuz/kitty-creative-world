/**
 * Convert a storage object key (e.g. "covers/foo.png") into a public URL that
 * the browser can load. We proxy all asset reads through a Next.js route so
 * that MinIO never needs to be publicly reachable.
 *
 * Historic local-disk paths starting with "/uploads/..." or absolute URLs are
 * passed through unchanged, which keeps legacy seed data and external images
 * working.
 */
export function assetUrl(
  keyOrPath: string | null | undefined,
): string | null {
  if (!keyOrPath) return null;
  if (keyOrPath.startsWith("http://") || keyOrPath.startsWith("https://")) {
    return keyOrPath;
  }
  if (keyOrPath.startsWith("/")) {
    return keyOrPath;
  }
  return `/api/files/${keyOrPath}`;
}

/** Strip the proxy prefix to recover the underlying storage key. */
export function urlToKey(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/api/files/")) return url.slice("/api/files/".length);
  if (url.startsWith("/uploads/")) return url.slice(1); // legacy: drop leading slash
  return null;
}
