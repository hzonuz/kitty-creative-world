import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeleteButton } from "@/components/shell/DeleteButton";
import { deleteWikiPage } from "@/app/actions/wiki";
import { parseTags } from "@/lib/wiki";
import { tServer } from "@/lib/preferences";
import type { TKey } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function WikiPageView({
  params,
}: {
  params: { worldId: string; slug: string };
}) {
  const page = await prisma.wikiPage.findUnique({
    where: { worldId_slug: { worldId: params.worldId, slug: params.slug } },
    include: {
      characters: true,
      regions: true,
      factions: true,
      events: true,
      outgoingLinks: { include: { to: true } },
      incomingLinks: { include: { from: true } },
    },
  });
  if (!page) notFound();

  const remove = deleteWikiPage.bind(null, params.worldId, page.id);
  const base = `/worlds/${params.worldId}`;
  const tags = parseTags(page.tags);

  return (
    <>
      <PageHeader
        eyebrow={tServer(`wiki.cat.${page.category}` as TKey)}
        title={page.title}
        actions={
          <>
            <Link href={`${base}/wiki/${page.slug}/edit`} className="btn-ghost">
              {tServer("common.edit")}
            </Link>
            <DeleteButton
              action={remove}
              redirectTo={`${base}/wiki`}
              confirmText={tServer("wiki.deleteConfirm", { name: page.title })}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="card px-6 py-6 lg:col-span-2">
          {tags.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="chip">#{t}</span>
              ))}
            </div>
          ) : null}
          <div
            className="wiki-content"
            dangerouslySetInnerHTML={{
              __html:
                page.content || `<p><em>${tServer("wiki.empty.page")}</em></p>`,
            }}
          />
        </article>

        <aside className="space-y-4 lg:col-span-1">
          <SidePanel title={tServer("wiki.side.characters")} empty={tServer("wiki.side.noLinks")}>
            {page.characters.map((c) => (
              <Link key={c.id} href={`${base}/characters/${c.id}`} className="link-row">
                {c.name}
              </Link>
            ))}
          </SidePanel>
          <SidePanel title={tServer("wiki.side.regions")} empty={tServer("wiki.side.noLinks")}>
            {page.regions.map((r) => (
              <Link key={r.id} href={`${base}/regions/${r.id}`} className="link-row">
                {r.name}
              </Link>
            ))}
          </SidePanel>
          <SidePanel title={tServer("wiki.side.factions")} empty={tServer("wiki.side.noLinks")}>
            {page.factions.map((f) => (
              <Link key={f.id} href={`${base}/factions/${f.id}`} className="link-row">
                {f.name}
              </Link>
            ))}
          </SidePanel>
          <SidePanel title={tServer("wiki.side.events")} empty={tServer("wiki.side.noLinks")}>
            {page.events.map((e) => (
              <Link key={e.id} href={`${base}/timeline/${e.id}`} className="link-row">
                {e.title}
              </Link>
            ))}
          </SidePanel>
          <SidePanel title={tServer("wiki.side.linkedPages")} empty={tServer("wiki.side.none")}>
            {page.outgoingLinks.map((l) => (
              <Link key={l.id} href={`${base}/wiki/${l.to.slug}`} className="link-row">
                → {l.to.title}
              </Link>
            ))}
            {page.incomingLinks.map((l) => (
              <Link key={l.id} href={`${base}/wiki/${l.from.slug}`} className="link-row">
                ← {l.from.title}
              </Link>
            ))}
          </SidePanel>
        </aside>
      </div>
    </>
  );
}

function SidePanel({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const arr = Array.isArray(children) ? children : [children];
  const hasItems = arr.flat().filter(Boolean).length > 0;
  return (
    <section className="card overflow-hidden">
      <h3 className="heading-display border-b border-ink-700/60 px-4 py-2 text-xs">
        {title}
      </h3>
      <div className="flex flex-col">
        {hasItems ? (
          <div className="flex flex-col">
            {arr.map((c, i) => (
              <div
                key={i}
                className="border-b border-ink-700/40 px-4 py-2 text-sm last:border-b-0 [&_.link-row]:block [&_.link-row]:text-rune-300 [&_.link-row]:hover:text-rune-400"
              >
                {c}
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-3 text-xs text-ink-400">{empty}</p>
        )}
      </div>
    </section>
  );
}
