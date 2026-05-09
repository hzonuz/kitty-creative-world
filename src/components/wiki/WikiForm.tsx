import Link from "next/link";
import { RichTextEditor } from "./RichTextEditor";
import { WIKI_CATEGORIES } from "@/lib/wiki";
import { tServer } from "@/lib/preferences";
import type { TKey } from "@/lib/i18n";

export type WikiFormValues = {
  title: string;
  category: string;
  tags: string | null;
  content: string;
};

export function WikiForm({
  action,
  values,
  cancelHref,
}: {
  action: (formData: FormData) => Promise<void>;
  values?: Partial<WikiFormValues>;
  cancelHref: string;
}) {
  const v = values ?? {};
  return (
    <form action={action} className="card grid grid-cols-1 gap-5 p-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="label">{tServer("wiki.field.title")}</label>
          <input
            className="input"
            name="title"
            required
            defaultValue={v.title ?? ""}
            placeholder={tServer("wiki.field.titlePlaceholder")}
          />
        </div>
        <div>
          <label className="label">{tServer("wiki.field.category")}</label>
          <select className="input" name="category" defaultValue={v.category ?? "lore"}>
            {WIKI_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {tServer(`wiki.cat.${c}` as TKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">{tServer("wiki.field.tags")}</label>
        <input
          className="input"
          name="tags"
          defaultValue={v.tags ?? ""}
          placeholder={tServer("wiki.field.tagsPlaceholder")}
        />
      </div>
      <div>
        <label className="label">{tServer("wiki.field.content")}</label>
        <RichTextEditor name="content" defaultValue={v.content} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          {tServer("wiki.save")}
        </button>
        <Link href={cancelHref} className="btn-ghost">
          {tServer("common.cancel")}
        </Link>
      </div>
    </form>
  );
}
