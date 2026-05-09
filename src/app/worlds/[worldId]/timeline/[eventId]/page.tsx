import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeleteButton } from "@/components/shell/DeleteButton";
import { deleteEvent } from "@/app/actions/timeline";
import { formatYear } from "@/lib/slug";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: { worldId: string; eventId: string };
}) {
  const event = await prisma.timelineEvent.findUnique({
    where: { id: params.eventId },
    include: {
      region: true,
      faction: true,
      characters: true,
      wikiLinks: true,
    },
  });
  if (!event || event.worldId !== params.worldId) notFound();

  const remove = deleteEvent.bind(null, params.worldId, event.id);
  const base = `/worlds/${params.worldId}`;

  return (
    <>
      <PageHeader
        eyebrow={`${formatYear(event.year, event.era)}${event.category ? ` · ${event.category}` : ""}`}
        title={event.title}
        actions={
          <>
            <Link href={`${base}/timeline/${event.id}/edit`} className="btn-ghost">
              {tServer("common.edit")}
            </Link>
            <DeleteButton
              action={remove}
              redirectTo={`${base}/timeline`}
              confirmText={tServer("event.deleteConfirm", { name: event.title })}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="card px-6 py-5 lg:col-span-2">
          {event.description ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-parchment-100/90">
              {event.description}
            </p>
          ) : (
            <p className="text-sm italic text-ink-400">
              {tServer("event.empty.description")}
            </p>
          )}
        </article>

        <aside className="space-y-4 lg:col-span-1">
          <SidePanel title={tServer("event.section.region")}>
            {event.region ? (
              <Link
                href={`${base}/regions/${event.region.id}`}
                className="text-rune-300 hover:text-rune-400"
              >
                {event.region.name}
              </Link>
            ) : (
              <span className="text-xs text-ink-400">—</span>
            )}
          </SidePanel>
          <SidePanel title={tServer("event.section.faction")}>
            {event.faction ? (
              <Link
                href={`${base}/factions/${event.faction.id}`}
                className="text-rune-300 hover:text-rune-400"
              >
                {event.faction.name}
              </Link>
            ) : (
              <span className="text-xs text-ink-400">—</span>
            )}
          </SidePanel>
          <SidePanel title={tServer("event.section.characters")}>
            {event.characters.length === 0 ? (
              <span className="text-xs text-ink-400">—</span>
            ) : (
              <div className="flex flex-col gap-1.5">
                {event.characters.map((c) => (
                  <Link
                    key={c.id}
                    href={`${base}/characters/${c.id}`}
                    className="text-sm text-rune-300 hover:text-rune-400"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </SidePanel>
          <SidePanel title={tServer("event.section.wiki")}>
            {event.wikiLinks.length === 0 ? (
              <span className="text-xs text-ink-400">—</span>
            ) : (
              <div className="flex flex-col gap-1.5">
                {event.wikiLinks.map((w) => (
                  <Link
                    key={w.id}
                    href={`${base}/wiki/${w.slug}`}
                    className="text-sm text-rune-300 hover:text-rune-400"
                  >
                    {w.title}
                  </Link>
                ))}
              </div>
            )}
          </SidePanel>
        </aside>
      </div>
    </>
  );
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <h3 className="heading-display border-b border-ink-700/60 px-4 py-2 text-xs">
        {title}
      </h3>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}
