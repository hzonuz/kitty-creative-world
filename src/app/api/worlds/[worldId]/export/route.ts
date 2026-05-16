import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchWorldBundle, buildWorldZip, slugifyFilename } from "@/lib/world-bundle";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { worldId: string } },
) {
  const world = await prisma.world.findUnique({
    where: { id: params.worldId },
    select: { id: true, name: true },
  });

  if (!world) {
    return NextResponse.json({ error: "World not found" }, { status: 404 });
  }

  try {
    const bundle = await fetchWorldBundle(world.id);
    const zip = await buildWorldZip(bundle);
    const filename = `${slugifyFilename(world.name)}.kcworld.zip`;

    return new NextResponse(new Uint8Array(zip), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("World export failed:", err);
    return NextResponse.json(
      { error: "Export failed. Check server logs." },
      { status: 500 },
    );
  }
}
