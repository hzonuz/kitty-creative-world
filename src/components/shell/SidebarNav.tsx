"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavItem = {
  href: string;
  label: string;
  icon?: string;
};

function activeHrefForPath(pathname: string, hrefs: string[]): string | null {
  const matches = hrefs.filter((href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (b.length > a.length ? b : a));
}

export function SidebarNav({
  items,
  title,
}: {
  items: NavItem[];
  title?: string;
}) {
  const pathname = usePathname();
  const activeHref = activeHrefForPath(
    pathname,
    items.map((i) => i.href),
  );

  return (
    <nav className="flex flex-col gap-1">
      {title ? (
        <div className="section-title mb-2 px-2">{title}</div>
      ) : null}
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-rune-500/10 text-rune-300 ring-1 ring-rune-500/30"
                : "text-parchment-100/80 hover:bg-ink-800/80 hover:text-parchment-50",
            )}
          >
            {item.icon ? (
              <span className="text-base leading-none opacity-80">
                {item.icon}
              </span>
            ) : null}
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
