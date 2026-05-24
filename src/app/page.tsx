import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/AppShell";
import { RootSidebar } from "@/components/shell/RootSidebar";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { WorldImportForm } from "@/components/worlds/WorldImportForm";
import { tServer } from "@/lib/preferences";
import { assetUrl } from "@/lib/assetUrl";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const worlds = await prisma.world.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { memberships: { some: { userId: user.id } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          characters: true,
          regions: true,
          events: true,
          wikiPages: true,
        },
      },
      memberships: {
        where: { userId: user.id },
        select: { role: true },
      },
    },
  });

  return (
    <AppShell
      sidebar={<RootSidebar />}
      topRight={
        <Link href="/worlds/new" className="btn-primary">
          {tServer("worlds.newButton")}
        </Link>
      }
    >
      <PageHeader
        eyebrow={tServer("worlds.eyebrow")}
        title={tServer("worlds.title")}
        description={tServer("worlds.description")}
      />

      {worlds.length === 0 ? (
        <EmptyState
          icon="🜨"
          title={tServer("worlds.empty.title")}
          description={tServer("worlds.empty.description")}
          action={
            <Link href="/worlds/new" className="btn-primary">
              {tServer("worlds.empty.action")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {worlds.map((w) => {
            const role = w.ownerId === user.id ? "owner" : w.memberships[0]?.role.toLowerCase();
            return (
              <Link
                key={w.id}
                href={`/worlds/${w.id}`}
                className="card card-hover group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-800">
                  {w.coverImage ? (
                    <Image
                      src={assetUrl(w.coverImage) ?? ""}
                      alt={w.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-rune-gradient text-4xl text-rune-300/50">
                      ✦
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
                  <div className="absolute bottom-0 start-0 end-0 p-4">
                    <h3 className="heading-display text-xl">{w.name}</h3>
                    {w.tagline ? (
                      <p className="mt-0.5 text-xs text-parchment-100/80">
                        {w.tagline}
                      </p>
                    ) : null}
                  </div>
                  {role ? (
                    <span className="absolute end-3 top-3 rounded-full bg-ink-900/80 px-2 py-0.5 text-[10px] uppercase tracking-wider text-rune-200 backdrop-blur">
                      {role}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 px-4 py-3 text-xs text-ink-400">
                  <span className="chip">
                    {tServer("worlds.count.regions", { n: w._count.regions })}
                  </span>
                  <span className="chip">
                    {tServer("worlds.count.characters", {
                      n: w._count.characters,
                    })}
                  </span>
                  <span className="chip">
                    {tServer("worlds.count.events", { n: w._count.events })}
                  </span>
                  <span className="chip">
                    {tServer("worlds.count.wiki", { n: w._count.wikiPages })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-12 max-w-xl">
        <h2 className="section-title mb-4 px-1">
          {tServer("worlds.transfer.section")}
        </h2>
        <WorldImportForm
          labels={{
            title: tServer("world.transfer.import.title"),
            description: tServer("world.transfer.import.description"),
            fileLabel: tServer("world.transfer.import.file"),
            submit: tServer("world.transfer.import.submit"),
            submitting: tServer("world.transfer.import.submitting"),
            hint: tServer("world.transfer.import.hint"),
          }}
        />
      </div>
    </AppShell>
  );
}
