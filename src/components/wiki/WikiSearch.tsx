"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseTags, WIKI_CATEGORIES } from "@/lib/wiki";
import { useT } from "@/components/i18n/I18nProvider";
import type { TKey } from "@/lib/i18n";

export type WikiPageLite = {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string | null;
  updatedAt: string | Date;
};

export function WikiSearch({
  worldId,
  pages,
}: {
  worldId: string;
  pages: WikiPageLite[];
}) {
  const t = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return pages.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!needle) return true;
      if (p.title.toLowerCase().includes(needle)) return true;
      if (p.category.toLowerCase().includes(needle)) return true;
      if (p.tags && p.tags.toLowerCase().includes(needle)) return true;
      return false;
    });
  }, [pages, q, cat]);

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <input
          className="input flex-1"
          placeholder={t("wiki.search.placeholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input sm:w-56"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="all">{t("wiki.search.allCategories")}</option>
          {WIKI_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`wiki.cat.${c}` as TKey)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-400">
          {t("wiki.search.noMatch")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const tags = parseTags(p.tags);
            return (
              <li key={p.id} className="card card-hover">
                <Link
                  href={`/worlds/${worldId}/wiki/${p.slug}`}
                  className="block px-5 py-4"
                >
                  <div className="section-title mb-1">
                    {t(`wiki.cat.${p.category}` as TKey)}
                  </div>
                  <h3 className="heading-display text-base">{p.title}</h3>
                  {tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.slice(0, 6).map((tag) => (
                        <span key={tag} className="chip">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
