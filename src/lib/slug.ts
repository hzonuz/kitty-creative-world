export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

export function formatYear(year: number, era?: string | null): string {
  if (year < 0) return `${Math.abs(year)} BC${era ? ` · ${era}` : ""}`;
  return `${year}${era ? ` · ${era}` : ""}`;
}
