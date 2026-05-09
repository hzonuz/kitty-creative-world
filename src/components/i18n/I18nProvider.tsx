"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import {
  DEFAULT_LOCALE,
  type Locale,
  type TFn,
  type TKey,
  type Vars,
  translate,
} from "@/lib/i18n";

type Ctx = { locale: Locale; t: TFn };

const I18nContext = createContext<Ctx>({
  locale: DEFAULT_LOCALE,
  t: (key) => key,
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t: TFn = useCallback(
    (key: TKey, vars?: Vars) => translate(locale, key, vars),
    [locale],
  );
  const value = useMemo(() => ({ locale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext).t;
}

export function useLocale() {
  return useContext(I18nContext).locale;
}
