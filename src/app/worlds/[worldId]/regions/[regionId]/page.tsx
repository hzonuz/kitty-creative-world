import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeleteButton } from "@/components/shell/DeleteButton";
import { deleteRegion } from "@/app/actions/regions";
import { formatYear } from "@/lib/slug";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function RegionDetailPage({
  params,
}: {
  params: { worldId: string; regionId: string };
}) {
  const region = await prisma.region.findUnique({
    where: { id: params.regionId },
    include: {
      ruler: true,
      factions: { include: { faction: true } },
      characters: { orderBy: { name: "asc" } },
      events: { orderBy: { year: "asc" } },
      maps: true,
      wikiLinks: true,
    },
  });
  if (!region || region.worldId !== params.worldId) notFound();

  const remove = deleteRegion.bind(null, params.worldId, region.id);
  const base = `/worlds/${params.worldId}`;

  return (
    <>
      <PageHeader
        eyebrow={tServer("nav.regions")}
        title={region.name}
        description={region.description ?? undefined}
        actions={
          <>
            <Link href={`${base}/regions/${region.id}/edit`} className="btn-ghost">
              {tServer("common.edit")}
            </Link>
            <DeleteButton
              action={remove}
              redirectTo={`${base}/regions`}
              confirmText={tServer("region.deleteConfirm", { name: region.name })}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card space-y-4 p-5 lg:col-span-1">
          <Field
            label={tServer("region.label.ruler")}
            value={
              region.ruler ? (
                <Link
                  className="text-rune-300 hover:text-rune-400"
                  href={`${base}/characters/${region.ruler.id}`}
                >
                  {region.ruler.name}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <Field label={tServer("region.label.resources")} value={region.resources ?? "—"} />
          <Field label={tServer("region.label.settlements")} value={region.settlements ?? "—"} />
          <div>
            <div className="section-title mb-2">{tServer("region.label.factionsPresent")}</div>
            <div className="flex flex-wrap gap-1.5">
              {region.factions.length === 0 ? (
                <span className="text-xs text-ink-400">{tServer("region.label.factionsNone")}</span>
              ) : (
                region.factions.map((rf) => (
                  <Link
                    key={rf.factionId}
                    href={`${base}/factions/${rf.factionId}`}
                    className="chip hover:border-rune-500/60 hover:text-rune-300"
                  >
                    {rf.faction.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <SimpleList
            title={tServer("region.charsHere")}
            empty={tServer("region.empty.chars")}
            items={region.characters.map((c) => ({
              id: c.id,
              href: `${base}/characters/${c.id}`,
              primary: c.name,
              secondary: c.title ?? c.status ?? null,
            }))}
          />
          <SimpleList
            title={tServer("region.eventsHere")}
            empty={tServer("region.empty.events")}
            items={region.events.map((e) => ({
              id: e.id,
              href: `${base}/timeline/${e.id}`,
              primary: e.title,
              secondary: formatYear(e.year, e.era),
            }))}
          />
          <SimpleList
            title={tServer("region.maps")}
            empty={tServer("region.empty.maps")}
            items={region.maps.map((m) => ({
              id: m.id,
              href: `${base}/maps/${m.id}`,
              primary: m.name,
              secondary: m.description ?? null,
            }))}
          />
          <SimpleList
            title={tServer("region.linkedWiki")}
            empty={tServer("region.empty.wiki")}
            items={region.wikiLinks.map((w) => ({
              id: w.id,
              href: `${base}/wiki/${w.slug}`,
              primary: w.title,
              secondary: w.category,
            }))}
          />
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="section-title">{label}</div>
      <div className="text-sm text-parchment-50">{value}</div>
    </div>
  );
}

function SimpleList({
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
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ink-800/50"
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
