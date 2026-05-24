import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeleteButton } from "@/components/shell/DeleteButton";
import { deleteFaction } from "@/app/actions/factions";
import { formatYear } from "@/lib/slug";
import { tServer } from "@/lib/preferences";
import { assetUrl } from "@/lib/assetUrl";
import { CommentSection } from "@/components/comments/CommentSection";
import { getWorldAccess } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function FactionDetailPage({
  params,
}: {
  params: { worldId: string; factionId: string };
}) {
  const faction = await prisma.faction.findUnique({
    where: { id: params.factionId },
    include: {
      members: { orderBy: { name: "asc" } },
      regions: { include: { region: true } },
      events: { orderBy: { year: "asc" } },
      wikiLinks: true,
    },
  });
  if (!faction || faction.worldId !== params.worldId) notFound();

  const access = await getWorldAccess(params.worldId);
  const remove = deleteFaction.bind(null, params.worldId, faction.id);
  const base = `/worlds/${params.worldId}`;

  return (
    <>
      <PageHeader
        eyebrow={tServer("nav.factions")}
        title={faction.name}
        description={faction.motto ? `"${faction.motto}"` : undefined}
        actions={
          access?.canEdit ? (
            <>
              <Link href={`${base}/factions/${faction.id}/edit`} className="btn-ghost">
                {tServer("common.edit")}
              </Link>
              <DeleteButton
                action={remove}
                redirectTo={`${base}/factions`}
                confirmText={tServer("faction.deleteConfirm", { name: faction.name })}
              />
            </>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-1">
          <div className="relative aspect-[16/9] w-full bg-ink-800">
            {faction.banner ? (
              <Image src={assetUrl(faction.banner) ?? ""} alt={faction.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-ink-400">
                ⚔
              </div>
            )}
          </div>
          <div className="space-y-3 px-5 py-4">
            <div>
              <div className="section-title">{tServer("faction.section.alignment")}</div>
              <div className="text-sm text-parchment-50">{faction.alignment ?? "—"}</div>
            </div>
            {faction.description ? (
              <div>
                <div className="section-title">{tServer("faction.section.description")}</div>
                <p className="whitespace-pre-line text-sm text-parchment-100/80">
                  {faction.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <List
            title={tServer("faction.members", { n: faction.members.length })}
            empty={tServer("faction.empty.members")}
            items={faction.members.map((m) => ({
              id: m.id,
              href: `${base}/characters/${m.id}`,
              primary: m.name,
              secondary: m.title ?? null,
            }))}
          />
          <List
            title={tServer("faction.regions")}
            empty={tServer("faction.empty.regions")}
            items={faction.regions.map((rf) => ({
              id: rf.regionId,
              href: `${base}/regions/${rf.regionId}`,
              primary: rf.region.name,
              secondary: null,
            }))}
          />
          <List
            title={tServer("faction.events")}
            empty={tServer("faction.empty.events")}
            items={faction.events.map((e) => ({
              id: e.id,
              href: `${base}/timeline/${e.id}`,
              primary: e.title,
              secondary: formatYear(e.year, e.era),
            }))}
          />
        </div>
      </div>

      <CommentSection
        worldId={params.worldId}
        entityType="FACTION"
        entityId={faction.id}
        revalidate={`/worlds/${params.worldId}/factions/${faction.id}`}
      />
    </>
  );
}

function List({
  title,
  items,
  empty,
}: {
  title: string;
  items: { id: string; href: string; primary: string; secondary: string | null }[];
  empty: string;
}) {
  return (
    <section className="card overflow-hidden">
      <h2 className="heading-display border-b border-ink-700/60 px-5 py-3 text-sm">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="px-5 py-4 text-sm text-ink-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-ink-700/60">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between px-5 py-3 text-sm hover:bg-ink-800/50"
              >
                <span className="font-medium text-parchment-50">{item.primary}</span>
                {item.secondary ? (
                  <span className="text-xs text-ink-400">{item.secondary}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
