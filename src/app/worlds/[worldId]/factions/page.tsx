import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { tServer } from "@/lib/preferences";
import { assetUrl } from "@/lib/assetUrl";

export const dynamic = "force-dynamic";

export default async function FactionsPage({
  params,
}: {
  params: { worldId: string };
}) {
  const factions = await prisma.faction.findMany({
    where: { worldId: params.worldId },
    include: { _count: { select: { members: true, regions: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        eyebrow={tServer("factions.eyebrow")}
        title={tServer("factions.title")}
        description={tServer("factions.description")}
        actions={
          <Link href={`/worlds/${params.worldId}/factions/new`} className="btn-primary">
            {tServer("factions.new")}
          </Link>
        }
      />
      {factions.length === 0 ? (
        <EmptyState
          icon="⚔"
          title={tServer("factions.empty.title")}
          description={tServer("factions.empty.description")}
          action={
            <Link href={`/worlds/${params.worldId}/factions/new`} className="btn-primary">
              {tServer("factions.new")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {factions.map((f) => (
            <Link
              key={f.id}
              href={`/worlds/${params.worldId}/factions/${f.id}`}
              className="card card-hover overflow-hidden"
            >
              <div className="relative aspect-[16/8] w-full bg-ink-800">
                {f.banner ? (
                  <Image src={assetUrl(f.banner) ?? ""} alt={f.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-ink-400">
                    ⚔
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent" />
                <div className="absolute bottom-2 start-3 end-3">
                  <h3 className="heading-display text-lg">{f.name}</h3>
                  {f.motto ? (
                    <p className="text-xs italic text-parchment-100/80">"{f.motto}"</p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 px-4 py-3">
                {f.alignment ? <span className="chip">{f.alignment}</span> : null}
                <span className="chip">{tServer("counts.members", { n: f._count.members })}</span>
                <span className="chip">{tServer("counts.regions", { n: f._count.regions })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
