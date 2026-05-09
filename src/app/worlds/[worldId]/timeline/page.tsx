import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { TimelineView } from "@/components/timeline/TimelineView";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function TimelinePage({
  params,
}: {
  params: { worldId: string };
}) {
  const [events, characters, regions, factions] = await Promise.all([
    prisma.timelineEvent.findMany({
      where: { worldId: params.worldId },
      include: {
        region: { select: { id: true, name: true } },
        faction: { select: { id: true, name: true } },
        characters: { select: { id: true, name: true } },
      },
      orderBy: [{ year: "asc" }],
    }),
    prisma.character.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.region.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.faction.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={tServer("timeline.eyebrow")}
        title={tServer("timeline.title")}
        description={tServer("timeline.description")}
        actions={
          <Link href={`/worlds/${params.worldId}/timeline/new`} className="btn-primary">
            {tServer("timeline.new")}
          </Link>
        }
      />

      {events.length === 0 ? (
        <EmptyState
          icon="⌛"
          title={tServer("timeline.empty.title")}
          description={tServer("timeline.empty.description")}
          action={
            <Link href={`/worlds/${params.worldId}/timeline/new`} className="btn-primary">
              {tServer("timeline.new")}
            </Link>
          }
        />
      ) : (
        <TimelineView
          worldId={params.worldId}
          events={events}
          characters={characters}
          regions={regions}
          factions={factions}
        />
      )}
    </>
  );
}
