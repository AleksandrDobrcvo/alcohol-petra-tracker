"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type AuditRow = {
  id: string;
  createdAt: string;
  action: string;
  targetType: string;
  targetId: string;
  before: unknown;
  after: unknown;
  actor: { id: string; name: string; role: string };
};

export function AdminAuditClient() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; data?: { logs: AuditRow[] } };
      if (!json.ok || !json.data) throw new Error("Failed to load logs");
      setLogs(json.data.logs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-300">
          Показано: <span className="font-medium">{logs.length}</span> (последние 200)
        </div>
        <Button onClick={load} disabled={loading}>
          Обновить
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {loading ? <div className="text-sm text-zinc-400">Загрузка…</div> : null}
        {logs.map((l) => (
          <div key={l.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-zinc-200">
                <span className="font-medium">{l.actor.role}</span> ({l.actor.name},{" "}
                <span className="font-mono text-xs">{l.actor.id}</span>)
              </div>
              <div className="text-xs text-zinc-400">
                {new Date(l.createdAt).toLocaleString("ru-RU")}
              </div>
            </div>
            <div className="mt-2 text-sm text-zinc-300">
              <span className="rounded-md bg-zinc-950/40 px-2 py-1 font-mono text-xs">
                {l.action}
              </span>{" "}
              → {l.targetType}{" "}
              <span className="font-mono text-xs text-zinc-400">{l.targetId}</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <pre className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200">
                {JSON.stringify(l.before, null, 2)}
              </pre>
              <pre className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200">
                {JSON.stringify(l.after, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

