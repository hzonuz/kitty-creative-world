import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function CharactersPage({
  params,
}: {
  params: { worldId: string };
}) {
  const characters = await prisma.character.findMany({
    where: { worldId: params.worldId },
    include: { faction: true, currentRegion: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        eyebrow={tServer("characters.eyebrow")}
        title={tServer("characters.title")}
        description={tServer("characters.description")}
        actions={
          <Link
            href={`/worlds/${params.worldId}/characters/new`}
            className="btn-primary"
          >
            {tServer("characters.new")}
          </Link>
        }
      />

      {characters.length === 0 ? (
        <EmptyState
          icon="👤"
          title={tServer("characters.empty.title")}
          description={tServer("characters.empty.description")}
          action={
            <Link
              href={`/worlds/${params.worldId}/characters/new`}
              className="btn-primary"
            >
              {tServer("characters.new")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c) => (
            <Link
              key={c.id}
              href={`/worlds/${params.worldId}/characters/${c.id}`}
              className="card card-hover flex gap-4 overflow-hidden p-4"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-ink-700 bg-ink-800">
                {c.portrait ? (
                  <Image src={c.portrait} alt={c.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-ink-400">
                    👤
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="heading-display truncate text-lg">{c.name}</div>
                {c.title ? (
                  <div className="truncate text-xs text-parchment-100/70">
                    {c.title}
                  </div>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.status ? <span className="chip">{c.status}</span> : null}
                  {c.faction ? <span className="chip">{c.faction.name}</span> : null}
                  {c.currentRegion ? (
                    <span className="chip">📍 {c.currentRegion.name}</span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
