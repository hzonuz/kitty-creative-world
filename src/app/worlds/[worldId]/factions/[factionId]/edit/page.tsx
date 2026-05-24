import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { FactionForm } from "@/components/factions/FactionForm";
import { updateFaction } from "@/app/actions/factions";
import { tServer } from "@/lib/preferences";
import { requirePageEdit } from "@/lib/permissions";

export default async function EditFactionPage({
  params,
}: {
  params: { worldId: string; factionId: string };
}) {
  await requirePageEdit(params.worldId);
  const faction = await prisma.faction.findUnique({ where: { id: params.factionId } });
  if (!faction || faction.worldId !== params.worldId) notFound();
  const action = updateFaction.bind(null, params.worldId, faction.id);
  return (
    <>
      <PageHeader eyebrow={tServer("common.edit")} title={faction.name} />
      <FactionForm
        action={action}
        values={faction}
        cancelHref={`/worlds/${params.worldId}/factions/${faction.id}`}
      />
    </>
  );
}
