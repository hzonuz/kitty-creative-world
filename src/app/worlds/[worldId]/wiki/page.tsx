import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { WikiSearch } from "@/components/wiki/WikiSearch";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default async function WikiPage({
  params,
}: {
  params: { worldId: string };
}) {
  const pages = await prisma.wikiPage.findMany({
    where: { worldId: params.worldId },
    orderBy: [{ category: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      tags: true,
      updatedAt: true,
    },
  });

  return (
    <>
      <PageHeader
        eyebrow={tServer("wiki.eyebrow")}
        title={tServer("wiki.title")}
        description={tServer("wiki.description")}
        actions={
          <Link href={`/worlds/${params.worldId}/wiki/new`} className="btn-primary">
            {tServer("wiki.new")}
          </Link>
        }
      />

      {pages.length === 0 ? (
        <EmptyState
          icon="📖"
          title={tServer("wiki.empty.title")}
          description={tServer("wiki.empty.description")}
          action={
            <Link href={`/worlds/${params.worldId}/wiki/new`} className="btn-primary">
              {tServer("wiki.new")}
            </Link>
          }
        />
      ) : (
        <WikiSearch worldId={params.worldId} pages={pages} />
      )}
    </>
  );
}
