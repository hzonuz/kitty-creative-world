import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EventForm } from "@/components/timeline/EventForm";
import { createEvent } from "@/app/actions/timeline";
import { tServer } from "@/lib/preferences";
import { requirePageEdit } from "@/lib/permissions";

export default async function NewEventPage({
  params,
}: {
  params: { worldId: string };
}) {
  await requirePageEdit(params.worldId);
  const [regions, factions, characters] = await Promise.all([
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

  const action = createEvent.bind(null, params.worldId);

  return (
    <>
      <PageHeader
        eyebrow={tServer("event.new.eyebrow")}
        title={tServer("event.new.title")}
      />
      <EventForm
        action={action}
        regions={regions}
        factions={factions}
        characters={characters}
        cancelHref={`/worlds/${params.worldId}/timeline`}
      />
    </>
  );
}
