import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/AppShell";
import { WorldSidebar } from "@/components/shell/WorldSidebar";
import { tServer } from "@/lib/preferences";
import { getWorldAccess } from "@/lib/permissions";
import Link from "next/link";

export default async function WorldLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { worldId: string };
}) {
  const world = await prisma.world.findUnique({
    where: { id: params.worldId },
    select: { id: true, name: true },
  });

  if (!world) notFound();

  const access = await getWorldAccess(world.id);
  if (!access) {
    redirect(`/auth/signin?callbackUrl=/worlds/${world.id}`);
  }

  return (
    <AppShell
      sidebar={
        <WorldSidebar
          worldId={world.id}
          worldName={world.name}
          canManage={access.canManage}
        />
      }
      topRight={
        access.canEdit ? (
          <Link href={`/worlds/${world.id}/edit`} className="btn-ghost">
            {tServer("world.editButton")}
          </Link>
        ) : null
      }
    >
      {children}
    </AppShell>
  );
}
