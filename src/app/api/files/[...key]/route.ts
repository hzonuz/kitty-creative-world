import { NextResponse } from "next/server";
import {
  ensureBucket,
  getObjectBuffer,
  guessMimeFromKey,
} from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { getWorldAccess } from "@/lib/permissions";

export const dynamic = "force-dynamic";

async function authorize(key: string): Promise<{ ok: true } | { ok: false; status: number }> {
  if (key.startsWith("worlds/")) {
    const parts = key.split("/");
    const worldId = parts[1];
    if (!worldId) return { ok: false, status: 400 };
    const access = await getWorldAccess(worldId);
    if (!access) return { ok: false, status: 403 };
    return { ok: true };
  }
  if (key.startsWith("users/")) {
    const user = await getCurrentUser();
    if (!user) return { ok: false, status: 401 };
    return { ok: true };
  }
  if (key.startsWith("public/")) {
    return { ok: true };
  }
  // Default deny: keys outside of known prefixes require authentication.
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401 };
  return { ok: true };
}

export async function GET(
  _request: Request,
  { params }: { params: { key: string[] } },
) {
  const key = params.key.map((p) => decodeURIComponent(p)).join("/");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const auth = await authorize(key);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status },
    );
  }

  try {
    await ensureBucket();
    const buffer = await getObjectBuffer(key);
    if (!buffer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": guessMimeFromKey(key),
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Asset fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to load asset" },
      { status: 500 },
    );
  }
}
