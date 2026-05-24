import Link from "next/link";
import { WorldImportForm } from "./WorldImportForm";

export function WorldTransferPanel({
  worldId,
  showImport = true,
  labels,
}: {
  worldId?: string;
  showImport?: boolean;
  labels: {
    sectionTitle: string;
    exportTitle: string;
    exportDescription: string;
    exportButton: string;
    importTitle: string;
    importDescription: string;
    importFileLabel: string;
    importSubmit: string;
    importSubmitting: string;
    importHint: string;
  };
}) {
  const exportHref = worldId ? `/api/worlds/${worldId}/export` : null;

  return (
    <section className="space-y-4">
      <h2 className="section-title px-1">{labels.sectionTitle}</h2>
      <ExportCard
        exportHref={exportHref}
        exportTitle={labels.exportTitle}
        exportDescription={labels.exportDescription}
        exportButton={labels.exportButton}
      />
      {showImport ? (
        <WorldImportForm
          labels={{
            title: labels.importTitle,
            description: labels.importDescription,
            fileLabel: labels.importFileLabel,
            submit: labels.importSubmit,
            submitting: labels.importSubmitting,
            hint: labels.importHint,
          }}
        />
      ) : null}
    </section>
  );
}

function ExportCard({
  exportHref,
  exportTitle,
  exportDescription,
  exportButton,
}: {
  exportHref: string | null;
  exportTitle: string;
  exportDescription: string;
  exportButton: string;
}) {
  if (!exportHref) return null;

  return (
    <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="heading-display text-sm">{exportTitle}</h3>
        <p className="mt-1 text-xs text-ink-400">{exportDescription}</p>
      </div>
      <Link href={exportHref} className="btn-ghost shrink-0" download>
        {exportButton}
      </Link>
    </div>
  );
}
