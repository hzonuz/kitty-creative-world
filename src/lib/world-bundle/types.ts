/** Portable world archive format for Kitty Creative World (.kcworld.zip) */

export const BUNDLE_FORMAT = "kitty-creative-world" as const;
export const BUNDLE_VERSION = 1 as const;

export type BundleManifest = {
  format: typeof BUNDLE_FORMAT;
  formatVersion: typeof BUNDLE_VERSION;
  exportedAt: string;
  worldName: string;
  sourceWorldId: string;
};

export type WorldRecord = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegionRecord = {
  id: string;
  name: string;
  description: string | null;
  rulerId: string | null;
  resources: string | null;
  settlements: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FactionRecord = {
  id: string;
  name: string;
  banner: string | null;
  description: string | null;
  motto: string | null;
  alignment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegionFactionRecord = {
  regionId: string;
  factionId: string;
};

export type CharacterRecord = {
  id: string;
  name: string;
  title: string | null;
  portrait: string | null;
  biography: string | null;
  birthYear: number | null;
  deathYear: number | null;
  status: string | null;
  notes: string | null;
  factionId: string | null;
  currentRegionId: string | null;
  eventIds: string[];
  wikiPageIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type TimelineEventRecord = {
  id: string;
  title: string;
  description: string | null;
  year: number;
  monthDay: string | null;
  era: string | null;
  category: string | null;
  regionId: string | null;
  factionId: string | null;
  characterIds: string[];
  wikiPageIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type WikiPageRecord = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string | null;
  content: string;
  characterIds: string[];
  regionIds: string[];
  factionIds: string[];
  eventIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type WikiLinkRecord = {
  id: string;
  fromId: string;
  toId: string;
};

export type WorldMapRecord = {
  id: string;
  parentMapId: string | null;
  regionId: string | null;
  name: string;
  description: string | null;
  imagePath: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
};

export type MapPinRecord = {
  id: string;
  mapId: string;
  label: string;
  x: number;
  y: number;
  color: string | null;
  icon: string | null;
  linkType: string;
  regionId: string | null;
  characterId: string | null;
  eventId: string | null;
  wikiPageId: string | null;
  childMapId: string | null;
};

export type FamilyTreeRecord = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FamilyMemberRecord = {
  id: string;
  treeId: string;
  characterId: string;
  x: number | null;
  y: number | null;
};

export type FamilyEdgeRecord = {
  id: string;
  treeId: string;
  fromId: string;
  toId: string;
  type: string;
};

export type WorldBundle = {
  version: typeof BUNDLE_VERSION;
  world: WorldRecord;
  regions: RegionRecord[];
  factions: FactionRecord[];
  regionFactions: RegionFactionRecord[];
  characters: CharacterRecord[];
  timelineEvents: TimelineEventRecord[];
  wikiPages: WikiPageRecord[];
  wikiLinks: WikiLinkRecord[];
  maps: WorldMapRecord[];
  mapPins: MapPinRecord[];
  familyTrees: FamilyTreeRecord[];
  familyMembers: FamilyMemberRecord[];
  familyEdges: FamilyEdgeRecord[];
};
