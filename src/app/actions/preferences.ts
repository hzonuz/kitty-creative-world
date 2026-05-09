"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, type Locale } from "@/lib/i18n";
import {
  isTheme,
  type Theme,
  LOCALE_COOKIE,
  THEME_COOKIE,
} from "@/lib/preferences";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  cookies().set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  revalidatePath("/", "layout");
}

export async function setTheme(theme: Theme) {
  if (!isTheme(theme)) return;
  cookies().set(THEME_COOKIE, theme, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  revalidatePath("/", "layout");
}
