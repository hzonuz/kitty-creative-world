"use client";

import dynamic from "next/dynamic";
import { useT } from "@/components/i18n/I18nProvider";

export const MapViewerLazy = dynamic(
  () => import("./MapViewer").then((m) => m.MapViewer),
  {
    ssr: false,
    loading: () => <LoadingShell />,
  },
);

function LoadingShell() {
  const t = useT();
  return (
    <div className="card flex h-[640px] items-center justify-center text-sm text-ink-400">
      {t("map.viewer.loading")}
    </div>
  );
}
