import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { WikiForm } from "@/components/wiki/WikiForm";
import { updateWikiPage } from "@/app/actions/wiki";
import { tServer } from "@/lib/preferences";
import { requirePageEdit } from "@/lib/permissions";

export default async function EditWikiPage({
  params,
}: {
  params: { worldId: string; slug: string };
}) {
  await requirePageEdit(params.worldId);
  const page = await prisma.wikiPage.findUnique({
    where: { worldId_slug: { worldId: params.worldId, slug: params.slug } },
  });
  if (!page) notFound();
  const action = updateWikiPage.bind(null, params.worldId, page.id);
  return (
    <>
      <PageHeader eyebrow={tServer("common.edit")} title={page.title} />
      <WikiForm
        action={action}
        values={page}
        cancelHref={`/worlds/${params.worldId}/wiki/${page.slug}`}
      />
    </>
  );
}
