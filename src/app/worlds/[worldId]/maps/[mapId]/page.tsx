import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeleteButton } from "@/components/shell/DeleteButton";
import { deleteMap } from "@/app/actions/maps";
import { MapViewerLazy } from "@/components/maps/MapViewerLazy";
import type { MapPinData, PinLink } from "@/components/maps/MapViewer";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function MapDetailPage({
  params,
}: {
  params: { worldId: string; mapId: string };
}) {
  const map = await prisma.worldMap.findUnique({
    where: { id: params.mapId },
    include: {
      pins: true,
      children: { orderBy: { name: "asc" } },
      parent: true,
      region: true,
    },
  });
  if (!map || map.worldId !== params.worldId) notFound();

  const [regions, characters, events, wikiPages, allMaps] = await Promise.all([
    prisma.region.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.character.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.timelineEvent.findMany({
      where: { worldId: params.worldId },
      orderBy: { year: "asc" },
      select: { id: true, title: true },
    }),
    prisma.wikiPage.findMany({
      where: { worldId: params.worldId },
      orderBy: { title: "asc" },
      select: { id: true, title: true, slug: true },
    }),
    prisma.worldMap.findMany({
      where: { worldId: params.worldId, NOT: { id: map.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const eventsForViewer = events.map((e) => ({ id: e.id, name: e.title }));
  const remove = deleteMap.bind(null, params.worldId, map.id);
  const base = `/worlds/${params.worldId}`;

  const regionMap = new Map(regions.map((r) => [r.id, r.name]));
  const characterMap = new Map(characters.map((c) => [c.id, c.name]));
  const eventMap = new Map(events.map((e) => [e.id, e.title]));
  const wikiMap = new Map(wikiPages.map((w) => [w.id, w]));
  const childMapNameMap = new Map(allMaps.map((m) => [m.id, m.name]));

  const enrichedPins: MapPinData[] = map.pins.map((p) => {
    const link = resolveLink(p, base, {
      regionMap,
      characterMap,
      eventMap,
      wikiMap,
      childMapNameMap,
    });
    return {
      id: p.id,
      label: p.label,
      x: p.x,
      y: p.y,
      color: p.color,
      icon: p.icon,
      linkType: p.linkType,
      regionId: p.regionId,
      characterId: p.characterId,
      eventId: p.eventId,
      wikiPageId: p.wikiPageId,
      childMapId: p.childMapId,
      link,
    };
  });

  const eyebrow = map.parent
    ? tServer("map.region.eyebrow.parent", { name: map.parent.name })
    : map.region
      ? tServer("map.region.eyebrow.region", { name: map.region.name })
      : tServer("map.region.eyebrow.default");

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={map.name}
        description={map.description ?? undefined}
        actions={
          <>
            <Link href={`${base}/maps/${map.id}/edit`} className="btn-ghost">
              {tServer("common.edit")}
            </Link>
            <DeleteButton
              action={remove}
              redirectTo={`${base}/maps`}
              confirmText={tServer("map.deleteConfirm", { name: map.name })}
            />
          </>
        }
      />

      <MapViewerLazy
        worldId={params.worldId}
        mapId={map.id}
        imagePath={map.imagePath}
        width={map.width}
        height={map.height}
        pins={enrichedPins}
        regions={regions}
        characters={characters}
        events={eventsForViewer}
        wikiPages={wikiPages}
        childMaps={allMaps}
      />

      {map.children.length > 0 ? (
        <div className="mt-6">
          <h2 className="heading-display mb-3 text-sm">{tServer("map.nested")}</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {map.children.map((c) => (
              <li key={c.id}>
                <Link
                  href={`${base}/maps/${c.id}`}
                  className="card card-hover flex flex-col px-4 py-3"
                >
                  <span className="font-display text-sm">{c.name}</span>
                  {c.description ? (
                    <span className="line-clamp-1 text-xs text-ink-400">
                      {c.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function resolveLink(
  p: {
    linkType: string;
    regionId: string | null;
    characterId: string | null;
    eventId: string | null;
    wikiPageId: string | null;
    childMapId: string | null;
  },
  base: string,
  maps: {
    regionMap: Map<string, string>;
    characterMap: Map<string, string>;
    eventMap: Map<string, string>;
    wikiMap: Map<string, { title: string; slug: string }>;
    childMapNameMap: Map<string, string>;
  },
): PinLink | null {
  switch (p.linkType) {
    case "region":
      if (!p.regionId) return null;
      return {
        type: "region",
        id: p.regionId,
        label: maps.regionMap.get(p.regionId) ?? "Region",
        href: `${base}/regions/${p.regionId}`,
      };
    case "character":
      if (!p.characterId) return null;
      return {
        type: "character",
        id: p.characterId,
        label: maps.characterMap.get(p.characterId) ?? "Character",
        href: `${base}/characters/${p.characterId}`,
      };
    case "event":
      if (!p.eventId) return null;
      return {
        type: "event",
        id: p.eventId,
        label: maps.eventMap.get(p.eventId) ?? "Event",
        href: `${base}/timeline/${p.eventId}`,
      };
    case "wiki":
      if (!p.wikiPageId) return null;
      const w = maps.wikiMap.get(p.wikiPageId);
      if (!w) return null;
      return {
        type: "wiki",
        id: p.wikiPageId,
        label: w.title,
        href: `${base}/wiki/${w.slug}`,
      };
    case "map":
      if (!p.childMapId) return null;
      return {
        type: "map",
        id: p.childMapId,
        label: maps.childMapNameMap.get(p.childMapId) ?? "Map",
        href: `${base}/maps/${p.childMapId}`,
      };
    default:
      return { type: "none" };
  }
}
