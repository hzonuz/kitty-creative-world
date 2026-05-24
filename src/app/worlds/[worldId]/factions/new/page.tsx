import { PageHeader } from "@/components/shell/PageHeader";
import { FactionForm } from "@/components/factions/FactionForm";
import { createFaction } from "@/app/actions/factions";
import { tServer } from "@/lib/preferences";
import { requirePageEdit } from "@/lib/permissions";

export default async function NewFactionPage({
  params,
}: {
  params: { worldId: string };
}) {
  await requirePageEdit(params.worldId);
  const action = createFaction.bind(null, params.worldId);
  return (
    <>
      <PageHeader
        eyebrow={tServer("faction.new.eyebrow")}
        title={tServer("faction.new.title")}
      />
      <FactionForm action={action} cancelHref={`/worlds/${params.worldId}/factions`} />
    </>
  );
}
