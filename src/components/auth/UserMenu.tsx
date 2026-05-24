"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/cn";

export function UserMenu({
  displayName,
  username,
  email,
  labels,
}: {
  displayName: string;
  username: string;
  email: string;
  labels: {
    signOut: string;
    signedInAs: string;
  };
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

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

  const initials = (displayName || username)
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={cn(
          "flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800/60 px-2 py-1 text-sm transition-colors hover:border-rune-500",
        )}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rune-500/20 text-xs font-semibold text-rune-200">
          {initials || "👤"}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">
          {displayName || username}
        </span>
      </button>

      {open ? (
        <div className="absolute end-0 z-50 mt-2 w-64 rounded-lg border border-ink-700 bg-ink-900/95 p-3 shadow-glow backdrop-blur">
          <div className="mb-3 border-b border-ink-700/70 pb-3">
            <div className="text-xs uppercase tracking-wider text-ink-400">
              {labels.signedInAs}
            </div>
            <div className="mt-1 truncate font-medium text-parchment-50">
              {displayName || username}
            </div>
            <div className="truncate text-xs text-ink-400">{email}</div>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await signOut({ callbackUrl: "/auth/signin" });
              })
            }
            className="btn-ghost w-full justify-center"
          >
            {labels.signOut}
          </button>
        </div>
      ) : null}
    </div>
  );
}
