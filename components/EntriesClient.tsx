"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

type EntryRow = {
  id: string;
  date: string;
  type: "ALCO" | "PETRA";
  stars: number;
  quantity: number;
  amount: string;
  paymentStatus: "PAID" | "UNPAID";
  paidAt: string | null;
  submitter: { id: string; name: string };
};

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

export function EntriesClient() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VIEWER";
  const canEdit = role === "OWNER" || role === "ADMIN";

  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [myRequests, setMyRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newSubmitterId, setNewSubmitterId] = useState("");
  const [newType, setNewType] = useState<"ALCO" | "PETRA">("ALCO");
  const [newStars, setNewStars] = useState(1);

  // Форма заявки
  const [reqNickname, setReqNickname] = useState("");
  const [reqType, setReqType] = useState<"ALCO" | "PETRA">("ALCO");
  const [reqStars, setReqStars] = useState(1);
  const [reqScreenshot, setReqScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [entriesRes, requestsRes] = await Promise.all([
        fetch("/api/entries", { cache: "no-store" }),
        fetch("/api/requests?mine=true", { cache: "no-store" }),
      ]);
      const entriesJson = (await entriesRes.json()) as { ok: boolean; data?: { entries: EntryRow[] } };
      const requestsJson = (await requestsRes.json()) as { ok: boolean; data?: { requests: RequestRow[] } };
      if (!entriesJson.ok || !entriesJson.data) throw new Error("Failed to load entries");
      if (!requestsJson.ok || !requestsJson.data) throw new Error("Failed to load requests");
      setEntries(entriesJson.data.entries);
      setMyRequests(requestsJson.data.requests);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const totalAmount = useMemo(() => {
    return entries.reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2);
  }, [entries]);

  async function createRequest() {
    setError(null);
    setSubmitting(true);
    try {
      if (!reqNickname.trim() || !reqScreenshot) {
        throw new Error("Нікнейм і скріншот обов’язкові");
      }
      const form = new FormData();
      form.append("nickname", reqNickname.trim());
      form.append("type", reqType);
      form.append("stars", String(reqStars));
      form.append("screenshot", reqScreenshot);
      const res = await fetch("/api/requests", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Request failed");
      setReqNickname("");
      setReqType("ALCO");
      setReqStars(1);
      setReqScreenshot(null);
      setShowRequestForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  async function createEntry() {
    setError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          submitterId: newSubmitterId,
          type: newType,
          stars: newStars,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Create failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function togglePaid(id: string, next: "PAID" | "UNPAID") {
    setError(null);
    try {
      const res = await fetch(`/api/entries/${id}/payment`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentStatus: next }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="space-y-6">
      {/* --- Форма подачі заявки (для всіх залогінених) --- */}
      {session && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">📝 Подати заявку на запис</div>
            <Button
              onClick={() => setShowRequestForm(!showRequestForm)}
            >
              {showRequestForm ? "Скасувати" : "Подати заявку"}
            </Button>
          </div>
          {showRequestForm ? (
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                placeholder="Нікнейм в грі"
                value={reqNickname}
                onChange={(e) => setReqNickname(e.target.value)}
                maxLength={32}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as "ALCO" | "PETRA")}
                >
                  <option value="ALCO">🍺 Алко</option>
                  <option value="PETRA">💎 Петра</option>
                </select>
                <select
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  value={reqStars}
                  onChange={(e) => setReqStars(Number(e.target.value))}
                >
                  <option value={1}>⭐1</option>
                  <option value={2}>⭐2</option>
                  <option value={3}>⭐3</option>
                </select>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => setReqScreenshot(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:text-sm file:font-medium file:text-zinc-200 hover:file:bg-zinc-700"
              />
              <Button onClick={createRequest} disabled={submitting || !reqNickname.trim() || !reqScreenshot}>
                {submitting ? "Відправка…" : "📤 Подати заявку"}
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* --- Мої заявки --- */}
      {session && myRequests.length > 0 && (
        <div className="rounded-xl border border-zinc-800">
          <div className="border-b border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm font-medium text-zinc-300">
            📋 Мої заявки ({myRequests.length})
          </div>
          <div className="divide-y divide-zinc-800">
            {myRequests.map((r) => (
              <div key={r.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-zinc-200">{r.nickname}</span>
                    <span className="ml-2 text-zinc-400">
                      {r.type === "ALCO" ? "🍺" : "💎"} {r.stars}⭐ ({Number(r.amount).toFixed(2)} ₴)
                    </span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  {new Date(r.date).toLocaleString("uk-UA")}
                  {r.decisionNote && ` • ${r.decisionNote}`}
                </div>
                <a
                  className="mt-1 inline-block text-xs text-zinc-400 hover:text-zinc-200"
                  href={r.screenshotPath}
                  target="_blank"
                  rel="noreferrer"
                >
                  📷 Скріншот
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Записи (тільки для OWNER/ADMIN) --- */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-zinc-300">
            Записів: <span className="font-medium">{entries.length}</span>, сума: <span className="font-medium">{totalAmount}</span>
          </div>
          <Button onClick={load} disabled={loading}>
            Оновити
          </Button>
        </div>
        {canEdit ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="mb-3 text-sm font-medium">➕ Додати запис (тільки адмін)</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                placeholder="submitterId (UUID)"
                value={newSubmitterId}
                onChange={(e) => setNewSubmitterId(e.target.value)}
              />
              <select
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                value={newType}
                onChange={(e) => setNewType(e.target.value as "ALCO" | "PETRA")}
              >
                <option value="ALCO">🍺 Алко</option>
                <option value="PETRA">💎 Петра</option>
              </select>
              <select
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                value={newStars}
                onChange={(e) => setNewStars(Number(e.target.value))}
              >
                <option value={1}>⭐1</option>
                <option value={2}>⭐2</option>
                <option value={3}>⭐3</option>
              </select>
              <Button onClick={createEntry} disabled={!newSubmitterId}>
                Додати
              </Button>
            </div>
            <div className="mt-2 text-xs text-zinc-400">
              Зараз submitterId вводиться вручну (пізніше в адмінці буде зручний вибір користувача).
            </div>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/60 text-zinc-300">
            <tr>
              <th className="px-3 py-2">Дата</th>
              <th className="px-3 py-2">Хто</th>
              <th className="px-3 py-2">Тип</th>
              <th className="px-3 py-2">⭐</th>
              <th className="px-3 py-2">Кількість</th>
              <th className="px-3 py-2">Сума</th>
              <th className="px-3 py-2">Виплата</th>
              {canEdit ? <th className="px-3 py-2">Дії</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={canEdit ? 8 : 7}>
                  Завантаження…
                </td>
              </tr>
            ) : null}
            {!loading && entries.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={canEdit ? 8 : 7}>
                  Поки що немає записів.
                </td>
              </tr>
            ) : null}
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-zinc-200">
                  {new Date(e.date).toLocaleString("uk-UA")}
                </td>
                <td className="px-3 py-2 text-zinc-200">{e.submitter.name}</td>
                <td className="px-3 py-2 text-zinc-200">{e.type === "ALCO" ? "🍺 Алко" : "💎 Петра"}</td>
                <td className="px-3 py-2 text-zinc-200">{e.stars}</td>
                <td className="px-3 py-2 text-zinc-200">{e.quantity}</td>
                <td className="px-3 py-2 text-zinc-200">{e.amount}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      e.paymentStatus === "PAID"
                        ? "rounded-md bg-emerald-950/40 px-2 py-1 text-emerald-200"
                        : "rounded-md bg-amber-950/40 px-2 py-1 text-amber-200"
                    }
                  >
                    {e.paymentStatus === "PAID" ? "💰 Оплачено" : "⏳ Не оплачено"}
                  </span>
                </td>
                {canEdit ? (
                  <td className="px-3 py-2">
                    <Button
                      onClick={() => togglePaid(e.id, e.paymentStatus === "PAID" ? "UNPAID" : "PAID")}
                    >
                      {e.paymentStatus === "PAID" ? "Скасувати" : "💰 Оплатити"}
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

