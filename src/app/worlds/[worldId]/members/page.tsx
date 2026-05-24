import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { tServer } from "@/lib/preferences";
import { getWorldAccess } from "@/lib/permissions";
import { MembershipManager } from "@/components/worlds/MembershipManager";

export const dynamic = "force-dynamic";

export default async function WorldMembersPage({
  params,
}: {
  params: { worldId: string };
}) {
  const access = await getWorldAccess(params.worldId);
  if (!access) redirect(`/auth/signin?callbackUrl=/worlds/${params.worldId}/members`);
  if (!access.canManage) {
    redirect(`/worlds/${params.worldId}`);
  }

  const world = await prisma.world.findUnique({
    where: { id: params.worldId },
    include: {
      owner: {
        select: { id: true, username: true, displayName: true, email: true },
      },
      memberships: {
        where: { NOT: { userId: undefined } },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, username: true, displayName: true, email: true },
          },
        },
      },
    },
  });

  if (!world) notFound();

  const collaborators = world.memberships
    .filter((m) => m.userId !== world.ownerId)
    .map((m) => ({
      userId: m.user.id,
      username: m.user.username,
      displayName: m.user.displayName,
      email: m.user.email,
      role: m.role,
    }));

  return (
    <>
      <PageHeader
        eyebrow={tServer("members.eyebrow")}
        title={tServer("members.title")}
        description={tServer("members.description")}
      />

      <div className="card mb-6 p-5">
        <div className="text-xs uppercase tracking-wider text-ink-400">
          {tServer("members.owner")}
        </div>
        <div className="mt-1 font-medium text-parchment-50">
          {world.owner.displayName || world.owner.username}
        </div>
        <div className="text-xs text-ink-400">{world.owner.email}</div>
      </div>

      <MembershipManager
        worldId={world.id}
        collaborators={collaborators}
        labels={{
          inviteTitle: tServer("members.invite.title"),
          inviteDescription: tServer("members.invite.description"),
          identifier: tServer("members.invite.identifier"),
          identifierPlaceholder: tServer("members.invite.identifierPlaceholder"),
          roleLabel: tServer("members.invite.role"),
          submit: tServer("members.invite.submit"),
          submitting: tServer("members.invite.submitting"),
          collaboratorsTitle: tServer("members.collaborators.title"),
          collaboratorsEmpty: tServer("members.collaborators.empty"),
          remove: tServer("members.remove"),
          removeConfirm: tServer("members.removeConfirm"),
          roleViewer: tServer("members.role.viewer"),
          roleCommentor: tServer("members.role.commentor"),
          roleEditor: tServer("members.role.editor"),
          roleOwner: tServer("members.role.owner"),
        }}
      />
    </>
  );
}
