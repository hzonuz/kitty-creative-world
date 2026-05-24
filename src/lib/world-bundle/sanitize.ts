import type { WorldBundle } from "./types";

export type BundleIdSets = {
  regionIds: Set<string>;
  factionIds: Set<string>;
  characterIds: Set<string>;
  eventIds: Set<string>;
  wikiIds: Set<string>;
  mapIds: Set<string>;
  treeIds: Set<string>;
  memberIds: Set<string>;
};

export function bundleIdSets(bundle: WorldBundle): BundleIdSets {
  const memberIds = new Set(bundle.familyMembers.map((m) => m.id));
  return {
    regionIds: new Set(bundle.regions.map((r) => r.id)),
    factionIds: new Set(bundle.factions.map((f) => f.id)),
    characterIds: new Set(bundle.characters.map((c) => c.id)),
    eventIds: new Set(bundle.timelineEvents.map((e) => e.id)),
    wikiIds: new Set(bundle.wikiPages.map((w) => w.id)),
    mapIds: new Set(bundle.maps.map((m) => m.id)),
    treeIds: new Set(bundle.familyTrees.map((t) => t.id)),
    memberIds,
  };
}

/** Drop references to entities that are not part of the bundle (stale DB rows). */
export function sanitizeWorldBundle(bundle: WorldBundle): WorldBundle {
  const ids = bundleIdSets(bundle);

  const pick = <T extends string | null | undefined>(
    value: T,
    allowed: Set<string>,
  ): T => {
    if (value == null || value === "") return value;
    return allowed.has(value) ? value : (null as T);
  };

  const filterIds = (list: string[], allowed: Set<string>) =>
    list.filter((id) => allowed.has(id));

  const regions = bundle.regions.map((r) => ({
    ...r,
    rulerId: pick(r.rulerId, ids.characterIds),
  }));

  const regionFactions = bundle.regionFactions.filter(
    (rf) => ids.regionIds.has(rf.regionId) && ids.factionIds.has(rf.factionId),
  );

  const characters = bundle.characters.map((c) => ({
    ...c,
    factionId: pick(c.factionId, ids.factionIds),
    currentRegionId: pick(c.currentRegionId, ids.regionIds),
    eventIds: filterIds(c.eventIds, ids.eventIds),
    wikiPageIds: filterIds(c.wikiPageIds, ids.wikiIds),
  }));

  const timelineEvents = bundle.timelineEvents.map((e) => ({
    ...e,
    regionId: pick(e.regionId, ids.regionIds),
    factionId: pick(e.factionId, ids.factionIds),
    characterIds: filterIds(e.characterIds, ids.characterIds),
    wikiPageIds: filterIds(e.wikiPageIds, ids.wikiIds),
  }));

  const wikiPages = bundle.wikiPages.map((w) => ({
    ...w,
    characterIds: filterIds(w.characterIds, ids.characterIds),
    regionIds: filterIds(w.regionIds, ids.regionIds),
    factionIds: filterIds(w.factionIds, ids.factionIds),
    eventIds: filterIds(w.eventIds, ids.eventIds),
  }));

  const wikiLinks = bundle.wikiLinks.filter(
    (l) => ids.wikiIds.has(l.fromId) && ids.wikiIds.has(l.toId),
  );

  const maps = bundle.maps.map((m) => ({
    ...m,
    parentMapId: pick(m.parentMapId, ids.mapIds),
    regionId: pick(m.regionId, ids.regionIds),
  }));

  const mapPins = bundle.mapPins
    .filter((p) => ids.mapIds.has(p.mapId))
    .map((p) => ({
      ...p,
      regionId: pick(p.regionId, ids.regionIds),
      characterId: pick(p.characterId, ids.characterIds),
      eventId: pick(p.eventId, ids.eventIds),
      wikiPageId: pick(p.wikiPageId, ids.wikiIds),
      childMapId: pick(p.childMapId, ids.mapIds),
    }));

  const familyMembers = bundle.familyMembers.filter(
    (m) => ids.treeIds.has(m.treeId) && ids.characterIds.has(m.characterId),
  );

  const memberIds = new Set(familyMembers.map((m) => m.id));

  const familyEdges = bundle.familyEdges.filter(
    (e) =>
      ids.treeIds.has(e.treeId) &&
      memberIds.has(e.fromId) &&
      memberIds.has(e.toId),
  );

  return {
    ...bundle,
    regions,
    regionFactions,
    characters,
    timelineEvents,
    wikiPages,
    wikiLinks,
    maps,
    mapPins,
    familyMembers,
    familyEdges,
  };
}
