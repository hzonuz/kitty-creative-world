# Kitty Creative World

A collaborative worldbuilding workspace.

Build fictional worlds with characters, regions, factions, timelines, wikis,
family trees, and interactive maps. Share each world with collaborators using
four role tiers and discuss every entity with inline comments.

## Stack

- **Next.js 14** (App Router, Server Actions, standalone output)
- **React 18** + **TypeScript**
- **TailwindCSS** with CSS-variable themes (`ink`, `dieselpunk`, `cyberpunk`, `steampunk`)
- **PostgreSQL 16** via **Prisma**
- **MinIO** (S3-compatible object storage) for cover images, portraits, banners, maps, etc.
- **NextAuth.js** (credentials provider) for authentication
- **bcryptjs** for password hashing
- **TipTap** rich-text editor for the wiki
- **React Flow** for interactive family trees
- **Leaflet** (CRS.Simple) for image-based fantasy maps with clickable, draggable pins
- **Docker / docker-compose** for one-command production deployment
- i18n with `dir="rtl"` and **Vazirmatn** font for Farsi

## Roles & permissions

Every world has exactly one **OWNER**. The owner may invite other users at
any of these levels:

| Role        | Read | Comment | Edit | Manage members |
| ----------- | :--: | :-----: | :--: | :------------: |
| `VIEWER`    |  ✔   |         |      |                |
| `COMMENTOR` |  ✔   |    ✔    |      |                |
| `EDITOR`    |  ✔   |    ✔    |  ✔   |                |
| `OWNER`     |  ✔   |    ✔    |  ✔   |       ✔        |

Comments can be attached to any in-world entity (regions, characters,
factions, timeline events, wiki pages, maps, family trees, or the world
itself). Comment authors and editors can edit/delete comments; the owner can
moderate everything.

## Quick start (Docker — recommended)

The supplied `docker-compose.yml` starts Postgres, MinIO, and the app:

```bash
# 1. Copy and edit env vars (be sure to set NEXTAUTH_SECRET)
cp .env.example .env
# Generate a real secret:
#   openssl rand -base64 32

# 2. Start everything
docker compose up --build

# 3. (Optional) Seed the demo world
docker compose exec app node node_modules/prisma/build/index.js db seed
```

Open <http://localhost:3000> and sign up for a new account, or sign in with
the seeded demo account (`demo@example.com` / `demopass`).

MinIO admin console: <http://localhost:9001>

## Quick start (local dev)

```bash
# 1. Install dependencies
npm install

# 2. Spin up Postgres and MinIO (the app runs on your host)
docker compose up -d postgres minio createbucket

# 3. Generate the Prisma client and run migrations
npm run db:migrate

# 4. (Optional) Seed the demo world
npm run db:seed

# 5. Start the dev server
npm run dev
```

## Scripts

| Script               | Description                                |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start the local dev server                 |
| `npm run build`      | Build the production bundle                |
| `npm run start`      | Run the production server                  |
| `npm run db:migrate` | Apply migrations to the Postgres database  |
| `npm run db:deploy`  | Apply migrations in CI / production        |
| `npm run db:reset`   | Wipe and re-create the DB                  |
| `npm run db:seed`    | Seed the "Aetheria" demo world             |
| `npm run db:studio`  | Open Prisma Studio (DB browser)            |

## Environment variables

| Variable           | Required | Description                                        |
| ------------------ | :------: | -------------------------------------------------- |
| `DATABASE_URL`     |    ✔     | Postgres connection string                         |
| `NEXTAUTH_SECRET`  |    ✔     | Random 32+ char secret for session signing         |
| `NEXTAUTH_URL`     |    ✔     | Public origin of the app                           |
| `S3_ENDPOINT`      |    ✔     | MinIO/S3 host name                                 |
| `S3_PORT`          |          | Port (default 9000)                                |
| `S3_USE_SSL`       |          | `true` / `false` (default false)                   |
| `S3_REGION`        |          | S3 region (default `us-east-1`)                    |
| `S3_ACCESS_KEY`    |    ✔     | Object-storage access key                          |
| `S3_SECRET_KEY`    |    ✔     | Object-storage secret key                          |
| `S3_BUCKET`        |    ✔     | Name of the bucket — created automatically         |

