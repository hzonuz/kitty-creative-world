import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { RegionForm } from "@/components/regions/RegionForm";
import { updateRegion } from "@/app/actions/regions";
import { tServer } from "@/lib/preferences";
import { requirePageEdit } from "@/lib/permissions";

export default async function EditRegionPage({
  params,
}: {
  params: { worldId: string; regionId: string };
}) {
  await requirePageEdit(params.worldId);
  const [region, characters, factions] = await Promise.all([
    prisma.region.findUnique({
      where: { id: params.regionId },
      include: { factions: true },
    }),
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
  if (!region || region.worldId !== params.worldId) notFound();

  const action = updateRegion.bind(null, params.worldId, region.id);

  return (
    <>
      <PageHeader eyebrow={tServer("common.edit")} title={region.name} />
      <RegionForm
        action={action}
        values={{
          name: region.name,
          description: region.description,
          rulerId: region.rulerId,
          resources: region.resources,
          settlements: region.settlements,
          factionIds: region.factions.map((f) => f.factionId),
        }}
        characters={characters}
        factions={factions}
        cancelHref={`/worlds/${params.worldId}/regions/${region.id}`}
      />
    </>
  );
}
