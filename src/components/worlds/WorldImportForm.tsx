"use client";

import { useFormStatus } from "react-dom";
import { importWorldArchive } from "@/app/actions/world-transfer";

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function WorldImportForm({
  labels,
}: {
  labels: {
    title: string;
    description: string;
    fileLabel: string;
    submit: string;
    submitting: string;
    hint: string;
  };
}) {
  return (
    <form
      action={importWorldArchive}
      encType="multipart/form-data"
      className="card space-y-4 p-5"
    >
      <div>
        <h2 className="heading-display text-sm">{labels.title}</h2>
        <p className="mt-1 text-xs text-ink-400">{labels.description}</p>
      </div>
      <div>
        <label className="label">{labels.fileLabel}</label>
        <input
          className="input"
          type="file"
          name="archive"
          accept=".zip,.kcworld.zip,application/zip"
          required
        />
        <p className="mt-1 text-xs text-ink-400">{labels.hint}</p>
      </div>
      <SubmitButton label={labels.submit} pendingLabel={labels.submitting} />
    </form>
  );
}
