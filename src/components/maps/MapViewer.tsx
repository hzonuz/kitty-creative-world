"use client";

import { useMemo, useState, useTransition } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents } from "react-leaflet";
import L, { CRS, type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPin, deletePin, updatePin } from "@/app/actions/maps";
import { useT } from "@/components/i18n/I18nProvider";

export type PinLink = {
  type: "region" | "character" | "event" | "wiki" | "map" | "none";
  id?: string;
  label?: string;
  href?: string;
};

export type MapPinData = {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string | null;
  icon: string | null;
  linkType: string;
  regionId: string | null;
  characterId: string | null;
  eventId: string | null;
  wikiPageId: string | null;
  childMapId: string | null;
  link?: PinLink | null;
};

type Option = { id: string; name: string };

export function MapViewer({
  worldId,
  mapId,
  imagePath,
  width,
  height,
  pins,
  regions,
  characters,
  events,
  wikiPages,
  childMaps,
}: {
  worldId: string;
  mapId: string;
  imagePath: string;
  width: number;
  height: number;
  pins: MapPinData[];
  regions: Option[];
  characters: Option[];
  events: Option[];
  wikiPages: { id: string; title: string; slug: string }[];
  childMaps: Option[];
}) {
  const t = useT();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pendingNew, setPendingNew] = useState<{ x: number; y: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const bounds: LatLngBoundsExpression = useMemo(
    () => [
      [0, 0],
      [height, width],
    ],
    [width, height],
  );

  const toLatLng = (x: number, y: number): [number, number] => [height - y, x];
  const fromLatLng = (lat: number, lng: number): { x: number; y: number } => ({
    x: lng,
    y: height - lat,
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-400">
          {t("map.viewer.hint")}{" "}
          {editing ? (
            <span className="text-ember-500">{t("map.viewer.editingHint")}</span>
          ) : null}
        </p>
        <button
          type="button"
          className={editing ? "btn-primary" : "btn-ghost"}
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? t("map.viewer.doneEditing") : t("map.viewer.addPin")}
        </button>
      </div>

      <div className="card overflow-hidden">
        <MapContainer
          crs={CRS.Simple}
          bounds={bounds}
          minZoom={-3}
          maxZoom={3}
          style={{ height: 640, width: "100%", background: "rgb(var(--ink-900))" }}
          attributionControl={false}
        >
          <ImageOverlay url={imagePath} bounds={bounds} />
          <ClickCatcher
            enabled={editing}
            onClick={(latlng) => setPendingNew(fromLatLng(latlng.lat, latlng.lng))}
          />
          {pins.map((p) => (
            <Marker
              key={p.id}
              position={toLatLng(p.x, p.y)}
              icon={makeIcon(p.color, p.icon)}
              draggable={editing}
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng();
                  const next = fromLatLng(ll.lat, ll.lng);
                  startTransition(async () => {
                    await updatePin(worldId, mapId, p.id, { x: next.x, y: next.y });
                    router.refresh();
                  });
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-display text-base">{p.label}</div>
                  {p.link?.href ? (
                    <Link href={p.link.href} className="text-rune-400">
                      {t("map.pin.openLink", {
                        label: p.link.label ?? t("map.pin.openDefault"),
                      })}
                    </Link>
                  ) : (
                    <span className="text-xs">{t("map.pin.noLink")}</span>
                  )}
                  {editing ? (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-xs text-blood-500 hover:underline"
                        onClick={() => {
                          if (
                            !confirm(t("map.pin.deleteConfirm", { name: p.label }))
                          )
                            return;
                          startTransition(async () => {
                            await deletePin(worldId, mapId, p.id);
                            router.refresh();
                          });
                        }}
                      >
                        {t("map.pin.delete")}
                      </button>
                    </div>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {pendingNew ? (
        <NewPinDialog
          x={pendingNew.x}
          y={pendingNew.y}
          regions={regions}
          characters={characters}
          events={events}
          wikiPages={wikiPages}
          childMaps={childMaps}
          onCancel={() => setPendingNew(null)}
          onSave={async (data) => {
            startTransition(async () => {
              await createPin(worldId, mapId, {
                label: data.label,
                x: pendingNew.x,
                y: pendingNew.y,
                color: data.color || undefined,
                icon: data.icon || undefined,
                linkType: data.linkType,
                regionId: data.linkType === "region" ? data.linkId || null : null,
                characterId: data.linkType === "character" ? data.linkId || null : null,
                eventId: data.linkType === "event" ? data.linkId || null : null,
                wikiPageId: data.linkType === "wiki" ? data.linkId || null : null,
                childMapId: data.linkType === "map" ? data.linkId || null : null,
              });
              setPendingNew(null);
              router.refresh();
            });
          }}
          saving={pending}
        />
      ) : null}
    </div>
  );
}

function ClickCatcher({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      if (enabled) onClick(e.latlng);
    },
  });
  return null;
}

function makeIcon(color: string | null, icon: string | null) {
  const c = color ?? "#5fb0ec";
  const inner = icon ?? "✦";
  const html = `
    <div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${c};
      transform:rotate(-45deg);
      box-shadow:0 4px 14px rgba(0,0,0,.5), 0 0 0 2px rgba(11,13,20,.6);
      display:flex;align-items:center;justify-content:center;
      border:1px solid rgba(255,255,255,.25);
    ">
      <span style="transform:rotate(45deg);font-size:14px;color:#06070b;">${inner}</span>
    </div>`;
  return L.divIcon({
    className: "world-builder-pin",
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26],
  });
}

function NewPinDialog({
  x,
  y,
  regions,
  characters,
  events,
  wikiPages,
  childMaps,
  onCancel,
  onSave,
  saving,
}: {
  x: number;
  y: number;
  regions: Option[];
  characters: Option[];
  events: Option[];
  wikiPages: { id: string; title: string; slug: string }[];
  childMaps: Option[];
  onCancel: () => void;
  onSave: (d: {
    label: string;
    color: string;
    icon: string;
    linkType: string;
    linkId: string;
  }) => void;
  saving: boolean;
}) {
  const t = useT();
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#5fb0ec");
  const [icon, setIcon] = useState("✦");
  const [linkType, setLinkType] = useState("none");
  const [linkId, setLinkId] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-md p-5">
        <h3 className="heading-display mb-3 text-lg">{t("map.pin.new")}</h3>
        <p className="mb-3 text-xs text-ink-400">
          {t("map.pin.position", { x: Math.round(x), y: Math.round(y) })}
        </p>
        <div className="space-y-3">
          <div>
            <label className="label">{t("map.pin.label")}</label>
            <input
              className="input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t("map.pin.color")}</label>
              <input
                className="input h-9 p-1"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t("map.pin.icon")}</label>
              <input
                className="input"
                value={icon}
                onChange={(e) => setIcon(e.target.value.slice(0, 2))}
              />
            </div>
          </div>
          <div>
            <label className="label">{t("map.pin.linksTo")}</label>
            <select
              className="input"
              value={linkType}
              onChange={(e) => {
                setLinkType(e.target.value);
                setLinkId("");
              }}
            >
              <option value="none">{t("map.pin.linkType.none")}</option>
              <option value="region">{t("map.pin.linkType.region")}</option>
              <option value="character">{t("map.pin.linkType.character")}</option>
              <option value="event">{t("map.pin.linkType.event")}</option>
              <option value="wiki">{t("map.pin.linkType.wiki")}</option>
              <option value="map">{t("map.pin.linkType.map")}</option>
            </select>
          </div>
          {linkType !== "none" ? (
            <div>
              <label className="label">{t("map.pin.target")}</label>
              <select className="input" value={linkId} onChange={(e) => setLinkId(e.target.value)}>
                <option value="">{t("map.pin.select")}</option>
                {linkType === "region" &&
                  regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                {linkType === "character" &&
                  characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                {linkType === "event" &&
                  events.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                {linkType === "wiki" &&
                  wikiPages.map((w) => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                {linkType === "map" &&
                  childMaps.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
              </select>
            </div>
          ) : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost">
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={!label || saving}
            className="btn-primary"
            onClick={() => onSave({ label, color, icon, linkType, linkId })}
          >
            {saving ? t("map.pin.saving") : t("map.pin.drop")}
          </button>
        </div>
      </div>
    </div>
  );
}