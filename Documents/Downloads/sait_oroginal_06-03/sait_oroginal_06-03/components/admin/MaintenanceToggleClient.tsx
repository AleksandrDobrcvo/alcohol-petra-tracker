"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function MaintenanceToggleClient() {
  const [maintenance, setMaintenance] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/maintenance", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; data?: { maintenance: boolean } };
      if (!json.ok || !json.data) throw new Error("Failed to fetch status");
      setMaintenance(json.data.maintenance);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function toggle() {
    if (maintenance === null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: !maintenance }),
      });
      const json = (await res.json()) as { ok: boolean; data?: { maintenance: boolean } };
      if (!json.ok || !json.data) throw new Error("Failed to toggle");
      setMaintenance(json.data.maintenance);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (maintenance === null) {
    return <div className="text-sm text-zinc-400">Завантаження...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-zinc-300">Технічні роботи:</span>
        <Button onClick={toggle} disabled={loading}>
          {maintenance ? "🔴 Вимкнути" : "🟢 Увімкнути"}
        </Button>
      </div>
      {error ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-2 text-xs text-red-200">
          {error}
        </div>
      ) : null}
      <div className="text-xs text-zinc-400">
        {maintenance
          ? "Сайт закритий для всіх, окрім адмінки."
          : "Сайт працює у звичайному режимі."}
      </div>
    </div>
  );
}
