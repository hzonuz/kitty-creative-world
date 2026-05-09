import Link from "next/link";
import { tServer } from "@/lib/preferences";

type Option = { id: string; name: string };

export type EventFormValues = {
  title: string;
  description: string | null;
  year: number | null;
  monthDay: string | null;
  era: string | null;
  category: string | null;
  regionId: string | null;
  factionId: string | null;
  characterIds: string[];
};

export function EventForm({
  action,
  values,
  regions,
  factions,
  characters,
  cancelHref,
}: {
  action: (formData: FormData) => Promise<void>;
  values?: Partial<EventFormValues>;
  regions: Option[];
  factions: Option[];
  characters: Option[];
  cancelHref: string;
}) {
  const v = values ?? {};
  const selected = new Set(v.characterIds ?? []);
  return (
    <form action={action} className="card grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="label">{tServer("event.field.title")}</label>
        <input className="input" name="title" required defaultValue={v.title ?? ""} />
      </div>
      <div>
        <label className="label">{tServer("event.field.year")}</label>
        <input
          className="input"
          name="year"
          type="number"
          required
          defaultValue={v.year ?? ""}
          placeholder={tServer("event.field.yearPlaceholder")}
        />
      </div>
      <div>
        <label className="label">{tServer("event.field.monthDay")}</label>
        <input
          className="input"
          name="monthDay"
          defaultValue={v.monthDay ?? ""}
          placeholder={tServer("event.field.monthDayPlaceholder")}
        />
      </div>
      <div>
        <label className="label">{tServer("event.field.era")}</label>
        <input className="input" name="era" defaultValue={v.era ?? ""} />
      </div>
      <div>
        <label className="label">{tServer("event.field.category")}</label>
        <input
          className="input"
          name="category"
          defaultValue={v.category ?? ""}
          placeholder={tServer("event.field.categoryPlaceholder")}
        />
      </div>
      <div>
        <label className="label">{tServer("event.field.region")}</label>
        <select className="input" name="regionId" defaultValue={v.regionId ?? ""}>
          <option value="">—</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{tServer("event.field.faction")}</label>
        <select className="input" name="factionId" defaultValue={v.factionId ?? ""}>
          <option value="">—</option>
          {factions.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("event.field.description")}</label>
        <textarea
          className="input min-h-[120px]"
          name="description"
          defaultValue={v.description ?? ""}
        />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("event.field.characters")}</label>
        <div className="flex flex-wrap gap-2">
          {characters.length === 0 ? (
            <span className="text-xs text-ink-400">{tServer("event.charsEmpty")}</span>
          ) : (
            characters.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-ink-600 bg-ink-900/60 px-3 py-1.5 text-xs hover:border-rune-500/60"
              >
                <input
                  type="checkbox"
                  name="characterIds"
                  value={c.id}
                  defaultChecked={selected.has(c.id)}
                  className="accent-rune-500"
                />
                {c.name}
              </label>
            ))
          )}
        </div>
      </div>
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" className="btn-primary">
          {tServer("event.save")}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          {tServer("common.cancel")}
        </Link>
      </div>
    </form>
  );
}
