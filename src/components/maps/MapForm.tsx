import Link from "next/link";
import { tServer } from "@/lib/preferences";

type Option = { id: string; name: string };

export type MapFormValues = {
  name: string;
  description: string | null;
  parentMapId: string | null;
  regionId: string | null;
  width: number;
  height: number;
  imagePath?: string | null;
};

export function MapForm({
  action,
  values,
  parentOptions,
  regions,
  cancelHref,
  requireImage = true,
}: {
  action: (formData: FormData) => Promise<void>;
  values?: Partial<MapFormValues>;
  parentOptions: Option[];
  regions: Option[];
  cancelHref: string;
  requireImage?: boolean;
}) {
  const v = values ?? {};
  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="card grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <label className="label">{tServer("map.field.name")}</label>
        <input className="input" name="name" required defaultValue={v.name ?? ""} />
      </div>
      <div className="md:col-span-2">
        <label className="label">{tServer("map.field.description")}</label>
        <textarea
          className="input min-h-[80px]"
          name="description"
          defaultValue={v.description ?? ""}
        />
      </div>
      <div>
        <label className="label">{tServer("map.field.parentMap")}</label>
        <select className="input" name="parentMapId" defaultValue={v.parentMapId ?? ""}>
          <option value="">{tServer("map.field.parentMap.top")}</option>
          {parentOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{tServer("map.field.region")}</label>
        <select className="input" name="regionId" defaultValue={v.regionId ?? ""}>
          <option value="">{tServer("common.none")}</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{tServer("map.field.width")}</label>
        <input
          className="input"
          name="width"
          type="number"
          defaultValue={v.width ?? 2000}
        />
      </div>
      <div>
        <label className="label">{tServer("map.field.height")}</label>
        <input
          className="input"
          name="height"
          type="number"
          defaultValue={v.height ?? 1500}
        />
      </div>
      <div className="md:col-span-2">
        <label className="label">
          {requireImage ? tServer("map.field.image") : tServer("map.field.imageReplace")}
        </label>
        <input
          className="input"
          type="file"
          name="image"
          accept="image/*"
          required={requireImage}
        />
        <p className="mt-1 text-xs text-ink-400">
          {tServer("map.imageHint")}
        </p>
      </div>
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" className="btn-primary">
          {tServer("map.save")}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          {tServer("common.cancel")}
        </Link>
      </div>
    </form>
  );
}
