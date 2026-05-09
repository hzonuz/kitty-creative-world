import { ReactNode } from "react";

export function EmptyState({
  icon = "✦",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 text-3xl opacity-60">{icon}</div>
      <h3 className="heading-display text-lg">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-parchment-100/70">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