## Where things live

```
.
├── prisma/
│   ├── schema.prisma            # Multi-tenant schema with users + roles
│   └── seed.ts                  # Demo world seeder
├── docker/
│   └── entrypoint.sh            # Runs prisma migrate deploy on boot
├── docker-compose.yml           # Postgres + MinIO + app
├── Dockerfile                   # Multi-stage build, Next.js standalone output
└── src/
    ├── middleware.ts            # Routes everything through NextAuth
    ├── app/
    │   ├── auth/                # Sign in / sign up pages
    │   ├── api/
    │   │   ├── auth/[…]         # NextAuth handler
    │   │   ├── files/[…key]     # MinIO proxy with per-world access checks
    │   │   ├── health           # /api/health for Docker healthchecks
    │   │   └── worlds/[…]/export
    │   ├── actions/             # Server Actions (CRUD + auth + comments)
    │   └── worlds/[worldId]/    # World pages incl. /members
    ├── components/
    │   ├── auth/                # SessionProvider, SignIn/SignUp, UserMenu
    │   ├── comments/            # CommentSection + CommentList
    │   ├── worlds/              # WorldImportForm, MembershipManager, …
    │   ├── shell/               # AppShell, sidebars, headers
    │   ├── i18n/                # I18nProvider + useT()/useLocale()
    │   ├── characters/, regions/, factions/, timeline/, wiki/, family/, maps/
    │   └── …
    └── lib/
        ├── auth.ts              # NextAuth config + session helpers
        ├── permissions.ts       # Role-based access helpers
        ├── storage.ts           # MinIO client + uploads
        ├── assetUrl.ts          # Storage key → public proxy URL
        ├── comment-entities.ts  # Comment entity enum helpers
        ├── prisma.ts, slug.ts, uploads.ts, wiki.ts, cn.ts, i18n.ts
        └── world-bundle/        # .kcworld.zip export/import (now MinIO-aware)
```

## Concepts

A **World** is the root of everything. It belongs to a single owner and may
have any number of additional members. Inside a world you have:

- **Regions / Zones** — geographic areas with rulers, factions, settlements, resources.
- **Characters** — name, portrait, biography, birth/death, status, current location, faction, linked events, and family.
- **Factions** — name, banner, motto, alignment, members, regions of influence.
- **Timeline events** — chronological entries with year, era, region, faction, and characters.
- **Wiki pages** — TipTap-edited articles with categories, tags, and inter-linking.
- **Family trees** — nodes are characters, edges are `parent` or `spouse`, rendered with React Flow.
- **Maps** — uploaded images shown via Leaflet's `CRS.Simple` with clickable pins.
- **Comments** — discussion threads attached to any of the above.

## Export & import worlds

Worlds can still be packaged as a portable **`.kcworld.zip`** archive.

| Location              | Action                                                                  |
| --------------------- | ----------------------------------------------------------------------- |
| **Edit world**        | **Download archive** exports that world (editor+ required)              |
| **All worlds** (home) | **Import world** — creates a new world owned by the importer            |

The archive contains `manifest.json`, `data.json`, and `assets/worlds/<old id>/…`
asset bytes. On import the assets are re-uploaded under the new world's
storage namespace, so cross-world references stay isolated.

## Production checklist

- [ ] Set a real `NEXTAUTH_SECRET` (never use the placeholder).
- [ ] Use a managed Postgres or a backed-up volume for `postgres_data`.
- [ ] Use a managed S3-compatible store (or back up `minio_data`).
- [ ] Put the app behind HTTPS (e.g. nginx, Caddy, or Cloudflare).
- [ ] Set `NEXTAUTH_URL` to the public origin.
- [ ] Rotate `S3_ACCESS_KEY` / `S3_SECRET_KEY` from the defaults.
