import Image from "next/image";
import Link from "next/link";
import { tServer } from "@/lib/preferences";
import { assetUrl } from "@/lib/assetUrl";

export type FactionFormValues = {
  name: string;
  description: string | null;
  motto: string | null;
  alignment: string | null;
  banner: string | null;
};

export function FactionForm({
  action,
  values,
  cancelHref,
}: {
  action: (formData: FormData) => Promise<void>;
  values?: Partial<FactionFormValues>;
  cancelHref: string;
}) {
  const v = values ?? {};
  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="card grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <label className="label">{tServer("character.field.name")}</label>
        <input className="input" name="name" required defaultValue={v.name ?? ""} />
      </div>
      <div>
        <label className="label">{tServer("faction.field.motto")}</label>
        <input className="input" name="motto" defaultValue={v.motto ?? ""} />
      </div>
      <div>
        <label className="label">{tServer("faction.field.alignment")}</label>
        <input
          className="input"
          name="alignment"
          defaultValue={v.alignment ?? ""}
          placeholder={tServer("faction.field.alignmentPlaceholder")}
        />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("faction.field.description")}</label>
        <textarea
          className="input min-h-[140px]"
          name="description"
          defaultValue={v.description ?? ""}
          placeholder={tServer("faction.field.descriptionPlaceholder")}
        />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("faction.field.banner")}</label>
        {v.banner ? (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-20 w-32 overflow-hidden rounded-md border border-ink-700">
              <Image src={assetUrl(v.banner) ?? ""} alt="banner" fill className="object-cover" />
            </div>
          </div>
        ) : null}
        <input className="input" type="file" name="banner" accept="image/*" />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" className="btn-primary">
          {tServer("faction.save")}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          {tServer("common.cancel")}
        </Link>
      </div>
    </form>
  );
}
