import { prisma } from "@/lib/prisma";
import type {
  WorldBundle,
  WorldRecord,
  RegionRecord,
  FactionRecord,
  RegionFactionRecord,
  CharacterRecord,
  TimelineEventRecord,
  WikiPageRecord,
  WikiLinkRecord,
  WorldMapRecord,
  MapPinRecord,
  FamilyTreeRecord,
  FamilyMemberRecord,
  FamilyEdgeRecord,
} from "./types";
import { BUNDLE_VERSION } from "./types";
import { sanitizeWorldBundle } from "./sanitize";

function iso(d: Date): string {
  return d.toISOString();
}

export async function fetchWorldBundle(worldId: string): Promise<WorldBundle> {
  const world = await prisma.world.findUnique({
    where: { id: worldId },
    include: {
      regions: {
        include: { factions: true },
      },
      factions: true,
      characters: {
        include: {
          events: { select: { id: true } },
          wikiLinks: { select: { id: true } },
        },
      },
      events: {
        include: {
          characters: { select: { id: true } },
          wikiLinks: { select: { id: true } },
        },
      },
      wikiPages: {
        include: {
          characters: { select: { id: true } },
          regions: { select: { id: true } },
          factions: { select: { id: true } },
          events: { select: { id: true } },
          outgoingLinks: true,
        },
      },
      maps: { include: { pins: true } },
      familyTrees: {
        include: {
          members: true,
          edges: true,
        },
      },
    },
  });

  if (!world) throw new Error("World not found");

  const worldRecord: WorldRecord = {
    id: world.id,
    name: world.name,
    tagline: world.tagline,
    description: world.description,
    coverImage: world.coverImage,
    createdAt: iso(world.createdAt),
    updatedAt: iso(world.updatedAt),
  };

  const regions: RegionRecord[] = world.regions.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    rulerId: r.rulerId,
    resources: r.resources,
    settlements: r.settlements,
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  }));

  const factions: FactionRecord[] = world.factions.map((f) => ({
    id: f.id,
    name: f.name,
    banner: f.banner,
    description: f.description,
    motto: f.motto,
    alignment: f.alignment,
    createdAt: iso(f.createdAt),
    updatedAt: iso(f.updatedAt),
  }));

  const regionFactions: RegionFactionRecord[] = [];
  for (const r of world.regions) {
    for (const rf of r.factions) {
      regionFactions.push({ regionId: rf.regionId, factionId: rf.factionId });
    }
  }

  const characters: CharacterRecord[] = world.characters.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    portrait: c.portrait,
    biography: c.biography,
    birthYear: c.birthYear,
    deathYear: c.deathYear,
    status: c.status,
    notes: c.notes,
    factionId: c.factionId,
    currentRegionId: c.currentRegionId,
    eventIds: c.events.map((e) => e.id),
    wikiPageIds: c.wikiLinks.map((w) => w.id),
    createdAt: iso(c.createdAt),
    updatedAt: iso(c.updatedAt),
  }));

  const timelineEvents: TimelineEventRecord[] = world.events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    year: e.year,
    monthDay: e.monthDay,
    era: e.era,
    category: e.category,
    regionId: e.regionId,
    factionId: e.factionId,
    characterIds: e.characters.map((c) => c.id),
    wikiPageIds: e.wikiLinks.map((w) => w.id),
    createdAt: iso(e.createdAt),
    updatedAt: iso(e.updatedAt),
  }));

  const wikiLinkSet = new Map<string, WikiLinkRecord>();
  const wikiPages: WikiPageRecord[] = world.wikiPages.map((w) => {
    for (const link of w.outgoingLinks) {
      wikiLinkSet.set(link.id, {
        id: link.id,
        fromId: link.fromId,
        toId: link.toId,
      });
    }
    return {
      id: w.id,
      title: w.title,
      slug: w.slug,
      category: w.category,
      tags: w.tags,
      content: w.content,
      characterIds: w.characters.map((c) => c.id),
      regionIds: w.regions.map((r) => r.id),
      factionIds: w.factions.map((f) => f.id),
      eventIds: w.events.map((e) => e.id),
      createdAt: iso(w.createdAt),
      updatedAt: iso(w.updatedAt),
    };
  });

  const maps: WorldMapRecord[] = world.maps.map((m) => ({
    id: m.id,
    parentMapId: m.parentMapId,
    regionId: m.regionId,
    name: m.name,
    description: m.description,
    imagePath: m.imagePath,
    width: m.width,
    height: m.height,
    createdAt: iso(m.createdAt),
    updatedAt: iso(m.updatedAt),
  }));

  const mapPins: MapPinRecord[] = world.maps.flatMap((m) =>
    m.pins.map((p) => ({
      id: p.id,
      mapId: p.mapId,
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
    })),
  );

  const familyTrees: FamilyTreeRecord[] = world.familyTrees.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    createdAt: iso(t.createdAt),
    updatedAt: iso(t.updatedAt),
  }));

  const familyMembers: FamilyMemberRecord[] = world.familyTrees.flatMap((t) =>
    t.members.map((m) => ({
      id: m.id,
      treeId: m.treeId,
      characterId: m.characterId,
      x: m.x,
      y: m.y,
    })),
  );

  const familyEdges: FamilyEdgeRecord[] = world.familyTrees.flatMap((t) =>
    t.edges.map((e) => ({
      id: e.id,
      treeId: e.treeId,
      fromId: e.fromId,
      toId: e.toId,
      type: e.type,
    })),
  );

  return sanitizeWorldBundle({
    version: BUNDLE_VERSION,
    world: worldRecord,
    regions,
    factions,
    regionFactions,
    characters,
    timelineEvents,
    wikiPages,
    wikiLinks: [...wikiLinkSet.values()],
    maps,
    mapPins,
    familyTrees,
    familyMembers,
    familyEdges,
  });
}
