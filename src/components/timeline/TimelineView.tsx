"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatYear } from "@/lib/slug";
import { useT } from "@/components/i18n/I18nProvider";

export type TimelineEventLite = {
  id: string;
  title: string;
  description: string | null;
  year: number;
  era: string | null;
  category: string | null;
  region: { id: string; name: string } | null;
  faction: { id: string; name: string } | null;
  characters: { id: string; name: string }[];
};

type Filter = {
  characterId?: string;
  regionId?: string;
  factionId?: string;
};

export function TimelineView({
  worldId,
  events,
  characters,
  regions,
  factions,
}: {
  worldId: string;
  events: TimelineEventLite[];
  characters: { id: string; name: string }[];
  regions: { id: string; name: string }[];
  factions: { id: string; name: string }[];
}) {
  const t = useT();
  const [filter, setFilter] = useState<Filter>({});

  const visible = useMemo(() => {
    return events
      .filter((e) => {
        if (filter.characterId && !e.characters.some((c) => c.id === filter.characterId))
          return false;
        if (filter.regionId && e.region?.id !== filter.regionId) return false;
        if (filter.factionId && e.faction?.id !== filter.factionId) return false;
        return true;
      })
      .sort((a, b) => a.year - b.year);
  }, [events, filter]);

  return (
    <div className="space-y-4">
      <div className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        <FilterSelect
          label={t("timeline.filter.character")}
          allLabel={t("timeline.filter.all")}
          value={filter.characterId ?? ""}
          onChange={(v) => setFilter((f) => ({ ...f, characterId: v || undefined }))}
          options={characters}
        />
        <FilterSelect
          label={t("timeline.filter.region")}
          allLabel={t("timeline.filter.all")}
          value={filter.regionId ?? ""}
          onChange={(v) => setFilter((f) => ({ ...f, regionId: v || undefined }))}
          options={regions}
        />
        <FilterSelect
          label={t("timeline.filter.faction")}
          allLabel={t("timeline.filter.all")}
          value={filter.factionId ?? ""}
          onChange={(v) => setFilter((f) => ({ ...f, factionId: v || undefined }))}
          options={factions}
        />
      </div>

      {visible.length === 0 ? (
        <p className="card p-6 text-center text-sm text-ink-400">
          {t("timeline.noMatches")}
        </p>
      ) : (
        <ol className="relative ms-3 border-s-2 border-ink-700 ps-6">
          {visible.map((e) => (
            <li key={e.id} className="relative mb-6">
              <span className="absolute -start-[34px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 ring-2 ring-rune-500">
                <span className="h-1.5 w-1.5 rounded-full bg-rune-400" />
              </span>
              <Link
                href={`/worlds/${worldId}/timeline/${e.id}`}
                className="card card-hover block px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="heading-display text-base">{e.title}</h3>
                  <span className="shrink-0 text-xs font-mono text-rune-300">
                    {formatYear(e.year, e.era)}
                  </span>
                </div>
                {e.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-parchment-100/80">
                    {e.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.category ? <span className="chip">{e.category}</span> : null}
                  {e.region ? <span className="chip">📍 {e.region.name}</span> : null}
                  {e.faction ? <span className="chip">⚔ {e.faction.name}</span> : null}
                  {e.characters.slice(0, 4).map((c) => (
                    <span key={c.id} className="chip">👤 {c.name}</span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  allLabel,
  value,
  onChange,
  options,
}: {
  label: string;
  allLabel: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
}
