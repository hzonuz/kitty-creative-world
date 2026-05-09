-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rulerId" TEXT,
    "resources" TEXT,
    "settlements" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Region_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Region_rulerId_fkey" FOREIGN KEY ("rulerId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "banner" TEXT,
    "description" TEXT,
    "motto" TEXT,
    "alignment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Faction_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegionFaction" (
    "regionId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,

    PRIMARY KEY ("regionId", "factionId"),
    CONSTRAINT "RegionFaction_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RegionFaction_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "portrait" TEXT,
    "biography" TEXT,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "status" TEXT,
    "notes" TEXT,
    "factionId" TEXT,
    "currentRegionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Character_currentRegionId_fkey" FOREIGN KEY ("currentRegionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyTree" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FamilyTree_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "x" REAL,
    "y" REAL,
    CONSTRAINT "FamilyMember_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "FamilyTree" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FamilyMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "FamilyEdge_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "FamilyTree" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FamilyEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "FamilyMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FamilyEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "FamilyMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "monthDay" TEXT,
    "era" TEXT,
    "category" TEXT,
    "regionId" TEXT,
    "factionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TimelineEvent_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimelineEvent_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TimelineEvent_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WikiPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WikiPage_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WikiLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    CONSTRAINT "WikiLink_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "WikiPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WikiLink_toId_fkey" FOREIGN KEY ("toId") REFERENCES "WikiPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldMap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldId" TEXT NOT NULL,
    "parentMapId" TEXT,
    "regionId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imagePath" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 2000,
    "height" INTEGER NOT NULL DEFAULT 1500,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorldMap_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorldMap_parentMapId_fkey" FOREIGN KEY ("parentMapId") REFERENCES "WorldMap" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorldMap_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MapPin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mapId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "linkType" TEXT NOT NULL,
    "regionId" TEXT,
    "characterId" TEXT,
    "eventId" TEXT,
    "wikiPageId" TEXT,
    "childMapId" TEXT,
    CONSTRAINT "MapPin_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "WorldMap" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MapPin_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MapPin_wikiPageId_fkey" FOREIGN KEY ("wikiPageId") REFERENCES "WikiPage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RegionWikiLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RegionWikiLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RegionWikiLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_FactionWikiLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FactionWikiLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "Faction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FactionWikiLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CharacterToTimelineEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CharacterToTimelineEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CharacterToTimelineEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "TimelineEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CharacterWikiLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CharacterWikiLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CharacterWikiLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventWikiLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EventWikiLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "TimelineEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventWikiLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Region_worldId_idx" ON "Region"("worldId");

-- CreateIndex
CREATE INDEX "Faction_worldId_idx" ON "Faction"("worldId");

-- CreateIndex
CREATE INDEX "FamilyTree_worldId_idx" ON "FamilyTree"("worldId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_treeId_characterId_key" ON "FamilyMember"("treeId", "characterId");

-- CreateIndex
CREATE INDEX "FamilyEdge_treeId_idx" ON "FamilyEdge"("treeId");

-- CreateIndex
CREATE INDEX "TimelineEvent_worldId_year_idx" ON "TimelineEvent"("worldId", "year");

-- CreateIndex
CREATE INDEX "WikiPage_worldId_category_idx" ON "WikiPage"("worldId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "WikiPage_worldId_slug_key" ON "WikiPage"("worldId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "WikiLink_fromId_toId_key" ON "WikiLink"("fromId", "toId");

-- CreateIndex
CREATE INDEX "WorldMap_worldId_idx" ON "WorldMap"("worldId");

-- CreateIndex
CREATE INDEX "MapPin_mapId_idx" ON "MapPin"("mapId");

-- CreateIndex
CREATE UNIQUE INDEX "_RegionWikiLinks_AB_unique" ON "_RegionWikiLinks"("A", "B");

-- CreateIndex
CREATE INDEX "_RegionWikiLinks_B_index" ON "_RegionWikiLinks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FactionWikiLinks_AB_unique" ON "_FactionWikiLinks"("A", "B");

-- CreateIndex
CREATE INDEX "_FactionWikiLinks_B_index" ON "_FactionWikiLinks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterToTimelineEvent_AB_unique" ON "_CharacterToTimelineEvent"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterToTimelineEvent_B_index" ON "_CharacterToTimelineEvent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterWikiLinks_AB_unique" ON "_CharacterWikiLinks"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterWikiLinks_B_index" ON "_CharacterWikiLinks"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EventWikiLinks_AB_unique" ON "_EventWikiLinks"("A", "B");

-- CreateIndex
CREATE INDEX "_EventWikiLinks_B_index" ON "_EventWikiLinks"("B");
