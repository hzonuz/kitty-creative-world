export const WIKI_CATEGORIES = [
  "characters",
  "places",
  "factions",
  "religions",
  "items",
  "events",
  "magic",
  "lore",
] as const;

export type WikiCategory = (typeof WIKI_CATEGORIES)[number];

export function categoryLabel(c: string): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function parseTags(input: string | null | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
