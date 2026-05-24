"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale, setTheme } from "@/app/actions/preferences";
import { useT, useLocale } from "@/components/i18n/I18nProvider";
import type { Theme } from "@/lib/preferences";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function SettingsMenu({ theme }: { theme: Theme }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function changeLocale(next: Locale) {
    if (next === locale) return setOpen(false);
    start(async () => {
      await setLocale(next);
      router.refresh();
    });
  }
  function changeTheme(next: Theme) {
    if (next === theme) return setOpen(false);
    start(async () => {
      await setTheme(next);
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn-ghost"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        title={t("settings.title")}
      >
        <span className="text-base leading-none">⚙</span>
        <span className="hidden sm:inline">{t("settings.title")}</span>
      </button>
      {open ? (
        <div className="absolute end-0 z-50 mt-2 w-72 rounded-lg border border-ink-700 bg-ink-900/95 p-3 shadow-glow backdrop-blur">
          <div className="mb-3">
            <div className="section-title mb-2">{t("settings.language")}</div>
            <div className="grid grid-cols-2 gap-2">
              <Pill
                active={locale === "en"}
                disabled={pending}
                onClick={() => changeLocale("en")}
              >
                {t("settings.lang.en")}
              </Pill>
              <Pill
                active={locale === "fa"}
                disabled={pending}
                onClick={() => changeLocale("fa")}
              >
                {t("settings.lang.fa")}
              </Pill>
            </div>
          </div>
          <div>
            <div className="section-title mb-2">{t("settings.theme")}</div>
            <div className="grid grid-cols-2 gap-2">
              <Pill
                active={theme === "ink"}
                disabled={pending}
                onClick={() => changeTheme("ink")}
              >
                <span className="me-1.5 text-rune-400">✦</span>
                {t("settings.theme.ink")}
              </Pill>
              <Pill
                active={theme === "dieselpunk"}
                disabled={pending}
                onClick={() => changeTheme("dieselpunk")}
              >
                <span className="me-1.5 text-ember-400">☀</span>
                {t("settings.theme.dieselpunk")}
              </Pill>
              <Pill
                active={theme === "cyberpunk"}
                disabled={pending}
                onClick={() => changeTheme("cyberpunk")}
              >
                <span className="me-1.5 text-rune-400">◇</span>
                {t("settings.theme.cyberpunk")}
              </Pill>
              <Pill
                active={theme === "steampunk"}
                disabled={pending}
                onClick={() => changeTheme("steampunk")}
              >
                <span className="me-1.5 text-moss-400">⚙</span>
                {t("settings.theme.steampunk")}
              </Pill>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Pill({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
        active
          ? "border-rune-500/60 bg-rune-500/10 text-rune-300"
          : "border-ink-700 bg-ink-800/60 text-parchment-50 hover:border-rune-500/40",
      )}
    >
      {children}
    </button>
  );
}
