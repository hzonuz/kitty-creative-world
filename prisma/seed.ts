/**
 * Seed a small demo world: Aetheria.
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

const SAMPLE_MAP_FILENAME = "demo-map.svg";

async function main() {
  console.log("🌱 Seeding demo world…");

  // Wipe existing demo if present (named "Aetheria")
  await prisma.world.deleteMany({ where: { name: "Aetheria" } });

  // Write a generated SVG map into /public/uploads/maps/
  const mapsDir = path.join(process.cwd(), "public", "uploads", "maps");
  mkdirSync(mapsDir, { recursive: true });
  const mapPath = path.join(mapsDir, SAMPLE_MAP_FILENAME);
  if (!existsSync(mapPath)) {
    writeFileSync(mapPath, sampleMapSvg(), "utf8");
  }
  const mapPublicPath = `/uploads/maps/${SAMPLE_MAP_FILENAME}`;

  const world = await prisma.world.create({
    data: {
      name: "Aetheria",
      tagline: "A shattered continent of rune-magic and rusted empires",
      description:
        "Aetheria is a world fractured by the Sundering — a cataclysm that splintered a single continent into three rival realms. Magic seeps through the cracks of the earth, and cities are built on the bones of forgotten gods.",
    },
  });

  // ---------- Regions ----------
  const veldra = await prisma.region.create({
    data: {
      worldId: world.id,
      name: "Veldra",
      description:
        "A mountainous northern realm of stone-cut keeps and bitter winters.",
      resources: "Iron, granite, snow-fox pelts",
      settlements: "Highspire, Thornhold, Iron Vale",
    },
  });
  const mireholm = await prisma.region.create({
    data: {
      worldId: world.id,
      name: "Mireholm",
      description:
        "Lowland marshes braided with rune-rivers. Smugglers and mystics rule its hidden isles.",
      resources: "Bog-iron, witch-grass, rune crystals",
      settlements: "Greyford, Salt Lantern",
    },
  });
  const ashen = await prisma.region.create({
    data: {
      worldId: world.id,
      name: "The Ashen Reach",
      description:
        "A volcanic frontier of black sand deserts and obsidian spires.",
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
      description:
        "An order of armored knights sworn to mend what the Sundering broke.",
    },
  });
  const ashenCircle = await prisma.faction.create({
    data: {
      worldId: world.id,
      name: "The Ashen Circle",
      motto: "From cinders, prophecy.",
      alignment: "neutral",
      description:
        "Volcanic seers who read fate in lava and ash. They worship Pyrh, the Smouldering.",
    },
  });
  const greySails = await prisma.faction.create({
    data: {
      worldId: world.id,
      name: "The Grey Sails",
      motto: "The river forgets all debts.",
      alignment: "chaotic",
      description:
        "Mireholm's smuggler-fleet, masters of the rune-rivers and ledger-poison.",
    },
  });

  // ---------- Region-Faction links ----------
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
      biography:
        "Heir of the Aldraine line, Kira commands the northern keeps and dreams of mending the Sundering.",
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
      biography:
        "Kira's father. Survived the Battle of Black Hollow and never spoke of it.",
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
      biography: "Kira's mother. Said to have walked into Mireholm and never returned.",
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
      biography:
        "A cinder-marked seer of the Ashen Circle. Sees too much, says too little.",
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
      biography:
        "A laughing smuggler with too many debts and too many friends.",
      birthYear: 485,
      status: "alive",
      factionId: greySails.id,
      currentRegionId: mireholm.id,
    },
  });

  // Set Veldra's ruler
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
        title: "Founding of Highspire",
        description: "First stone laid in what would become Veldra's capital.",
        year: 47,
        category: "founding",
        regionId: veldra.id,
      },
    }),
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "The Ember Pact",
        description: "The Ashen Circle is sworn into uneasy alliance with the Grey Sails.",
        year: 312,
        category: "pact",
        factionId: ashenCircle.id,
      },
    }),
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "Battle of Black Hollow",
        description: "A bitter clash where Halric Aldraine earned his silence.",
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
        title: "Kira Aldraine is born",
        year: 478,
        category: "birth",
        regionId: veldra.id,
        characters: { connect: [{ id: kira.id }] },
      },
    }),
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "Seraphine vanishes into Mireholm",
        year: 504,
        category: "mystery",
        regionId: mireholm.id,
        characters: { connect: [{ id: seraphine.id }] },
      },
    }),
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "Halric's death",
        year: 511,
        category: "death",
        regionId: veldra.id,
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
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "Veylin's first prophecy",
        description: "Veylin foretells the return of the Smouldering.",
        year: 519,
        category: "prophecy",
        regionId: ashen.id,
        characters: { connect: [{ id: veylin.id }] },
      },
    }),
    prisma.timelineEvent.create({
      data: {
        worldId: world.id,
        title: "The Lantern Heist",
        description: "Renn Greysail steals a forbidden chart from the Iron Covenant.",
        year: 527,
        category: "heist",
        factionId: greySails.id,
        characters: { connect: [{ id: renn.id }, { id: kira.id }] },
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
      content: `<h1>The Sundering</h1>
<p>The <strong>Sundering</strong> is the catastrophe that fractured the once-whole continent of <em>Aetheria</em> into three rival realms. Its cause remains contested.</p>
<h2>Aftermath</h2>
<ul><li>Magic became unpredictable.</li><li>The old gods went silent.</li><li>The Iron Covenant rose to "mend what was broken".</li></ul>`,
    },
  });
  await prisma.wikiPage.create({
    data: {
      worldId: world.id,
      title: "House Aldraine",
      slug: "house-aldraine",
      category: "factions",
      tags: "veldra, nobility, north",
      content: `<h1>House Aldraine</h1>
<p>An old northern bloodline sworn to the <strong>Iron Covenant</strong>. Currently led by <em>Kira Aldraine</em>, Lady-Marshal of Veldra.</p>`,
    },
  });
  await prisma.wikiPage.create({
    data: {
      worldId: world.id,
      title: "Rune-Rivers of Mireholm",
      slug: "rune-rivers-of-mireholm",
      category: "places",
      tags: "mireholm, magic, geography",
      content: `<h1>Rune-Rivers</h1>
<p>The braided waterways of Mireholm carry trace runic charge from the Sundering. Boats drift faster downstream when sigils are inked beneath their hulls.</p>`,
    },
  });

  // ---------- Family Tree ----------
  const tree = await prisma.familyTree.create({
    data: {
      worldId: world.id,
      name: "House Aldraine",
      description: "The northern bloodline sworn to the Iron Covenant.",
    },
  });

  const memHalric = await prisma.familyMember.create({
    data: { treeId: tree.id, characterId: halric.id, x: 80, y: 60 },
  });
  const memSeraphine = await prisma.familyMember.create({
    data: { treeId: tree.id, characterId: seraphine.id, x: 360, y: 60 },
  });
  const memKira = await prisma.familyMember.create({
    data: { treeId: tree.id, characterId: kira.id, x: 220, y: 260 },
  });

  await prisma.familyEdge.createMany({
    data: [
      { treeId: tree.id, fromId: memHalric.id, toId: memSeraphine.id, type: "spouse" },
      { treeId: tree.id, fromId: memHalric.id, toId: memKira.id, type: "parent" },
      { treeId: tree.id, fromId: memSeraphine.id, toId: memKira.id, type: "parent" },
    ],
  });

  // ---------- Maps ----------
  const map = await prisma.worldMap.create({
    data: {
      worldId: world.id,
      name: "Aetheria — World Map",
      description: "The shattered continent in its current age.",
      imagePath: mapPublicPath,
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
        label: "Greyford",
        x: 620,
        y: 470,
        color: "#7fb069",
        icon: "≈",
        linkType: "region",
        regionId: mireholm.id,
      },
      {
        mapId: map.id,
        label: "The Last Forge",
        x: 920,
        y: 600,
        color: "#e76f51",
        icon: "🜂",
        linkType: "region",
        regionId: ashen.id,
      },
      {
        mapId: map.id,
        label: "Battle of Black Hollow",
        x: 410,
        y: 340,
        color: "#a4243b",
        icon: "⚔",
        linkType: "event",
        eventId: events[3].id,
      },
      {
        mapId: map.id,
        label: "Lady-Marshal Kira",
        x: 320,
        y: 250,
        color: "#f4a261",
        icon: "★",
        linkType: "character",
        characterId: kira.id,
      },
    ],
  });

  console.log("✅ Done. Open http://localhost:3000 to explore Aetheria.");
}

function sampleMapSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <radialGradient id="sea" cx="50%" cy="50%" r="80%">
      <stop offset="0%" stop-color="#0f1d2e"/>
      <stop offset="100%" stop-color="#06070b"/>
    </radialGradient>
    <pattern id="parchment" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#1a212e"/>
      <circle cx="2" cy="2" r="0.5" fill="#243049" opacity="0.4"/>
    </pattern>
    <filter id="rough" x="0" y="0">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3"/>
      <feDisplacementMap in="SourceGraphic" scale="3"/>
    </filter>
  </defs>

  <rect width="1200" height="800" fill="url(#sea)"/>

  <!-- Northern landmass: Veldra -->
  <path d="M120,100 Q260,40 420,90 Q540,140 520,260 Q460,360 320,360 Q200,330 140,260 Q80,180 120,100 Z"
        fill="url(#parchment)" stroke="#5fb0ec" stroke-width="2" filter="url(#rough)" opacity="0.95"/>

  <!-- Central marshes: Mireholm -->
  <path d="M540,360 Q620,330 720,360 Q820,400 800,520 Q720,580 600,560 Q500,520 540,360 Z"
        fill="url(#parchment)" stroke="#7fb069" stroke-width="2" filter="url(#rough)" opacity="0.95"/>

  <!-- Southern desert: The Ashen Reach -->
  <path d="M780,520 Q900,480 1060,540 Q1140,640 1060,720 Q920,760 800,720 Q740,640 780,520 Z"
        fill="url(#parchment)" stroke="#e76f51" stroke-width="2" filter="url(#rough)" opacity="0.95"/>

  <!-- mountains -->
  <g fill="none" stroke="#f5ecd6" stroke-width="1.2" opacity="0.7">
    <polyline points="220,200 240,170 260,200 280,160 300,200"/>
    <polyline points="320,250 340,220 360,250 380,210 400,250"/>
    <polyline points="600,470 620,440 640,470"/>
    <polyline points="920,640 940,610 960,640 980,600 1000,640"/>
  </g>

  <!-- rune-rivers in Mireholm -->
  <path d="M560,400 Q620,440 660,420 T780,500" stroke="#5fb0ec" stroke-width="1.5" fill="none" opacity="0.6"/>
  <path d="M620,380 Q680,420 720,410 T800,470" stroke="#5fb0ec" stroke-width="1" fill="none" opacity="0.4"/>

  <!-- labels -->
  <g font-family="serif" fill="#f5ecd6" opacity="0.85">
    <text x="240" y="190" font-size="22" font-style="italic">Veldra</text>
    <text x="610" y="450" font-size="20" font-style="italic">Mireholm</text>
    <text x="870" y="640" font-size="20" font-style="italic">The Ashen Reach</text>
    <text x="40" y="60" font-size="14" opacity="0.6">Aetheria — Year 530</text>
  </g>

  <!-- compass -->
  <g transform="translate(1100,90)" stroke="#f5ecd6" fill="#f5ecd6" opacity="0.7">
    <circle r="32" fill="none"/>
    <polygon points="0,-26 6,0 0,26 -6,0" fill="#f5ecd6"/>
    <text x="0" y="-36" text-anchor="middle" font-size="12">N</text>
  </g>
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
