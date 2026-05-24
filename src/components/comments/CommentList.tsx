"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createComment,
  deleteComment,
  updateComment,
} from "@/app/actions/comments";
import type { CommentEntityName } from "@/lib/comment-entities";
import { cn } from "@/lib/cn";

export type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string };
};

export type CommentLabels = {
  empty: string;
  placeholder: string;
  submit: string;
  submitting: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  deleteConfirm: string;
  youLabel: string;
  cannotComment: string;
  cannotCommentHint: string;
};

export function CommentList({
  worldId,
  entityType,
  entityId,
  revalidate,
  currentUserId,
  canComment,
  canModerate,
  comments,
  labels,
}: {
  worldId: string;
  entityType: CommentEntityName;
  entityId: string;
  revalidate: string;
  currentUserId: string;
  canComment: boolean;
  canModerate: boolean;
  comments: CommentItem[];
  labels: CommentLabels;
}) {
  return (
    <div className="divide-y divide-ink-700/60">
      <ul className="divide-y divide-ink-700/60">
        {comments.length === 0 ? (
          <li className="px-5 py-6 text-sm text-ink-400">{labels.empty}</li>
        ) : (
          comments.map((c) => (
            <CommentRow
              key={c.id}
              worldId={worldId}
              comment={c}
              currentUserId={currentUserId}
              canModerate={canModerate}
              revalidate={revalidate}
              labels={labels}
            />
          ))
        )}
      </ul>
      {canComment ? (
        <Composer
          worldId={worldId}
          entityType={entityType}
          entityId={entityId}
          revalidate={revalidate}
          labels={labels}
        />
      ) : (
        <div className="px-5 py-4 text-sm text-ink-400">
          <p>{labels.cannotComment}</p>
          <p className="mt-1 text-xs text-ink-500">{labels.cannotCommentHint}</p>
        </div>
      )}
    </div>
  );
}

function Composer({
  worldId,
  entityType,
  entityId,
  revalidate,
  labels,
}: {
  worldId: string;
  entityType: CommentEntityName;
  entityId: string;
  revalidate: string;
  labels: CommentLabels;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const text = body.trim();
    if (!text) return;
    const data = new FormData();
    data.set("entityType", entityType);
    data.set("entityId", entityId);
    data.set("body", text);
    data.set("revalidate", revalidate);
    start(async () => {
      const result = await createComment(worldId, data);
      if (result.ok) {
        setBody("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 px-5 py-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={4000}
        placeholder={labels.placeholder}
        className="input min-h-[5rem] resize-y"
        disabled={pending}
      />
      {error ? (
        <p className="rounded-md border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-xs text-ember-200">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={pending || body.trim().length === 0}
        >
          {pending ? labels.submitting : labels.submit}
        </button>
      </div>
    </form>
  );
}

function CommentRow({
  worldId,
  comment,
  currentUserId,
  canModerate,
  revalidate,
  labels,
}: {
  worldId: string;
  comment: CommentItem;
  currentUserId: string;
  canModerate: boolean;
  revalidate: string;
  labels: CommentLabels;
}) {
  const router = useRouter();
  const isMine = comment.author.id === currentUserId;
  const canEdit = isMine || canModerate;
  const canDelete = isMine || canModerate;

  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function startEdit() {
    setBody(comment.body);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
    setBody(comment.body);
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const text = body.trim();
    if (!text) {
      setError(labels.placeholder);
      return;
    }
    const data = new FormData();
    data.set("body", text);
    data.set("revalidate", revalidate);
    start(async () => {
      const result = await updateComment(worldId, comment.id, data);
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(labels.deleteConfirm)) return;
    start(async () => {
      const result = await deleteComment(worldId, comment.id, revalidate);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <li className="px-5 py-4">
      <div className="mb-1 flex items-center gap-2 text-xs">
        <span className="font-medium text-parchment-50">{comment.author.name}</span>
        {isMine ? (
          <span className="rounded-full bg-rune-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-rune-200">
            {labels.youLabel}
          </span>
        ) : null}
        <time className="text-ink-400" dateTime={comment.createdAt}>
          {formatDate(comment.createdAt)}
        </time>
        {comment.updatedAt !== comment.createdAt ? (
          <span className="text-[10px] italic text-ink-500">(edited)</span>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={4000}
            className="input min-h-[4.5rem] resize-y"
            disabled={pending}
          />
          {error ? (
            <p className="text-xs text-ember-200">{error}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancel}
              className="btn-ghost"
              disabled={pending}
            >
              {labels.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? labels.submitting : labels.save}
            </button>
          </div>
        </form>
      ) : (
        <p className={cn("whitespace-pre-wrap text-sm text-parchment-100", pending && "opacity-50")}>
          {comment.body}
        </p>
      )}

      {!editing && (canEdit || canDelete) ? (
        <div className="mt-2 flex gap-3 text-xs">
          {canEdit ? (
            <button
              type="button"
              onClick={startEdit}
              className="text-rune-300 hover:text-rune-400"
              disabled={pending}
            >
              {labels.edit}
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-ember-300 hover:text-ember-400"
              disabled={pending}
            >
              {labels.delete}
            </button>
          ) : null}
          {error && !editing ? (
            <span className="text-ember-200">{error}</span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}
