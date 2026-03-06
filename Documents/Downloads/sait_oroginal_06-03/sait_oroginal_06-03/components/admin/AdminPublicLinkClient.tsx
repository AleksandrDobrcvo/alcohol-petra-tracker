"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

type TokenRow = {
  id: string;
  isRevoked: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
};

export function AdminPublicLinkClient() {
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const publicUrl = useMemo(() => {
    if (!freshToken) return null;
    return `${window.location.origin}/public/${freshToken}`;
  }, [freshToken]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public-token", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; data?: { tokens: TokenRow[] } };
      if (!json.ok || !json.data) throw new Error("Failed to load tokens");
      setTokens(json.data.tokens);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    setError(null);
    setFreshToken(null);
    setFreshId(null);
    try {
      const res = await fetch("/api/public-token", { method: "POST" });
      const json = (await res.json()) as { ok: boolean; data?: { id: string; token: string } };
      if (!json.ok || !json.data) throw new Error("Create failed");
      setFreshToken(json.data.token);
      setFreshId(json.data.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function revoke(id: string) {
    setError(null);
    try {
      const res = await fetch("/api/public-token/revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Revoke failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-300">
          Токены: <span className="font-medium">{tokens.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={load} disabled={loading}>
            Обновить
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500" onClick={create}>
            Создать ссылку
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {publicUrl ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-sm font-medium">Новая ссылка (показывается один раз)</div>
          <div className="mt-2 break-all rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-200">
            {publicUrl}
          </div>
          {freshId ? (
            <div className="mt-3">
              <Button onClick={() => revoke(freshId)}>Отозвать этот токен</Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/60 text-zinc-300">
            <tr>
              <th className="px-3 py-2">id</th>
              <th className="px-3 py-2">revoked</th>
              <th className="px-3 py-2">createdAt</th>
              <th className="px-3 py-2">action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={4}>
                  Загрузка…
                </td>
              </tr>
            ) : null}
            {tokens.map((t) => (
              <tr key={t.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 font-mono text-xs text-zinc-300">{t.id}</td>
                <td className="px-3 py-2 text-zinc-200">{t.isRevoked ? "yes" : "no"}</td>
                <td className="px-3 py-2 text-zinc-200">
                  {new Date(t.createdAt).toLocaleString("ru-RU")}
                </td>
                <td className="px-3 py-2">
                  <Button onClick={() => revoke(t.id)} disabled={t.isRevoked}>
                    Отозвать
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

