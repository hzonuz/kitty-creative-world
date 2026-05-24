import { PageHeader } from "@/components/shell/PageHeader";
import { WikiForm } from "@/components/wiki/WikiForm";
import { createWikiPage } from "@/app/actions/wiki";
import { tServer } from "@/lib/preferences";
import { requirePageEdit } from "@/lib/permissions";

export default async function NewWikiPage({
  params,
}: {
  params: { worldId: string };
}) {
  await requirePageEdit(params.worldId);
  const action = createWikiPage.bind(null, params.worldId);
  return (
    <>
      <PageHeader
        eyebrow={tServer("event.new.eyebrow")}
        title={tServer("wiki.new")}
      />
      <WikiForm action={action} cancelHref={`/worlds/${params.worldId}/wiki`} />
    </>
  );
}
