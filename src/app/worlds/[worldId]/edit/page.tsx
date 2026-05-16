import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeleteButton } from "@/components/shell/DeleteButton";
import { WorldTransferPanel } from "@/components/worlds/WorldTransferPanel";
import { deleteWorld, updateWorld } from "@/app/actions/worlds";
import { tServer } from "@/lib/preferences";

export default async function EditWorldPage({
  params,
}: {
  params: { worldId: string };
}) {
  const world = await prisma.world.findUnique({ where: { id: params.worldId } });
  if (!world) notFound();

  const update = updateWorld.bind(null, world.id);
  const remove = deleteWorld.bind(null, world.id);

  return (
    <>
      <PageHeader
        eyebrow={tServer("world.edit.eyebrow")}
        title={world.name}
        description={tServer("world.edit.description")}
        actions={
          <DeleteButton
            action={remove}
            label={tServer("world.delete")}
            confirmText={tServer("world.deleteConfirm", { name: world.name })}
            redirectTo="/"
          />
        }
      />

      <form
        action={update}
        encType="multipart/form-data"
        className="card max-w-2xl space-y-5 p-6"
      >
        <div>
          <label className="label">{tServer("world.field.name")}</label>
          <input
            className="input"
            name="name"
            required
            defaultValue={world.name}
          />
        </div>
        <div>
          <label className="label">{tServer("world.field.tagline")}</label>
          <input
            className="input"
            name="tagline"
            defaultValue={world.tagline ?? ""}
          />
        </div>
        <div>
          <label className="label">{tServer("world.field.description")}</label>
          <textarea
            className="input min-h-[140px]"
            name="description"
            defaultValue={world.description ?? ""}
          />
        </div>
        <div>
          <label className="label">{tServer("world.field.cover")}</label>
          {world.coverImage ? (
            <div className="mb-3 overflow-hidden rounded-md border border-ink-700">
              <div className="relative aspect-[16/6]">
                <Image
                  src={world.coverImage}
                  alt="cover"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
          <input
            className="input"
            type="file"
            name="coverImage"
            accept="image/*"
          />
          <p className="mt-1 text-xs text-ink-400">
            {tServer("world.cover.replaceHint")}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {tServer("world.saveChanges")}
          </button>
          <Link href={`/worlds/${world.id}`} className="btn-ghost">
            {tServer("common.back")}
          </Link>
        </div>
      </form>

      <div className="mt-10 max-w-2xl">
        <WorldTransferPanel
          worldId={world.id}
          labels={{
            sectionTitle: tServer("world.transfer.section"),
            exportTitle: tServer("world.transfer.export.title"),
            exportDescription: tServer("world.transfer.export.description"),
            exportButton: tServer("world.transfer.export.button"),
            importTitle: tServer("world.transfer.import.title"),
            importDescription: tServer("world.transfer.import.description"),
            importFileLabel: tServer("world.transfer.import.file"),
            importSubmit: tServer("world.transfer.import.submit"),
            importSubmitting: tServer("world.transfer.import.submitting"),
            importHint: tServer("world.transfer.import.hint"),
          }}
        />
      </div>
    </>
  );
}
