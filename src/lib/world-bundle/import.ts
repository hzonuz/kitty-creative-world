import type JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import type { WorldBundle, WorldMapRecord } from "./types";
import {
  collectUploadPaths,
  importAssetsFromZip,
  remapKey,
  rewritePathsInText,
} from "./assets";
import { sanitizeWorldBundle } from "./sanitize";
import { WorldRole } from "@prisma/client";

class IdMap {
  private readonly map = new Map<string, string>();

  set(oldId: string, newId: string) {
    this.map.set(oldId, newId);
  }

  get(oldId: string): string {
    const v = this.map.get(oldId);
    if (!v) throw new Error(`Import failed: missing id mapping for ${oldId}`);
    return v;
  }

  lookup(oldId: string | null | undefined): string | undefined {
    if (!oldId) return undefined;
    return this.map.get(oldId);
  }

  optional(oldId: string | null | undefined): string | undefined {
    return this.lookup(oldId);
  }

  connect(oldIds: string[]): { id: string }[] {
    const out: { id: string }[] = [];
    for (const oldId of oldIds) {
      const newId = this.lookup(oldId);
      if (newId) out.push({ id: newId });
    }
    return out;
  }
}

function sortMapsByParent(maps: WorldMapRecord[]): WorldMapRecord[] {
  const byId = new Map(maps.map((m) => [m.id, m]));
  const sorted: WorldMapRecord[] = [];
  const done = new Set<string>();

  const visit = (m: WorldMapRecord) => {
    if (done.has(m.id)) return;
    if (
      m.parentMapId &&
      byId.has(m.parentMapId) &&
      !done.has(m.parentMapId)
    ) {
      visit(byId.get(m.parentMapId)!);
    }
    sorted.push(m);
    done.add(m.id);
  };

  for (const m of maps) visit(m);
  return sorted;
}

export async function importWorldFromZip(
  buffer: Buffer,
  ownerId: string,
): Promise<string> {
  const { parseWorldZip } = await import("./zip");
  const { bundle, zip } = await parseWorldZip(buffer);
  return importWorldBundle(bundle, zip, ownerId);
}

