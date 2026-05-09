import Link from "next/link";
import { SidebarNav } from "./SidebarNav";
import { tServer } from "@/lib/preferences";

export function WorldSidebar({
  worldId,
  worldName,
}: {
  worldId: string;
  worldName: string;
}) {
  const base = `/worlds/${worldId}`;
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Link href="/" className="px-2 text-xs text-ink-400 hover:text-rune-300">
        {tServer("nav.backToWorlds")}
      </Link>
      <div>
        <div className="section-title mb-2 px-2 truncate">{worldName}</div>
        <SidebarNav
          items={[
            { href: base, label: tServer("nav.overview"), icon: "✦" },
            { href: `${base}/regions`, label: tServer("nav.regions"), icon: "⛰" },
            { href: `${base}/maps`, label: tServer("nav.maps"), icon: "🗺" },
            { href: `${base}/characters`, label: tServer("nav.characters"), icon: "👤" },
            { href: `${base}/factions`, label: tServer("nav.factions"), icon: "⚔" },
            { href: `${base}/timeline`, label: tServer("nav.timeline"), icon: "⌛" },
            { href: `${base}/wiki`, label: tServer("nav.wiki"), icon: "📖" },
            { href: `${base}/family`, label: tServer("nav.familyTrees"), icon: "🌳" },
          ]}
        />
      </div>
    </div>
  );
}
