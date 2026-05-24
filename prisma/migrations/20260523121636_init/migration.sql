-- CreateEnum
CREATE TYPE "WorldRole" AS ENUM ('VIEWER', 'COMMENTOR', 'EDITOR', 'OWNER');

-- CreateEnum
CREATE TYPE "CommentEntity" AS ENUM ('WORLD', 'REGION', 'CHARACTER', 'FACTION', 'EVENT', 'WIKI', 'MAP', 'MAP_PIN', 'FAMILY_TREE', 'FAMILY_MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldMembership" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorldRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "entityType" "CommentEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rulerId" TEXT,
    "resources" TEXT,
    "settlements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "banner" TEXT,
    "description" TEXT,
    "motto" TEXT,
    "alignment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionFaction" (
    "regionId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,

    CONSTRAINT "RegionFaction_pkey" PRIMARY KEY ("regionId","factionId")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyTree" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyEdge" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "FamilyEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "monthDay" TEXT,
    "era" TEXT,
    "category" TEXT,
    "regionId" TEXT,
    "factionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiPage" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WikiPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiLink" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,

    CONSTRAINT "WikiLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldMap" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "parentMapId" TEXT,
    "regionId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imagePath" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 2000,
    "height" INTEGER NOT NULL DEFAULT 1500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapPin" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "linkType" TEXT NOT NULL,
    "regionId" TEXT,
    "characterId" TEXT,
    "eventId" TEXT,
    "wikiPageId" TEXT,
    "childMapId" TEXT,

    CONSTRAINT "MapPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RegionWikiLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FactionWikiLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CharacterToTimelineEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CharacterWikiLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EventWikiLinks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "WorldMembership_worldId_idx" ON "WorldMembership"("worldId");

-- CreateIndex
CREATE INDEX "WorldMembership_userId_idx" ON "WorldMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorldMembership_worldId_userId_key" ON "WorldMembership"("worldId", "userId");

-- CreateIndex
CREATE INDEX "Comment_worldId_idx" ON "Comment"("worldId");

-- CreateIndex
CREATE INDEX "Comment_entityType_entityId_idx" ON "Comment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "World_ownerId_idx" ON "World"("ownerId");

-- CreateIndex
CREATE INDEX "Region_worldId_idx" ON "Region"("worldId");

-- CreateIndex
CREATE INDEX "Faction_worldId_idx" ON "Faction"("worldId");

-- CreateIndex
CREATE INDEX "Character_worldId_idx" ON "Character"("worldId");

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

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldMembership" ADD CONSTRAINT "WorldMembership_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldMembership" ADD CONSTRAINT "WorldMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "World" ADD CONSTRAINT "World_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_rulerId_fkey" FOREIGN KEY ("rulerId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faction" ADD CONSTRAINT "Faction_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionFaction" ADD CONSTRAINT "RegionFaction_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionFaction" ADD CONSTRAINT "RegionFaction_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_currentRegionId_fkey" FOREIGN KEY ("currentRegionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyTree" ADD CONSTRAINT "FamilyTree_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "FamilyTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyEdge" ADD CONSTRAINT "FamilyEdge_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "FamilyTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyEdge" ADD CONSTRAINT "FamilyEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyEdge" ADD CONSTRAINT "FamilyEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiLink" ADD CONSTRAINT "WikiLink_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "WikiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiLink" ADD CONSTRAINT "WikiLink_toId_fkey" FOREIGN KEY ("toId") REFERENCES "WikiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldMap" ADD CONSTRAINT "WorldMap_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldMap" ADD CONSTRAINT "WorldMap_parentMapId_fkey" FOREIGN KEY ("parentMapId") REFERENCES "WorldMap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorldMap" ADD CONSTRAINT "WorldMap_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPin" ADD CONSTRAINT "MapPin_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "WorldMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPin" ADD CONSTRAINT "MapPin_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPin" ADD CONSTRAINT "MapPin_wikiPageId_fkey" FOREIGN KEY ("wikiPageId") REFERENCES "WikiPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionWikiLinks" ADD CONSTRAINT "_RegionWikiLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionWikiLinks" ADD CONSTRAINT "_RegionWikiLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FactionWikiLinks" ADD CONSTRAINT "_FactionWikiLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FactionWikiLinks" ADD CONSTRAINT "_FactionWikiLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToTimelineEvent" ADD CONSTRAINT "_CharacterToTimelineEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToTimelineEvent" ADD CONSTRAINT "_CharacterToTimelineEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterWikiLinks" ADD CONSTRAINT "_CharacterWikiLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterWikiLinks" ADD CONSTRAINT "_CharacterWikiLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventWikiLinks" ADD CONSTRAINT "_EventWikiLinks_A_fkey" FOREIGN KEY ("A") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventWikiLinks" ADD CONSTRAINT "_EventWikiLinks_B_fkey" FOREIGN KEY ("B") REFERENCES "WikiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
