"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  action,
  label = "Delete",
  confirmText = "Are you sure? This cannot be undone.",
  redirectTo,
  className,
}: {
  action: () => Promise<unknown>;
  label?: string;
  confirmText?: string;
  redirectTo?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(confirmText)) return;
        start(async () => {
          await action();
          if (redirectTo) router.push(redirectTo);
          router.refresh();
        });
      }}
      className={className ?? "btn-danger"}
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
