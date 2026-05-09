import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function MapsPage({
  params,
}: {
  params: { worldId: string };
}) {
  const maps = await prisma.worldMap.findMany({
    where: { worldId: params.worldId },
    include: {
      _count: { select: { pins: true, children: true } },
      parent: { select: { id: true, name: true } },
    },
    orderBy: [{ parentMapId: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        eyebrow={tServer("maps.eyebrow")}
        title={tServer("maps.title")}
        description={tServer("maps.description")}
        actions={
          <Link href={`/worlds/${params.worldId}/maps/new`} className="btn-primary">
            {tServer("maps.new")}
          </Link>
        }
      />

      {maps.length === 0 ? (
        <EmptyState
          icon="🗺"
          title={tServer("maps.empty.title")}
          description={tServer("maps.empty.description")}
          action={
            <Link href={`/worlds/${params.worldId}/maps/new`} className="btn-primary">
              {tServer("maps.new")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {maps.map((m) => (
            <Link
              key={m.id}
              href={`/worlds/${params.worldId}/maps/${m.id}`}
              className="card card-hover overflow-hidden"
            >
              <div className="relative aspect-[16/9] w-full bg-ink-800">
                <Image
                  src={m.imagePath}
                  alt={m.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                <div className="absolute bottom-2 start-3 end-3">
                  <h3 className="heading-display text-lg">{m.name}</h3>
                  {m.parent ? (
                    <p className="text-xs text-parchment-100/70">
                      ⬑ {tServer("map.region.eyebrow.parent", { name: m.parent.name })}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 px-4 py-3">
                <span className="chip">{tServer("counts.pins", { n: m._count.pins })}</span>
                {m._count.children > 0 ? (
                  <span className="chip">{tServer("counts.subMaps", { n: m._count.children })}</span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
