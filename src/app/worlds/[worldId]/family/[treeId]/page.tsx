import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeleteButton } from "@/components/shell/DeleteButton";
import { FamilyFlow } from "@/components/family/FamilyFlow";
import {
  addFamilyEdge,
  addFamilyMember,
  deleteFamilyTree,
  removeFamilyEdge,
  removeFamilyMember,
} from "@/app/actions/family";
import { tServer } from "@/lib/preferences";
import { assetUrl } from "@/lib/assetUrl";
import { CommentSection } from "@/components/comments/CommentSection";
import { getWorldAccess } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function FamilyTreePage({
  params,
}: {
  params: { worldId: string; treeId: string };
}) {
  const tree = await prisma.familyTree.findUnique({
    where: { id: params.treeId },
    include: {
      members: {
        include: { character: true },
        orderBy: { character: { name: "asc" } },
      },
      edges: true,
    },
  });
  if (!tree || tree.worldId !== params.worldId) notFound();

  const access = await getWorldAccess(params.worldId);
  const canEdit = !!access?.canEdit;
  const allCharacters = await prisma.character.findMany({
    where: { worldId: params.worldId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const inTree = new Set(tree.members.map((m) => m.characterId));
  const addable = allCharacters.filter((c) => !inTree.has(c.id));

  const remove = deleteFamilyTree.bind(null, params.worldId, tree.id);
  const addMember = addFamilyMember.bind(null, params.worldId, tree.id);
  const addEdge = addFamilyEdge.bind(null, params.worldId, tree.id);

  const flowMembers = tree.members.map((m) => ({
    id: m.id,
    characterId: m.characterId,
    name: m.character.name,
    portrait: assetUrl(m.character.portrait),
    birthYear: m.character.birthYear,
    deathYear: m.character.deathYear,
    x: m.x,
    y: m.y,
  }));

  return (
    <>
      <PageHeader
        eyebrow={tServer("nav.familyTrees")}
        title={tree.name}
        description={tree.description ?? undefined}
        actions={
          canEdit ? (
            <DeleteButton
              action={remove}
              redirectTo={`/worlds/${params.worldId}/family`}
              confirmText={tServer("family.deleteConfirm", { name: tree.name })}
            />
          ) : null
        }
      />

      {flowMembers.length === 0 ? (
        <div className="card mb-6 p-6 text-sm text-ink-400">
          {tServer("family.empty.tree")}
        </div>
      ) : (
        <div className="mb-6">
          <FamilyFlow
            worldId={params.worldId}
            treeId={tree.id}
            members={flowMembers}
            edges={tree.edges.map((e) => ({
              id: e.id,
              fromId: e.fromId,
              toId: e.toId,
              type: e.type,
            }))}
          />
          <p className="mt-2 text-xs text-ink-400">
            {tServer("family.dragHint")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <h2 className="heading-display border-b border-ink-700/60 px-5 py-3 text-sm">
            {tServer("family.section.members")}
          </h2>
          {canEdit ? (
            <form action={addMember} className="flex gap-2 border-b border-ink-700/60 p-4">
              <select className="input flex-1" name="characterId" required>
                <option value="">{tServer("family.addMember")}</option>
                {addable.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button className="btn-primary" type="submit" disabled={addable.length === 0}>
                {tServer("family.add")}
              </button>
            </form>
          ) : null}
          {tree.members.length === 0 ? (
            <p className="px-5 py-4 text-sm text-ink-400">{tServer("family.empty.members")}</p>
          ) : (
            <ul className="divide-y divide-ink-700/60">
              {tree.members.map((m) => {
                const removeMem = removeFamilyMember.bind(
                  null,
                  params.worldId,
                  tree.id,
                  m.id,
                );
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between px-5 py-3 text-sm"
                  >
                    <Link
                      href={`/worlds/${params.worldId}/characters/${m.characterId}`}
                      className="text-parchment-50 hover:text-rune-300"
                    >
                      {m.character.name}
                    </Link>
                    {canEdit ? (
                      <DeleteButton
                        action={removeMem}
                        label={tServer("family.remove")}
                        confirmText={tServer("family.removeMemberConfirm", {
                          name: m.character.name,
                        })}
                        className="text-xs text-blood-500 hover:underline"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card overflow-hidden">
          <h2 className="heading-display border-b border-ink-700/60 px-5 py-3 text-sm">
            {tServer("family.section.relationships")}
          </h2>
          {canEdit ? (
            <form
              action={addEdge}
              className="grid grid-cols-1 gap-2 border-b border-ink-700/60 p-4 sm:grid-cols-4"
            >
              <select className="input sm:col-span-1" name="type" defaultValue="parent">
                <option value="parent">{tServer("family.relation.parent")}</option>
                <option value="spouse">{tServer("family.relation.spouse")}</option>
              </select>
              <select className="input sm:col-span-1" name="fromId" required>
                <option value="">{tServer("family.from")}</option>
                {tree.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.character.name}</option>
                ))}
              </select>
              <select className="input sm:col-span-1" name="toId" required>
                <option value="">{tServer("family.to")}</option>
                {tree.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.character.name}</option>
                ))}
              </select>
              <button className="btn-primary sm:col-span-1" type="submit">
                {tServer("family.link")}
              </button>
            </form>
          ) : null}
          {tree.edges.length === 0 ? (
            <p className="px-5 py-4 text-sm text-ink-400">{tServer("family.empty.relations")}</p>
          ) : (
            <ul className="divide-y divide-ink-700/60">
              {tree.edges.map((e) => {
                const from = tree.members.find((m) => m.id === e.fromId);
                const to = tree.members.find((m) => m.id === e.toId);
                const removeE = removeFamilyEdge.bind(
                  null,
                  params.worldId,
                  tree.id,
                  e.id,
                );
                return (
                  <li
                    key={e.id}
                    className="flex items-center justify-between px-5 py-3 text-sm"
                  >
                    <span>
                      {from?.character.name}{" "}
                      <span className="mx-1 text-ink-400">
                        {e.type === "spouse"
                          ? tServer("family.relation.spouseLabel")
                          : tServer("family.relation.parentLabel")}
                      </span>{" "}
                      {to?.character.name}
                    </span>
                    {canEdit ? (
                      <DeleteButton
                        action={removeE}
                        label={tServer("family.remove")}
                        confirmText={tServer("family.removeConfirm")}
                        className="text-xs text-blood-500 hover:underline"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <CommentSection
        worldId={params.worldId}
        entityType="FAMILY_TREE"
        entityId={tree.id}
        revalidate={`/worlds/${params.worldId}/family/${tree.id}`}
      />
    </>
  );
}
