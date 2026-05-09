import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  type Locale,
  isLocale,
  translate,
  type TKey,
  type Vars,
} from "./i18n";

export const LOCALE_COOKIE = "wb_locale";
export const THEME_COOKIE = "wb_theme";

export type Theme = "ink" | "desert" | "cyberpunk" | "steampunk";
export const THEMES: Theme[] = ["ink", "desert", "cyberpunk", "steampunk"];
export const DEFAULT_THEME: Theme = "ink";

export function isTheme(value: unknown): value is Theme {
  return (
    value === "ink" ||
    value === "desert" ||
    value === "cyberpunk" ||
    value === "steampunk"
  );
}

export function getLocale(): Locale {
  const c = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(c) ? c : DEFAULT_LOCALE;
}

export function getTheme(): Theme {
  const c = cookies().get(THEME_COOKIE)?.value;
  return isTheme(c) ? c : DEFAULT_THEME;
}

// Convenience translator for server components.
export function tServer(key: TKey, vars?: Vars): string {
  return translate(getLocale(), key, vars);
}
