import Link from "next/link";
import { tServer } from "@/lib/preferences";

type Option = { id: string; name: string };

export type RegionFormValues = {
  name: string;
  description: string | null;
  rulerId: string | null;
  resources: string | null;
  settlements: string | null;
  factionIds: string[];
};

export function RegionForm({
  action,
  values,
  characters,
  factions,
  cancelHref,
}: {
  action: (formData: FormData) => Promise<void>;
  values?: Partial<RegionFormValues>;
  characters: Option[];
  factions: Option[];
  cancelHref: string;
}) {
  const v = values ?? {};
  const selectedFactions = new Set(v.factionIds ?? []);

  return (
    <form action={action} className="card grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="label">{tServer("region.field.name")}</label>
        <input className="input" name="name" required defaultValue={v.name ?? ""} />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("region.field.description")}</label>
        <textarea
          className="input min-h-[120px]"
          name="description"
          defaultValue={v.description ?? ""}
          placeholder={tServer("region.field.descriptionPlaceholder")}
        />
      </div>
      <div>
        <label className="label">{tServer("region.field.ruler")}</label>
        <select className="input" name="rulerId" defaultValue={v.rulerId ?? ""}>
          <option value="">{tServer("common.none")}</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{tServer("region.field.settlements")}</label>
        <input
          className="input"
          name="settlements"
          defaultValue={v.settlements ?? ""}
          placeholder={tServer("region.field.settlementsPlaceholder")}
        />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("region.field.resources")}</label>
        <input
          className="input"
          name="resources"
          defaultValue={v.resources ?? ""}
          placeholder={tServer("region.field.resourcesPlaceholder")}
        />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("region.field.factions")}</label>
        <div className="flex flex-wrap gap-2">
          {factions.length === 0 ? (
            <span className="text-xs text-ink-400">
              {tServer("region.factions.empty")}
            </span>
          ) : (
            factions.map((f) => (
              <label
                key={f.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-ink-600 bg-ink-900/60 px-3 py-1.5 text-xs hover:border-rune-500/60"
              >
                <input
                  type="checkbox"
                  name="factionIds"
                  value={f.id}
                  defaultChecked={selectedFactions.has(f.id)}
                  className="accent-rune-500"
                />
                {f.name}
              </label>
            ))
          )}
        </div>
      </div>
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" className="btn-primary">
          {tServer("region.save")}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          {tServer("common.cancel")}
        </Link>
      </div>
    </form>
  );
}
