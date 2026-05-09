# Kitty Creative World

A worldbuilding workspace for personal use.

Build private fictional worlds with characters, regions, factions, timelines, wikis, family trees, and interactive maps.

## Stack

- **Next.js 14** (App Router, Server Actions)
- **React 18** + **TypeScript**
- **TailwindCSS** with CSS-variable themes (`ink`, `desert`, `cyberpunk`, `steampunk`)
- **SQLite** via **Prisma**
- **TipTap** rich-text editor for the wiki
- **React Flow** for interactive family trees
- **Leaflet** (CRS.Simple) for image-based fantasy maps with clickable, draggable pins
- Local file uploads stored under `public/uploads/`
- i18n with `dir="rtl"` and **Vazirmatn** font for Farsi

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create the database & generate the Prisma client
npx prisma migrate dev --name init

# 3. (Optional) Seed a small demo world ("Aetheria")
npm run db:seed

# 4. Run the app
npm run dev
```

Open http://localhost:3000 and click the **⚙ Settings** button in the top right to switch language or theme.

## Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the local dev server               |
| `npm run build`     | Build the production bundle              |
| `npm run start`     | Run the production server                |
| `npm run db:migrate`| Apply migrations / create the SQLite DB  |
| `npm run db:reset`  | Wipe and re-create the DB                |
| `npm run db:seed`   | Seed the "Aetheria" demo world           |
| `npm run db:studio` | Open Prisma Studio (DB browser)          |


## Where things live

```
.
├── prisma/
│   ├── schema.prisma        # Full data model
│   └── seed.ts              # Demo world seeder
├── public/
│   └── uploads/             # All locally uploaded images
│       ├── covers/
│       ├── portraits/
│       ├── banners/
│       └── maps/
└── src/
    ├── app/
    │   ├── layout.tsx                # Reads cookies, sets html[lang|dir|data-theme]
    │   ├── page.tsx                  # All worlds dashboard
    │   ├── actions/                  # Server Actions (CRUD + preferences)
    │   └── worlds/[worldId]/
    │       ├── page.tsx              # World overview
    │       ├── edit/                 # Edit world
    │       ├── regions/              # Regions / zones
    │       ├── characters/           # Character profiles
    │       ├── factions/             # Factions
    │       ├── timeline/             # Timeline events
    │       ├── wiki/                 # Wiki pages (TipTap)
    │       ├── family/               # Family trees (React Flow)
    │       └── maps/                 # Interactive maps (Leaflet)
    ├── components/
    │   ├── shell/         # AppShell, sidebars, headers, empty state, SettingsMenu
    │   ├── i18n/          # Client I18nProvider + useT()/useLocale() hooks
    │   ├── characters/    # Character form
    │   ├── regions/       # Region form
    │   ├── factions/      # Faction form
    │   ├── wiki/          # TipTap editor + search
    │   ├── timeline/      # Event form + timeline view
    │   ├── family/        # React Flow tree
    │   └── maps/          # Leaflet map viewer + pin dialog
    └── lib/
        ├── prisma.ts
        ├── i18n.ts        # en / fa dictionaries + translate()
        ├── preferences.ts # cookie helpers (locale + theme) for server components
        ├── slug.ts
        ├── uploads.ts
        ├── wiki.ts
        └── cn.ts
```

## Concepts

A **World** is the root of everything. Inside a world you have:

- **Regions / Zones** — geographic areas with rulers, factions, settlements, resources.
- **Characters** — name, portrait, biography, birth/death, status, current location, faction, linked events, and family.
- **Factions** — name, banner, motto, alignment, members, regions of influence.
- **Timeline events** — chronological entries with year, era, region, faction, and characters.
- **Wiki pages** — TipTap-edited articles with categories, tags, and inter-linking.
- **Family trees** — nodes are characters, edges are `parent` or `spouse`, rendered with React Flow.
- **Maps** — uploaded images shown via Leaflet's `CRS.Simple`. Drop **pins** that link to a region, character, event, wiki page, or another nested map (world → continent → city).

## Notes

- All data is stored in `prisma/dev.db` (SQLite) plus images on disk in `public/uploads/`. Back up these two locations and you've backed up everything.
- This is intentionally **not** built for multi-user, network deployment, or scale. It's a personal tool.
- The TipTap editor stores HTML directly in the DB. You can swap to raw markdown later if you prefer; the schema field is just a string.
