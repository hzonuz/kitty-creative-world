import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeleteButton } from "@/components/shell/DeleteButton";
import { deleteCharacter } from "@/app/actions/characters";
import { formatYear } from "@/lib/slug";
import { tServer } from "@/lib/preferences";
import { assetUrl } from "@/lib/assetUrl";
import { CommentSection } from "@/components/comments/CommentSection";
import { getWorldAccess } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function CharacterDetailPage({
  params,
}: {
  params: { worldId: string; characterId: string };
}) {
  const character = await prisma.character.findUnique({
    where: { id: params.characterId },
    include: {
      faction: true,
      currentRegion: true,
      events: { orderBy: { year: "asc" } },
      parentLinks: {
        include: {
          tree: { select: { id: true, name: true } },
        },
      },
    },
  });
  if (!character || character.worldId !== params.worldId) notFound();

  const access = await getWorldAccess(params.worldId);
  const remove = deleteCharacter.bind(null, params.worldId, character.id);
  const base = `/worlds/${params.worldId}`;

  return (
    <>
      <PageHeader
        eyebrow={tServer("nav.characters")}
        title={character.name}
        description={character.title ?? undefined}
        actions={
          access?.canEdit ? (
            <>
              <Link
                href={`${base}/characters/${character.id}/edit`}
                className="btn-ghost"
              >
                {tServer("common.edit")}
              </Link>
              <DeleteButton
                action={remove}
                redirectTo={`${base}/characters`}
                confirmText={tServer("character.deleteConfirm", {
                  name: character.name,
                })}
              />
            </>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-1">
          <div className="relative aspect-[4/5] w-full bg-ink-800">
            {character.portrait ? (
              <Image
                src={assetUrl(character.portrait) ?? ""}
                alt={character.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl text-ink-400">
                👤
              </div>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-3 px-5 py-4 text-sm">
            <Field label={tServer("character.label.status")} value={character.status ?? "—"} />
            <Field
              label={tServer("character.label.birth")}
              value={character.birthYear != null ? String(character.birthYear) : "—"}
            />
            <Field
              label={tServer("character.label.death")}
              value={character.deathYear != null ? String(character.deathYear) : "—"}
            />
            <Field
              label={tServer("character.label.faction")}
              value={
                character.faction ? (
                  <Link
                    className="text-rune-300 hover:text-rune-400"
                    href={`${base}/factions/${character.faction.id}`}
                  >
                    {character.faction.name}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
            <Field
              label={tServer("character.label.location")}
              value={
                character.currentRegion ? (
                  <Link
                    className="text-rune-300 hover:text-rune-400"
                    href={`${base}/regions/${character.currentRegion.id}`}
                  >
                    {character.currentRegion.name}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
          </dl>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {character.biography ? (
            <Card title={tServer("character.section.biography")}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-parchment-100/90">
                {character.biography}
              </p>
            </Card>
          ) : null}

          {character.notes ? (
            <Card title={tServer("character.section.notes")}>
              <p className="whitespace-pre-line text-sm text-parchment-100/80">
                {character.notes}
              </p>
            </Card>
          ) : null}

          <Card
            title={tServer("character.linkedEvents", { n: character.events.length })}
          >
            {character.events.length === 0 ? (
              <p className="text-sm text-ink-400">{tServer("character.noEvents")}</p>
            ) : (
              <ul className="space-y-2">
                {character.events.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-ink-700/60 bg-ink-900/50 px-3 py-2"
                  >
                    <Link
                      href={`${base}/timeline/${e.id}`}
                      className="text-sm text-parchment-50 hover:text-rune-300"
                    >
                      {e.title}
                    </Link>
                    <span className="text-xs text-ink-400">
                      {formatYear(e.year, e.era)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title={tServer("character.familyTrees", { n: character.parentLinks.length })}
          >
            {character.parentLinks.length === 0 ? (
              <p className="text-sm text-ink-400">{tServer("character.noFamily")}</p>
            ) : (
              <ul className="space-y-2">
                {character.parentLinks.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`${base}/family/${m.tree.id}`}
                      className="text-sm text-rune-300 hover:text-rune-400"
                    >
                      {m.tree.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <CommentSection
        worldId={params.worldId}
        entityType="CHARACTER"
        entityId={character.id}
        revalidate={`/worlds/${params.worldId}/characters/${character.id}`}
      />
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="heading-display border-b border-ink-700/60 px-5 py-3 text-sm">
        {title}
      </h2>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
