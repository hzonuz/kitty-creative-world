import { PageHeader } from "@/components/shell/PageHeader";
import { WikiForm } from "@/components/wiki/WikiForm";
import { createWikiPage } from "@/app/actions/wiki";
import { tServer } from "@/lib/preferences";

export default function NewWikiPage({
  params,
}: {
  params: { worldId: string };
}) {
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
