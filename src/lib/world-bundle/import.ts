import type JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import type { WorldBundle, WorldMapRecord } from "./types";
import {
  collectUploadPaths,
  importAssetsFromZip,
  remapPath,
  rewritePathsInText,
} from "./assets";

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

  optional(oldId: string | null | undefined): string | undefined {
    if (!oldId) return undefined;
    return this.get(oldId);
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

export async function importWorldFromZip(buffer: Buffer): Promise<string> {
  const { parseWorldZip } = await import("./zip");
  const { bundle, zip } = await parseWorldZip(buffer);
  return importWorldBundle(bundle, zip);
}

export async function importWorldBundle(
  bundle: WorldBundle,
  zip: JSZip,
  importedName?: string,
): Promise<string> {
  const assetPaths = collectUploadPaths(bundle);
  const pathMap = await importAssetsFromZip(zip, assetPaths);

  const id = new IdMap();

  const worldId = await prisma.$transaction(
    async (tx) => {
      const world = await tx.world.create({
        data: {
          name: importedName?.trim() || bundle.world.name,
          tagline: bundle.world.tagline,
          description: bundle.world.description,
          coverImage: remapPath(bundle.world.coverImage, pathMap),
        },
      });
      id.set(bundle.world.id, world.id);
      const worldId = world.id;

      for (const r of bundle.regions) {
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

      for (const r of bundle.regions) {
        if (r.rulerId) {
          await tx.region.update({
            where: { id: id.get(r.id) },
            data: { rulerId: id.get(r.rulerId) },
          });
        }
      }

      for (const f of bundle.factions) {
        const created = await tx.faction.create({
          data: {
            worldId,
            name: f.name,
            banner: remapPath(f.banner, pathMap),
            description: f.description,
            motto: f.motto,
            alignment: f.alignment,
          },
        });
        id.set(f.id, created.id);
      }

      for (const rf of bundle.regionFactions) {
        await tx.regionFaction.create({
          data: {
            regionId: id.get(rf.regionId),
            factionId: id.get(rf.factionId),
          },
        });
      }

      for (const c of bundle.characters) {
        const created = await tx.character.create({
          data: {
            worldId,
            name: c.name,
            title: c.title,
            portrait: remapPath(c.portrait, pathMap),
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

      for (const w of bundle.wikiPages) {
        const created = await tx.wikiPage.create({
          data: {
            worldId,
            title: w.title,
            slug: w.slug,
            category: w.category,
            tags: w.tags,
            content:
              rewritePathsInText(w.content, pathMap) ?? w.content,
            characters: {
              connect: w.characterIds.map((cid) => ({ id: id.get(cid) })),
            },
            regions: {
              connect: w.regionIds.map((rid) => ({ id: id.get(rid) })),
            },
            factions: {
              connect: w.factionIds.map((fid) => ({ id: id.get(fid) })),
            },
          },
        });
        id.set(w.id, created.id);
      }

      for (const e of bundle.timelineEvents) {
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
            characters: {
              connect: e.characterIds.map((cid) => ({ id: id.get(cid) })),
            },
            wikiLinks: {
              connect: e.wikiPageIds.map((wid) => ({ id: id.get(wid) })),
            },
          },
        });
        id.set(e.id, created.id);
      }

      for (const w of bundle.wikiPages) {
        if (w.eventIds.length === 0) continue;
        await tx.wikiPage.update({
          where: { id: id.get(w.id) },
          data: {
            events: {
              connect: w.eventIds.map((eid) => ({ id: id.get(eid) })),
            },
          },
        });
      }

      for (const link of bundle.wikiLinks) {
        await tx.wikiLink.create({
          data: {
            fromId: id.get(link.fromId),
            toId: id.get(link.toId),
          },
        });
      }

      const sortedMaps = sortMapsByParent(bundle.maps);
      for (const m of sortedMaps) {
        const created = await tx.worldMap.create({
          data: {
            worldId,
            parentMapId: id.optional(m.parentMapId),
            regionId: id.optional(m.regionId),
            name: m.name,
            description: rewritePathsInText(m.description, pathMap),
            imagePath:
              remapPath(m.imagePath, pathMap) ?? m.imagePath,
            width: m.width,
            height: m.height,
          },
        });
        id.set(m.id, created.id);
      }

      for (const p of bundle.mapPins) {
        await tx.mapPin.create({
          data: {
            mapId: id.get(p.mapId),
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

      for (const t of bundle.familyTrees) {
        const created = await tx.familyTree.create({
          data: {
            worldId,
            name: t.name,
            description: t.description,
          },
        });
        id.set(t.id, created.id);
      }

      for (const m of bundle.familyMembers) {
        const created = await tx.familyMember.create({
          data: {
            treeId: id.get(m.treeId),
            characterId: id.get(m.characterId),
            x: m.x,
            y: m.y,
          },
        });
        id.set(m.id, created.id);
      }

      for (const e of bundle.familyEdges) {
        await tx.familyEdge.create({
          data: {
            treeId: id.get(e.treeId),
            fromId: id.get(e.fromId),
            toId: id.get(e.toId),
            type: e.type,
          },
        });
      }

      return worldId;
    },
    { maxWait: 60_000, timeout: 120_000 },
  );

  return worldId;
}
