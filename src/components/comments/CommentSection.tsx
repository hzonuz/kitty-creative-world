import { prisma } from "@/lib/prisma";
import { getWorldAccess } from "@/lib/permissions";
import { tServer } from "@/lib/preferences";
import type { CommentEntityName } from "@/lib/comment-entities";
import { CommentList } from "./CommentList";

/**
 * Renders comments for any in-world entity. Read access is implicit (the
 * caller already loaded the entity, meaning the viewer can see the world).
 * Posting requires COMMENTOR or above; editing/deleting follows the rules in
 * `actions/comments.ts`.
 */
export async function CommentSection({
  worldId,
  entityType,
  entityId,
  revalidate,
}: {
  worldId: string;
  entityType: CommentEntityName;
  entityId: string;
  revalidate: string;
}) {
  const [access, comments] = await Promise.all([
    getWorldAccess(worldId),
    prisma.comment.findMany({
      where: { worldId, entityType, entityId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, username: true, displayName: true },
        },
      },
    }),
  ]);

  if (!access) return null;

  const labels = {
    title: tServer("comments.title"),
    count: tServer("comments.count", { n: comments.length }),
    empty: tServer("comments.empty"),
    placeholder: tServer("comments.placeholder"),
    submit: tServer("comments.submit"),
    submitting: tServer("comments.submitting"),
    edit: tServer("comments.edit"),
    delete: tServer("comments.delete"),
    save: tServer("comments.save"),
    cancel: tServer("comments.cancel"),
    deleteConfirm: tServer("comments.deleteConfirm"),
    youLabel: tServer("comments.you"),
    cannotComment: tServer("comments.cannotComment"),
    cannotCommentHint: tServer("comments.cannotCommentHint"),
  };

  return (
    <section
      id={`comments-${entityType.toLowerCase()}-${entityId}`}
      className="card mt-8 overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-ink-700/60 px-5 py-3">
        <h2 className="heading-display text-sm">{labels.title}</h2>
        <span className="text-xs text-ink-400">{labels.count}</span>
      </div>
      <CommentList
        worldId={worldId}
        entityType={entityType}
        entityId={entityId}
        revalidate={revalidate}
        currentUserId={access.user.id}
        canComment={access.canComment}
        canModerate={access.canEdit}
        labels={labels}
        comments={comments.map((c) => ({
          id: c.id,
          body: c.body,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          author: {
            id: c.author.id,
            name: c.author.displayName || c.author.username,
          },
        }))}
      />
    </section>
  );
}
