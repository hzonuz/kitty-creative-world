import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { formatYear } from "@/lib/slug";
import { cn } from "@/lib/cn";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function WorldOverviewPage({
  params,
}: {
  params: { worldId: string };
}) {
  const world = await prisma.world.findUnique({
    where: { id: params.worldId },
    include: {
      _count: {
        select: {
          regions: true,
          characters: true,
          factions: true,
          events: true,
          wikiPages: true,
          maps: true,
          familyTrees: true,
        },
      },
    },
  });
  if (!world) notFound();

  const [recentCharacters, recentPlaces, recentEvents, recentWiki] =
    await Promise.all([
      prisma.character.findMany({
        where: { worldId: world.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.region.findMany({
        where: { worldId: world.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.timelineEvent.findMany({
        where: { worldId: world.id },
        orderBy: [{ year: "desc" }, { updatedAt: "desc" }],
        take: 6,
      }),
      prisma.wikiPage.findMany({
        where: { worldId: world.id },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
    ]);

  const base = `/worlds/${world.id}`;

  return (
    <>
      <div className="card relative mb-6 overflow-hidden">
        <div className="relative aspect-[16/5] w-full bg-ink-800">
          {world.coverImage ? (
            <Image
              src={world.coverImage}
              alt={world.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-rune-gradient" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/50 to-transparent" />
          <div className="absolute bottom-0 start-0 end-0 p-6">
            <div className="section-title">{tServer("world.section.world")}</div>
            <h1 className="heading-display mt-1 text-4xl">{world.name}</h1>
            {world.tagline ? (
              <p className="mt-1 text-parchment-100/90">{world.tagline}</p>
            ) : null}
          </div>
        </div>
        {world.description ? (
          <p className="px-6 py-4 text-sm text-parchment-100/80">
            {world.description}
          </p>
        ) : null}
      </div>

      <div className="mb-8 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr))]">
        <StatCard label={tServer("world.stat.regions")} value={world._count.regions} href={`${base}/regions`} />
        <StatCard label={tServer("world.stat.characters")} value={world._count.characters} href={`${base}/characters`} />
        <StatCard label={tServer("world.stat.factions")} value={world._count.factions} href={`${base}/factions`} />
        <StatCard label={tServer("world.stat.events")} value={world._count.events} href={`${base}/timeline`} />
        <StatCard label={tServer("world.stat.wiki")} value={world._count.wikiPages} href={`${base}/wiki`} />
        <StatCard label={tServer("world.stat.maps")} value={world._count.maps} href={`${base}/maps`} />
        <StatCard label={tServer("world.stat.familyTrees")} value={world._count.familyTrees} href={`${base}/family`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <RecentList
          className="lg:col-span-7"
          title={tServer("world.recent.characters")}
          href={`${base}/characters`}
          empty={tServer("world.empty.characters")}
          items={recentCharacters.map((c) => ({
            id: c.id,
            href: `${base}/characters/${c.id}`,
            primary: c.name,
            secondary: c.title ?? c.status ?? null,
          }))}
        />
        <RecentList
          className="lg:col-span-5"
          title={tServer("world.recent.places")}
          href={`${base}/regions`}
          empty={tServer("world.empty.regions")}
          items={recentPlaces.map((r) => ({
            id: r.id,
            href: `${base}/regions/${r.id}`,
            primary: r.name,
            secondary: r.description?.slice(0, 60) ?? null,
          }))}
        />
        <RecentList
          className="lg:col-span-6"
          title={tServer("world.recent.events")}
          href={`${base}/timeline`}
          empty={tServer("world.empty.events")}
          items={recentEvents.map((e) => ({
            id: e.id,
            href: `${base}/timeline/${e.id}`,
            primary: e.title,
            secondary: formatYear(e.year, e.era),
          }))}
        />
        <RecentList
          className="lg:col-span-6"
          title={tServer("world.recent.wiki")}
          href={`${base}/wiki`}
          empty={tServer("world.empty.wiki")}
          items={recentWiki.map((w) => ({
            id: w.id,
            href: `${base}/wiki/${w.slug}`,
            primary: w.title,
            secondary: w.category,
          }))}
        />
      </div>
    </>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="card card-hover flex min-w-0 flex-col items-start gap-1 px-4 py-3"
    >
      <div className="section-title hyphens-auto break-words">{label}</div>
      <div className="heading-display text-2xl tabular-nums text-rune-300">{value}</div>
    </Link>
  );
}

function RecentList({
  className,
  title,
  href,
  items,
  empty,
}: {
  className?: string;
  title: string;
  href: string;
  empty: string;
  items: { id: string; href: string; primary: string; secondary: string | null }[];
}) {
  return (
    <div className={cn("card min-w-0 overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-ink-700/60 px-5 py-3">
        <h2 className="heading-display text-sm">{title}</h2>
        <Link href={href} className="text-xs text-rune-300 hover:text-rune-400">
          {tServer("common.viewAll")}
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-ink-700/60">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex min-w-0 items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-ink-800/60"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-parchment-50">
                  {item.primary}
                </span>
                {item.secondary ? (
                  <span className="max-w-[40%] shrink-0 truncate text-xs text-ink-400 sm:max-w-[45%]">
                    {item.secondary}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
