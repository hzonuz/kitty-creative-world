"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { requireWorldAccess } from "@/lib/permissions";
import { parseCommentEntity } from "@/lib/comment-entities";

const MAX_BODY = 4000;

export type CommentActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createComment(
  worldId: string,
  formData: FormData,
): Promise<CommentActionResult> {
  await requireWorldAccess(worldId, "commentor");
  const user = await requireUser();

  const entityType = parseCommentEntity(formData.get("entityType"));
  const entityId = String(formData.get("entityId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const revalidate = String(formData.get("revalidate") ?? "").trim();

  if (!entityType || !entityId) {
    return { ok: false, error: "Invalid comment target" };
  }
  if (!body) return { ok: false, error: "Comment cannot be empty" };
  if (body.length > MAX_BODY) {
    return { ok: false, error: `Comments must be under ${MAX_BODY} characters` };
  }

  await prisma.comment.create({
    data: {
      worldId,
      authorId: user.id,
      entityType,
      entityId,
      body,
    },
  });

  if (revalidate) revalidatePath(revalidate);
  return { ok: true };
}

export async function updateComment(
  worldId: string,
  commentId: string,
  formData: FormData,
): Promise<CommentActionResult> {
  const access = await requireWorldAccess(worldId, "commentor");
  const body = String(formData.get("body") ?? "").trim();
  const revalidate = String(formData.get("revalidate") ?? "").trim();

  if (!body) return { ok: false, error: "Comment cannot be empty" };
  if (body.length > MAX_BODY) {
    return { ok: false, error: `Comments must be under ${MAX_BODY} characters` };
  }

  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, worldId: true },
  });
  if (!existing || existing.worldId !== worldId) {
    return { ok: false, error: "Comment not found" };
  }

  const isOwnComment = existing.authorId === access.user.id;
  if (!isOwnComment && !access.canEdit) {
    return { ok: false, error: "Only the author or an editor can edit a comment" };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { body },
  });
  if (revalidate) revalidatePath(revalidate);
  return { ok: true };
}

export async function deleteComment(
  worldId: string,
  commentId: string,
  revalidate?: string,
): Promise<CommentActionResult> {
  const access = await requireWorldAccess(worldId, "commentor");

  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, worldId: true },
  });
  if (!existing || existing.worldId !== worldId) {
    return { ok: false, error: "Comment not found" };
  }

  const isOwnComment = existing.authorId === access.user.id;
  if (!isOwnComment && !access.canEdit) {
    return { ok: false, error: "Only the author, an editor, or the owner can delete" };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  if (revalidate) revalidatePath(revalidate);
  return { ok: true };
}
