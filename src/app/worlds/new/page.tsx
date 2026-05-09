import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { RootSidebar } from "@/components/shell/RootSidebar";
import { PageHeader } from "@/components/shell/PageHeader";
import { createWorld } from "@/app/actions/worlds";
import { tServer } from "@/lib/preferences";

export default function NewWorldPage() {
  return (
    <AppShell sidebar={<RootSidebar />}>
      <PageHeader
        eyebrow={tServer("world.new.eyebrow")}
        title={tServer("world.new.title")}
        description={tServer("world.new.description")}
      />
      <form
        action={createWorld}
        className="card max-w-2xl space-y-5 p-6"
        encType="multipart/form-data"
      >
        <div>
          <label className="label">{tServer("world.field.name")}</label>
          <input
            className="input"
            name="name"
            required
            placeholder={tServer("world.namePlaceholder")}
          />
        </div>
        <div>
          <label className="label">{tServer("world.field.tagline")}</label>
          <input
            className="input"
            name="tagline"
            placeholder={tServer("world.taglinePlaceholder")}
          />
        </div>
        <div>
          <label className="label">{tServer("world.field.description")}</label>
          <textarea
            className="input min-h-[120px]"
            name="description"
            placeholder={tServer("world.descriptionPlaceholder")}
          />
        </div>
        <div>
          <label className="label">{tServer("world.field.cover")}</label>
          <input
            className="input"
            type="file"
            name="coverImage"
            accept="image/*"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {tServer("world.create")}
          </button>
          <Link href="/" className="btn-ghost">
            {tServer("common.cancel")}
          </Link>
        </div>
      </form>
    </AppShell>
  );
}
