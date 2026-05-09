import Link from "next/link";
import { ReactNode } from "react";
import { getTheme } from "@/lib/preferences";
import { tServer } from "@/lib/preferences";
import { SettingsMenu } from "./SettingsMenu";

export function AppShell({
  sidebar,
  children,
  topRight,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  topRight?: ReactNode;
}) {
  const theme = getTheme();
  const appName = tServer("app.name");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-shrink-0 border-e border-ink-700/70 bg-ink-900/60 px-4 py-6 backdrop-blur md:flex md:flex-col">
        <Link
          href="/"
          className="heading-display mb-6 flex items-center gap-2 text-lg"
        >
          <span className="text-rune-400">✦</span>
          {appName}
        </Link>
        {sidebar}
      </aside>
      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-700/70 bg-ink-900/70 px-6 py-3 backdrop-blur">
          <Link href="/" className="heading-display text-base md:hidden">
            ✦ {appName}
          </Link>
          <div className="ms-auto flex items-center gap-3">
            {topRight}
            <SettingsMenu theme={theme} />
          </div>
        </header>
        <div className="flex-1 px-6 py-6 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
