import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { MapForm } from "@/components/maps/MapForm";
import { updateMap } from "@/app/actions/maps";
import { tServer } from "@/lib/preferences";
import { requirePageEdit } from "@/lib/permissions";

export default async function EditMapPage({
  params,
}: {
  params: { worldId: string; mapId: string };
}) {
  await requirePageEdit(params.worldId);
  const [map, parents, regions] = await Promise.all([
    prisma.worldMap.findUnique({ where: { id: params.mapId } }),
    prisma.worldMap.findMany({
      where: { worldId: params.worldId, NOT: { id: params.mapId } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.region.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!map || map.worldId !== params.worldId) notFound();
  const action = updateMap.bind(null, params.worldId, map.id);
  return (
    <>
      <PageHeader eyebrow={tServer("common.edit")} title={map.name} />
      <MapForm
        action={action}
        values={map}
        parentOptions={parents}
        regions={regions}
        cancelHref={`/worlds/${params.worldId}/maps/${map.id}`}
        requireImage={false}
      />
    </>
  );
}
