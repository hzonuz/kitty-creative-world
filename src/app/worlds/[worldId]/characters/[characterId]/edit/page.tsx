import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { CharacterForm } from "@/components/characters/CharacterForm";
import { updateCharacter } from "@/app/actions/characters";
import { tServer } from "@/lib/preferences";

export default async function EditCharacterPage({
  params,
}: {
  params: { worldId: string; characterId: string };
}) {
  const [character, factions, regions] = await Promise.all([
    prisma.character.findUnique({ where: { id: params.characterId } }),
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
  if (!character || character.worldId !== params.worldId) notFound();

  const action = updateCharacter.bind(null, params.worldId, character.id);

  return (
    <>
      <PageHeader
        eyebrow={tServer("common.edit")}
        title={character.name}
      />
      <CharacterForm
        worldId={params.worldId}
        action={action}
        values={character}
        factions={factions}
        regions={regions}
        cancelHref={`/worlds/${params.worldId}/characters/${character.id}`}
      />
    </>
  );
}
