import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { createFamilyTree } from "@/app/actions/family";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function FamilyTreesPage({
  params,
}: {
  params: { worldId: string };
}) {
  const trees = await prisma.familyTree.findMany({
    where: { worldId: params.worldId },
    include: { _count: { select: { members: true, edges: true } } },
    orderBy: { name: "asc" },
  });

  const action = createFamilyTree.bind(null, params.worldId);

  return (
    <>
      <PageHeader
        eyebrow={tServer("family.eyebrow")}
        title={tServer("family.title")}
        description={tServer("family.description")}
      />

      <form action={action} className="card mb-6 flex flex-col gap-3 p-5 sm:flex-row">
        <input
          className="input flex-1"
          name="name"
          required
          placeholder={tServer("family.namePlaceholder")}
        />
        <input
          className="input flex-[2]"
          name="description"
          placeholder={tServer("family.descriptionPlaceholder")}
        />
        <button type="submit" className="btn-primary">
          {tServer("family.create")}
        </button>
      </form>

      {trees.length === 0 ? (
        <EmptyState
          icon="🌳"
          title={tServer("family.empty.title")}
          description={tServer("family.empty.description")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trees.map((t) => (
            <Link
              key={t.id}
              href={`/worlds/${params.worldId}/family/${t.id}`}
              className="card card-hover p-5"
            >
              <h3 className="heading-display text-lg">{t.name}</h3>
              {t.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-parchment-100/70">
                  {t.description}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="chip">
                  {tServer("counts.members", { n: t._count.members })}
                </span>
                <span className="chip">
                  {tServer("counts.ties", { n: t._count.edges })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
