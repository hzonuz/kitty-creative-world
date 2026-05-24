import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "./SidebarNav";
import { tServer } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/auth";

export async function RootSidebar() {
  const user = await getCurrentUser();
  const worlds = user
    ? await prisma.world.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            { memberships: { some: { userId: user.id } } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true },
        take: 30,
      })
    : [];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SidebarNav
        title={tServer("nav.workspace")}
        items={[{ href: "/", label: tServer("nav.allWorlds"), icon: "✦" }]}
      />
      <div>
        <div className="section-title mb-2 flex items-center justify-between px-2">
          <span>{tServer("nav.worlds")}</span>
          <Link
            href="/worlds/new"
            className="text-rune-300 hover:text-rune-400"
            title={tServer("sidebar.createWorld")}
          >
            +
          </Link>
        </div>
        {worlds.length === 0 ? (
          <p className="px-2 text-xs text-ink-400">
            {tServer("sidebar.noWorlds")}
          </p>
        ) : (
          <SidebarNav
            items={worlds.map((w) => ({
              href: `/worlds/${w.id}`,
              label: w.name,
              icon: "🜨",
            }))}
          />
        )}
      </div>
    </div>
  );
}
