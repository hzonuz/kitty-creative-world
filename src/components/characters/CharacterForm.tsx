import Image from "next/image";
import Link from "next/link";
import { tServer } from "@/lib/preferences";
import { assetUrl } from "@/lib/assetUrl";

type Option = { id: string; name: string };

export type CharacterFormValues = {
  id?: string;
  name: string;
  title: string | null;
  biography: string | null;
  birthYear: number | null;
  deathYear: number | null;
  status: string | null;
  notes: string | null;
  factionId: string | null;
  currentRegionId: string | null;
  portrait: string | null;
};

export function CharacterForm({
  worldId,
  action,
  values,
  factions,
  regions,
  cancelHref,
}: {
  worldId: string;
  action: (formData: FormData) => Promise<void>;
  values?: Partial<CharacterFormValues>;
  factions: Option[];
  regions: Option[];
  cancelHref: string;
}) {
  const v: Partial<CharacterFormValues> = values ?? {};
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
        <label className="label">{tServer("character.field.title")}</label>
        <input className="input" name="title" defaultValue={v.title ?? ""} />
      </div>
      <div>
        <label className="label">{tServer("character.field.status")}</label>
        <select className="input" name="status" defaultValue={v.status ?? ""}>
          <option value="">{tServer("character.status.unknown")}</option>
          <option value="alive">{tServer("character.status.alive")}</option>
          <option value="dead">{tServer("character.status.dead")}</option>
          <option value="missing">{tServer("character.status.missing")}</option>
          <option value="unknown">{tServer("character.status.unknown")}</option>
        </select>
      </div>
      <div>
        <label className="label">{tServer("character.field.birthYear")}</label>
        <input
          className="input"
          name="birthYear"
          type="number"
          defaultValue={v.birthYear ?? ""}
        />
      </div>
      <div>
        <label className="label">{tServer("character.field.deathYear")}</label>
        <input
          className="input"
          name="deathYear"
          type="number"
          defaultValue={v.deathYear ?? ""}
        />
      </div>
      <div>
        <label className="label">{tServer("character.field.faction")}</label>
        <select className="input" name="factionId" defaultValue={v.factionId ?? ""}>
          <option value="">{tServer("common.none")}</option>
          {factions.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{tServer("character.field.region")}</label>
        <select
          className="input"
          name="currentRegionId"
          defaultValue={v.currentRegionId ?? ""}
        >
          <option value="">{tServer("common.none")}</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("character.field.biography")}</label>
        <textarea
          className="input min-h-[160px]"
          name="biography"
          defaultValue={v.biography ?? ""}
          placeholder={tServer("character.bioPlaceholder")}
        />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("character.field.notes")}</label>
        <textarea
          className="input min-h-[100px]"
          name="notes"
          defaultValue={v.notes ?? ""}
          placeholder={tServer("character.notesPlaceholder")}
        />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("character.field.portrait")}</label>
        {v.portrait ? (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-md border border-ink-700">
              <Image src={assetUrl(v.portrait) ?? ""} alt="portrait" fill className="object-cover" />
            </div>
            <span className="text-xs text-ink-400">
              {tServer("character.portrait.replaceHint")}
            </span>
          </div>
        ) : null}
        <input className="input" type="file" name="portrait" accept="image/*" />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" className="btn-primary">
          {tServer("character.save")}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          {tServer("common.cancel")}
        </Link>
      </div>
    </form>
  );
}