export async function importWorldBundle(
  bundle: WorldBundle,
  zip: JSZip,
  ownerId: string,
  importedName?: string,
): Promise<string> {
  if (!ownerId) throw new Error("Import requires an owner");

  const clean = sanitizeWorldBundle(bundle);

  // Create the world shell up-front so we have an id to scope new asset keys.
  const world = await prisma.world.create({
    data: {
      ownerId,
      name: importedName?.trim() || clean.world.name,
      tagline: clean.world.tagline,
      description: clean.world.description,
      memberships: {
        create: { userId: ownerId, role: WorldRole.OWNER },
      },
    },
  });

  const worldId = world.id;
  const id = new IdMap();
  id.set(clean.world.id, worldId);

  // Upload all referenced assets under the new world prefix and build a key
  // rewrite map for inline references (wiki content, character bios, etc.).
  const assetKeys = collectUploadPaths(clean);
  const pathMap = await importAssetsFromZip(zip, assetKeys, worldId);

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.world.update({
          where: { id: worldId },
          data: { coverImage: remapKey(clean.world.coverImage, pathMap) },
        });

        for (const r of clean.regions) {
          const created = await tx.region.create({
            data: {
              worldId,
              name: r.name,
              description: r.description,
              resources: r.resources,
              settlements: r.settlements,
              rulerId: null,
            },
          });
          id.set(r.id, created.id);
        }

        for (const r of clean.regions) {
          const rulerId = id.lookup(r.rulerId);
          if (rulerId) {
            await tx.region.update({
              where: { id: id.get(r.id) },
              data: { rulerId },
            });
          }
        }

        for (const f of clean.factions) {
          const created = await tx.faction.create({
            data: {
              worldId,
              name: f.name,
              banner: remapKey(f.banner, pathMap),
              description: f.description,
              motto: f.motto,
              alignment: f.alignment,
            },
          });
          id.set(f.id, created.id);
        }

        for (const rf of clean.regionFactions) {
          await tx.regionFaction.create({
            data: {
              regionId: id.get(rf.regionId),
              factionId: id.get(rf.factionId),
            },
          });
        }

        for (const c of clean.characters) {
          const created = await tx.character.create({
            data: {
              worldId,
              name: c.name,
              title: c.title,
              portrait: remapKey(c.portrait, pathMap),
              biography: rewritePathsInText(c.biography, pathMap),
              birthYear: c.birthYear,
              deathYear: c.deathYear,
              status: c.status,
              notes: rewritePathsInText(c.notes, pathMap),
              factionId: id.optional(c.factionId),
              currentRegionId: id.optional(c.currentRegionId),
            },
          });
          id.set(c.id, created.id);
        }

        for (const w of clean.wikiPages) {
          const created = await tx.wikiPage.create({
            data: {
              worldId,
              title: w.title,
              slug: w.slug,
              category: w.category,
              tags: w.tags,
              content:
                rewritePathsInText(w.content, pathMap) ?? w.content,
              characters: { connect: id.connect(w.characterIds) },
              regions: { connect: id.connect(w.regionIds) },
              factions: { connect: id.connect(w.factionIds) },
            },
          });
          id.set(w.id, created.id);
        }

        for (const e of clean.timelineEvents) {
          const created = await tx.timelineEvent.create({
            data: {
              worldId,
              title: e.title,
              description: e.description,
              year: e.year,
              monthDay: e.monthDay,
              era: e.era,
              category: e.category,
              regionId: id.optional(e.regionId),
              factionId: id.optional(e.factionId),
              characters: { connect: id.connect(e.characterIds) },
              wikiLinks: { connect: id.connect(e.wikiPageIds) },
            },
          });
          id.set(e.id, created.id);
        }

        for (const w of clean.wikiPages) {
          const connects = id.connect(w.eventIds);
          if (connects.length === 0) continue;
          await tx.wikiPage.update({
            where: { id: id.get(w.id) },
            data: { events: { connect: connects } },
          });
        }

        for (const link of clean.wikiLinks) {
          const fromId = id.lookup(link.fromId);
          const toId = id.lookup(link.toId);
          if (!fromId || !toId) continue;
          await tx.wikiLink.create({
            data: { fromId, toId },
          });
        }

        const sortedMaps = sortMapsByParent(clean.maps);
        for (const m of sortedMaps) {
          const created = await tx.worldMap.create({
            data: {
              worldId,
              parentMapId: id.optional(m.parentMapId),
              regionId: id.optional(m.regionId),
              name: m.name,
              description: rewritePathsInText(m.description, pathMap),
              imagePath:
                remapKey(m.imagePath, pathMap) ?? m.imagePath,
              width: m.width,
              height: m.height,
            },
          });
          id.set(m.id, created.id);
        }

        for (const p of clean.mapPins) {
          const mapId = id.lookup(p.mapId);
          if (!mapId) continue;
          await tx.mapPin.create({
            data: {
              mapId,
              label: p.label,
              x: p.x,
              y: p.y,
              color: p.color,
              icon: p.icon,
              linkType: p.linkType,
              regionId: id.optional(p.regionId),
              characterId: id.optional(p.characterId),
              eventId: id.optional(p.eventId),
              wikiPageId: id.optional(p.wikiPageId),
              childMapId: id.optional(p.childMapId),
            },
          });
        }

        for (const t of clean.familyTrees) {
          const created = await tx.familyTree.create({
            data: {
              worldId,
              name: t.name,
              description: t.description,
            },
          });
          id.set(t.id, created.id);
        }

        for (const m of clean.familyMembers) {
          const treeId = id.lookup(m.treeId);
          const characterId = id.lookup(m.characterId);
          if (!treeId || !characterId) continue;
          const created = await tx.familyMember.create({
            data: {
              treeId,
              characterId,
              x: m.x,
              y: m.y,
            },
          });
          id.set(m.id, created.id);
        }

        for (const e of clean.familyEdges) {
          const treeId = id.lookup(e.treeId);
          const fromId = id.lookup(e.fromId);
          const toId = id.lookup(e.toId);
          if (!treeId || !fromId || !toId) continue;
          await tx.familyEdge.create({
            data: {
              treeId,
              fromId,
              toId,
              type: e.type,
            },
          });
        }
      },
      { maxWait: 60_000, timeout: 120_000 },
    );
  } catch (err) {
    await prisma.world.delete({ where: { id: worldId } }).catch(() => {});
    throw err;
  }

  return worldId;
}
