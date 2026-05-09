import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EventForm } from "@/components/timeline/EventForm";
import { updateEvent } from "@/app/actions/timeline";
import { tServer } from "@/lib/preferences";

export default async function EditEventPage({
  params,
}: {
  params: { worldId: string; eventId: string };
}) {
  const [event, regions, factions, characters] = await Promise.all([
    prisma.timelineEvent.findUnique({
      where: { id: params.eventId },
      include: { characters: { select: { id: true } } },
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
    prisma.character.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!event || event.worldId !== params.worldId) notFound();

  const action = updateEvent.bind(null, params.worldId, event.id);

  return (
    <>
      <PageHeader eyebrow={tServer("common.edit")} title={event.title} />
      <EventForm
        action={action}
        values={{
          title: event.title,
          description: event.description,
          year: event.year,
          monthDay: event.monthDay,
          era: event.era,
          category: event.category,
          regionId: event.regionId,
          factionId: event.factionId,
          characterIds: event.characters.map((c) => c.id),
        }}
        regions={regions}
        factions={factions}
        characters={characters}
        cancelHref={`/worlds/${params.worldId}/timeline/${event.id}`}
      />
    </>
  );
}
