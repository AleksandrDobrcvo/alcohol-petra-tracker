"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type RequestRow = {
  id: string;
  date: string;
  type: "ALCO" | "PETRA";
  stars: number;
  quantity: number;
  amount: number;
  nickname: string;
  screenshotPath: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decisionNote: string | null;
  submitter: { id: string; name: string };
  decidedBy: { id: string; name: string } | null;
};

function StatusBadge({ status }: { status: RequestRow["status"] }) {
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-200 animate-pulse">
        ⏳ Очікує
      </span>
    );
  }
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">
        ✅ Схвалено
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs text-red-200">
      ❌ Відхилено
    </span>
  );
}

export function AdminRequestsClient() {
  const [items, setItems] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<"ALL" | "ALCO" | "PETRA">("ALL");
  const [status, setStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (type !== "ALL") qs.set("type", type);
      if (status !== "ALL") qs.set("status", status);
      const res = await fetch(`/api/requests?${qs.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; data?: { requests: RequestRow[] }; error?: { message: string } };
      if (!json.ok || !json.data) throw new Error(json.error?.message ?? "Не вдалося завантажити заявки");
      setItems(json.data.requests);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Невідома помилка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [type, status]);

  async function decide(id: string, next: "APPROVED" | "REJECTED") {
    setError(null);
    try {
      const note = window.prompt(next === "REJECTED" ? "Причина відмови" : "Коментар (необовʼязково)") ?? undefined;
      const res = await fetch(`/api/requests/${id}/decision`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next, note }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Не вдалося зберегти рішення");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Невідома помилка");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-300">
          Заявок: <span className="font-medium">{items.length}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="ALL">Всі типи</option>
            <option value="ALCO">🍺 Алко</option>
            <option value="PETRA">💎 Петра</option>
          </select>
          <select
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="ALL">Всі</option>
            <option value="PENDING">⏳ Очікує</option>
            <option value="APPROVED">✅ Схвалено</option>
            <option value="REJECTED">❌ Відхилено</option>
          </select>
          <Button onClick={load} disabled={loading}>
            Оновити
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/60 text-zinc-300">
            <tr>
              <th className="px-3 py-2">Дата</th>
              <th className="px-3 py-2">Хто</th>
              <th className="px-3 py-2">Нік</th>
              <th className="px-3 py-2">Тип</th>
              <th className="px-3 py-2">⭐</th>
              <th className="px-3 py-2">Сума</th>
              <th className="px-3 py-2">Скрін</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Дії</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={9}>
                  Завантаження…
                </td>
              </tr>
            ) : null}
            {!loading && items.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={9}>
                  Поки що немає заявок.
                </td>
              </tr>
            ) : null}
            {items.map((r) => (
              <tr key={r.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-zinc-200">{new Date(r.date).toLocaleString("uk-UA")}</td>
                <td className="px-3 py-2 text-zinc-200">{r.submitter.name}</td>
                <td className="px-3 py-2 text-zinc-200">{r.nickname}</td>
                <td className="px-3 py-2 text-zinc-200">{r.type === "ALCO" ? "🍺 Алко" : "💎 Петра"}</td>
                <td className="px-3 py-2 text-zinc-200">{r.stars}</td>
                <td className="px-3 py-2 text-zinc-200">{Number(r.amount).toFixed(2)} ₴</td>
                <td className="px-3 py-2">
                  <a className="text-zinc-200 hover:text-white" href={r.screenshotPath} target="_blank" rel="noreferrer">
                    📷
                  </a>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-3 py-2">
                  {r.status === "PENDING" ? (
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => decide(r.id, "APPROVED")}>✅ Схвалити</Button>
                      <Button onClick={() => decide(r.id, "REJECTED")}>❌ Відхилити</Button>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400">
                      {r.decidedBy ? `Перевірив(ла): ${r.decidedBy.name}` : ""}
                      {r.decisionNote ? ` • ${r.decisionNote}` : ""}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
