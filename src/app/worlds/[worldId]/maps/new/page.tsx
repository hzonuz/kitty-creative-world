import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { MapForm } from "@/components/maps/MapForm";
import { createMap } from "@/app/actions/maps";
import { tServer } from "@/lib/preferences";
import { requirePageEdit } from "@/lib/permissions";

export default async function NewMapPage({
  params,
}: {
  params: { worldId: string };
}) {
  await requirePageEdit(params.worldId);
  const [parents, regions] = await Promise.all([
    prisma.worldMap.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.region.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const action = createMap.bind(null, params.worldId);
  return (
    <>
      <PageHeader
        eyebrow={tServer("map.new.eyebrow")}
        title={tServer("map.new.title")}
      />
      <MapForm
        action={action}
        parentOptions={parents}
        regions={regions}
        cancelHref={`/worlds/${params.worldId}/maps`}
      />
    </>
  );
}
