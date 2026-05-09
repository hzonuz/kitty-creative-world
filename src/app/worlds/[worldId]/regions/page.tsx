import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function RegionsPage({
  params,
}: {
  params: { worldId: string };
}) {
  const regions = await prisma.region.findMany({
    where: { worldId: params.worldId },
    include: {
      ruler: true,
      factions: { include: { faction: true } },
      _count: { select: { events: true, characters: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        eyebrow={tServer("regions.eyebrow")}
        title={tServer("regions.title")}
        description={tServer("regions.description")}
        actions={
          <Link
            href={`/worlds/${params.worldId}/regions/new`}
            className="btn-primary"
          >
            {tServer("regions.new")}
          </Link>
        }
      />

      {regions.length === 0 ? (
        <EmptyState
          icon="⛰"
          title={tServer("regions.empty.title")}
          description={tServer("regions.empty.description")}
          action={
            <Link
              href={`/worlds/${params.worldId}/regions/new`}
              className="btn-primary"
            >
              {tServer("regions.new")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {regions.map((r) => (
            <Link
              key={r.id}
              href={`/worlds/${params.worldId}/regions/${r.id}`}
              className="card card-hover flex flex-col gap-3 p-5"
            >
              <div>
                <h3 className="heading-display text-lg">{r.name}</h3>
                {r.ruler ? (
                  <p className="text-xs text-parchment-100/70">
                    {tServer("region.ruledBy", { name: r.ruler.name })}
                  </p>
                ) : null}
              </div>
              {r.description ? (
                <p className="line-clamp-3 text-sm text-parchment-100/80">
                  {r.description}
                </p>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {r.factions.slice(0, 4).map((rf) => (
                  <span key={rf.factionId} className="chip">
                    {rf.faction.name}
                  </span>
                ))}
                <span className="chip">
                  {tServer("counts.chars", { n: r._count.characters })}
                </span>
                <span className="chip">
                  {tServer("counts.events", { n: r._count.events })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
