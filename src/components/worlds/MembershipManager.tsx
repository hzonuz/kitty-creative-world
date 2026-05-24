"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeMembership, upsertMembership } from "@/app/actions/worlds";

type Collaborator = {
  userId: string;
  username: string;
  displayName: string | null;
  email: string;
  role: "VIEWER" | "COMMENTOR" | "EDITOR" | "OWNER";
};

type Labels = {
  inviteTitle: string;
  inviteDescription: string;
  identifier: string;
  identifierPlaceholder: string;
  roleLabel: string;
  submit: string;
  submitting: string;
  collaboratorsTitle: string;
  collaboratorsEmpty: string;
  remove: string;
  removeConfirm: string;
  roleViewer: string;
  roleCommentor: string;
  roleEditor: string;
  roleOwner: string;
};

export function MembershipManager({
  worldId,
  collaborators,
  labels,
}: {
  worldId: string;
  collaborators: Collaborator[];
  labels: Labels;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const roleLabel = (role: Collaborator["role"]): string => {
    switch (role) {
      case "OWNER":
        return labels.roleOwner;
      case "EDITOR":
        return labels.roleEditor;
      case "COMMENTOR":
        return labels.roleCommentor;
      default:
        return labels.roleViewer;
    }
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    start(async () => {
      const result = await upsertMembership(worldId, data);
      if (result.ok) {
        form.reset();
        router.refresh();
      } else {
        setError(result.error ?? "Failed");
      }
    });
  }

  function handleRemove(userId: string, name: string) {
    if (!window.confirm(labels.removeConfirm.replace("{name}", name))) return;
    start(async () => {
      await removeMembership(worldId, userId);
      router.refresh();
    });
  }

  function changeRole(userId: string, role: Collaborator["role"]) {
    const data = new FormData();
    const found = collaborators.find((c) => c.userId === userId);
    if (!found) return;
    data.set("identifier", found.email);
    data.set("role", role);
    setError(null);
    start(async () => {
      const result = await upsertMembership(worldId, data);
      if (!result.ok) setError(result.error ?? "Failed");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <div>
          <h2 className="heading-display text-sm">{labels.inviteTitle}</h2>
          <p className="mt-1 text-xs text-ink-400">{labels.inviteDescription}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
          <input
            name="identifier"
            required
            className="input"
            placeholder={labels.identifierPlaceholder}
            aria-label={labels.identifier}
          />
          <select
            name="role"
            defaultValue="VIEWER"
            className="input"
            aria-label={labels.roleLabel}
          >
            <option value="VIEWER">{labels.roleViewer}</option>
            <option value="COMMENTOR">{labels.roleCommentor}</option>
            <option value="EDITOR">{labels.roleEditor}</option>
          </select>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? labels.submitting : labels.submit}
          </button>
        </div>
        {error ? (
          <p className="rounded-md border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-sm text-ember-200">
            {error}
          </p>
        ) : null}
      </form>

      <section className="card overflow-hidden">
        <h2 className="heading-display border-b border-ink-700/60 px-5 py-3 text-sm">
          {labels.collaboratorsTitle}
        </h2>
        {collaborators.length === 0 ? (
          <p className="px-5 py-5 text-sm text-ink-400">
            {labels.collaboratorsEmpty}
          </p>
        ) : (
          <ul className="divide-y divide-ink-700/60">
            {collaborators.map((c) => {
              const name = c.displayName || c.username;
              return (
                <li
                  key={c.userId}
                  className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-parchment-50">{name}</div>
                    <div className="truncate text-xs text-ink-400">
                      @{c.username} · {c.email}
                    </div>
                  </div>
                  <select
                    value={c.role}
                    onChange={(e) =>
                      changeRole(c.userId, e.target.value as Collaborator["role"])
                    }
                    className="input w-40"
                    disabled={pending}
                    aria-label={labels.roleLabel}
                  >
                    <option value="VIEWER">{labels.roleViewer}</option>
                    <option value="COMMENTOR">{labels.roleCommentor}</option>
                    <option value="EDITOR">{labels.roleEditor}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemove(c.userId, name)}
                    className="text-xs text-ember-300 hover:text-ember-400"
                    disabled={pending}
                  >
                    {labels.remove}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
