import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { CharacterForm } from "@/components/characters/CharacterForm";
import { createCharacter } from "@/app/actions/characters";
import { tServer } from "@/lib/preferences";

export default async function NewCharacterPage({
  params,
}: {
  params: { worldId: string };
}) {
  const [factions, regions] = await Promise.all([
    prisma.faction.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.region.findMany({
      where: { worldId: params.worldId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const action = createCharacter.bind(null, params.worldId);

  return (
    <>
      <PageHeader
        eyebrow={tServer("character.new.eyebrow")}
        title={tServer("character.new.title")}
        description={tServer("character.new.description")}
      />
      <CharacterForm
        worldId={params.worldId}
        action={action}
        factions={factions}
        regions={regions}
        cancelHref={`/worlds/${params.worldId}/characters`}
      />
    </>
  );
}
