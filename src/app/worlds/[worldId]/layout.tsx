import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/AppShell";
import { WorldSidebar } from "@/components/shell/WorldSidebar";
import { tServer } from "@/lib/preferences";
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

  return (
    <AppShell
      sidebar={<WorldSidebar worldId={world.id} worldName={world.name} />}
      topRight={
        <Link href={`/worlds/${world.id}/edit`} className="btn-ghost">
          {tServer("world.editButton")}
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
