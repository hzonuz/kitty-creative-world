/**
 * Seed a small demo world: Aetheria.
 * Run with: npm run db:seed
 *
 * Creates a demo user (demo@example.com / password: demopass) and gives them
 * the world. Re-running the seed wipes the demo world and recreates it.
 */
import { PrismaClient, WorldRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { putObjectBuffer } from "../src/lib/storage";

const prisma = new PrismaClient();

const DEMO_USER = {
  username: "demo",
  email: "demo@example.com",
  password: "demopass",
  displayName: "Demo User",
};

async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
  });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);
  return prisma.user.create({
    data: {
      username: DEMO_USER.username,
      email: DEMO_USER.email,
      passwordHash,
      displayName: DEMO_USER.displayName,
    },
  });
}

async function main() {
  console.log("🌱 Seeding demo world…");

  const owner = await ensureDemoUser();

  await prisma.world.deleteMany({
    where: { name: "Aetheria", ownerId: owner.id },
  });

  const mapKey = `worlds/__seed__/maps/demo-map.svg`; // placeholder — replaced below
  const mapBuffer = Buffer.from(sampleMapSvg(), "utf8");

  const world = await prisma.world.create({
    data: {
      ownerId: owner.id,
      name: "Aetheria",
      tagline: "A shattered continent of rune-magic and rusted empires",
      description:
        "Aetheria is a world fractured by the Sundering — a cataclysm that splintered a single continent into three rival realms.",
      memberships: {
        create: { userId: owner.id, role: WorldRole.OWNER },
      },
    },
  });

  const realMapKey = `worlds/${world.id}/maps/demo-map.svg`;
  await putObjectBuffer(realMapKey, mapBuffer, "image/svg+xml");
  void mapKey; // alias for readability above

  // ---------- Regions ----------
  const veldra = await prisma.region.create({
    data: {
      worldId: world.id,
      name: "Veldra",
      description: "A mountainous northern realm of stone-cut keeps.",
      resources: "Iron, granite, snow-fox pelts",
      settlements: "Highspire, Thornhold, Iron Vale",
    },
  });
  const mireholm = await prisma.region.create({
    data: {
      worldId: world.id,
      name: "Mireholm",
      description: "Lowland marshes braided with rune-rivers.",
      resources: "Bog-iron, witch-grass, rune crystals",
      settlements: "Greyford, Salt Lantern",
    },
  });
  const ashen = await prisma.region.create({
    data: {
      worldId: world.id,
      name: "The Ashen Reach",
      description: "A volcanic frontier of black sand deserts and obsidian spires.",
      resources: "Obsidian, sulfur, ember-blood",
      settlements: "Coalstone, Pyre's End, The Last Forge",
    },
  });

  // ---------- Factions ----------
  const ironCovenant = await prisma.faction.create({
    data: {
      worldId: world.id,
      name: "The Iron Covenant",
      motto: "Steel remembers.",
      alignment: "lawful",
      description: "An order of armored knights sworn to mend the Sundering.",
    },
  });
  const ashenCircle = await prisma.faction.create({
    data: {
      worldId: world.id,
      name: "The Ashen Circle",
      motto: "From cinders, prophecy.",
      alignment: "neutral",
      description: "Volcanic seers who read fate in lava and ash.",
    },
  });
  const greySails = await prisma.faction.create({
    data: {
      worldId: world.id,
      name: "The Grey Sails",
      motto: "The river forgets all debts.",
      alignment: "chaotic",
      description: "Mireholm's smuggler-fleet, masters of the rune-rivers.",
    },
  });

  await prisma.regionFaction.createMany({
    data: [
      { regionId: veldra.id, factionId: ironCovenant.id },
      { regionId: mireholm.id, factionId: greySails.id },
      { regionId: mireholm.id, factionId: ashenCircle.id },
      { regionId: ashen.id, factionId: ashenCircle.id },
    ],
  });

  // ---------- Characters ----------
  const kira = await prisma.character.create({
    data: {
      worldId: world.id,
      name: "Kira Aldraine",
      title: "Lady-Marshal of Veldra",
      biography: "Heir of the Aldraine line, Kira commands the northern keeps.",
      birthYear: 478,
      status: "alive",
      factionId: ironCovenant.id,
      currentRegionId: veldra.id,
    },
  });
  const halric = await prisma.character.create({
    data: {
      worldId: world.id,
      name: "Halric Aldraine",
      title: "The Old Marshal",
      biography: "Kira's father. Survived the Battle of Black Hollow.",
      birthYear: 442,
      deathYear: 511,
      status: "dead",
      factionId: ironCovenant.id,
      currentRegionId: veldra.id,
    },
  });
  const seraphine = await prisma.character.create({
    data: {
      worldId: world.id,
      name: "Seraphine Aldraine",
      title: "The Quiet Mother",
      biography: "Kira's mother. Walked into Mireholm and never returned.",
      birthYear: 446,
      deathYear: 504,
      status: "missing",
      currentRegionId: mireholm.id,
    },
  });
  const veylin = await prisma.character.create({
    data: {
      worldId: world.id,
      name: "Veylin of the Ash",
      title: "Seer of the Smouldering",
      biography: "A cinder-marked seer of the Ashen Circle.",
      birthYear: 481,
      status: "alive",
      factionId: ashenCircle.id,
      currentRegionId: ashen.id,
    },
  });
  const renn = await prisma.character.create({
    data: {
      worldId: world.id,
      name: "Renn Greysail",
      title: "Captain of the Lantern Fleet",
      biography: "A laughing smuggler with too many debts.",
      birthYear: 485,
      status: "alive",
      factionId: greySails.id,
      currentRegionId: mireholm.id,
    },
  });

  await prisma.region.update({
    where: { id: veldra.id },
    data: { rulerId: kira.id },
  });

  // ---------- Timeline ----------
  const events = await Promise.all([
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "The Sundering",
        description: "A continent-shattering cataclysm of unknown origin.",
        year: 0,
        era: "Year of Ash",
        category: "cataclysm",
      },
    }),
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "Battle of Black Hollow",
        description: "A bitter clash where Halric earned his silence.",
        year: 471,
        category: "battle",
        regionId: veldra.id,
        factionId: ironCovenant.id,
        characters: { connect: [{ id: halric.id }] },
      },
    }),
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "Kira ascends as Lady-Marshal",
        year: 511,
        category: "succession",
        regionId: veldra.id,
        factionId: ironCovenant.id,
        characters: { connect: [{ id: kira.id }] },
      },
    }),
  ]);

  // ---------- Wiki ----------
  await prisma.wikiPage.create({
    data: {
      worldId: world.id,
      title: "The Sundering",
      slug: "the-sundering",
      category: "events",
      tags: "cataclysm, founding-era, magic",
      content: `<h1>The Sundering</h1><p>The catastrophe that fractured Aetheria.</p>`,
    },
  });

  // ---------- Maps ----------
  const map = await prisma.worldMap.create({
    data: {
      worldId: world.id,
      name: "Aetheria — World Map",
      description: "The shattered continent in its current age.",
      imagePath: realMapKey,
      width: 1200,
      height: 800,
    },
  });

  await prisma.mapPin.createMany({
    data: [
      {
        mapId: map.id,
        label: "Highspire",
        x: 280,
        y: 220,
        color: "#5fb0ec",
        icon: "♜",
        linkType: "region",
        regionId: veldra.id,
      },
      {
        mapId: map.id,
        label: "Battle of Black Hollow",
        x: 410,
        y: 340,
        color: "#a4243b",
        icon: "⚔",
        linkType: "event",
        eventId: events[1].id,
      },
    ],
  });

  console.log("✅ Done.");
  console.log("→ Demo login:", DEMO_USER.email, "/", DEMO_USER.password);
}

function sampleMapSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <rect width="1200" height="800" fill="#0f1d2e"/>
  <text x="600" y="400" text-anchor="middle" font-size="48" fill="#f5ecd6" font-family="serif">
    Aetheria
  </text>
</svg>`;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
