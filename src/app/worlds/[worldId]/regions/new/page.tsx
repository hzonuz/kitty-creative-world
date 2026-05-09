import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { RegionForm } from "@/components/regions/RegionForm";
import { createRegion } from "@/app/actions/regions";
import { tServer } from "@/lib/preferences";

export default async function NewRegionPage({
  params,
}: {
  params: { worldId: string };
}) {
  const [characters, factions] = await Promise.all([
    prisma.character.findMany({
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

  const action = createRegion.bind(null, params.worldId);

  return (
    <>
      <PageHeader
        eyebrow={tServer("region.new.eyebrow")}
        title={tServer("region.new.title")}
        description={tServer("region.new.description")}
      />
      <RegionForm
        action={action}
        characters={characters}
        factions={factions}
        cancelHref={`/worlds/${params.worldId}/regions`}
      />
    </>
  );
}
