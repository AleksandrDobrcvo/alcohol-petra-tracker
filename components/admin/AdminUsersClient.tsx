"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MaintenanceToggleClient } from "@/components/admin/MaintenanceToggleClient";

type UserRow = {
  id: string;
  discordId: string;
  name: string;
  role: "OWNER" | "ADMIN" | "VIEWER";
  isBlocked: boolean;
  isApproved: boolean;
  cardNumber: string | null;
};

export function AdminUsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; data?: { users: UserRow[] } };
      if (!json.ok || !json.data) throw new Error("Failed to load users");
      setUsers(json.data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function setRole(id: string, role: UserRow["role"]) {
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Role update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function setBlocked(id: string, isBlocked: boolean) {
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}/block`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isBlocked }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Block update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function setApproved(id: string, isApproved: boolean) {
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}/approve`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Approval update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-300">
          Користувачів: <span className="font-medium">{users.length}</span>
        </div>
        <Button onClick={load} disabled={loading}>
          Оновити
        </Button>
      </div>

      <MaintenanceToggleClient />

      {error ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/60 text-zinc-300">
            <tr>
              <th className="px-3 py-2">Discord ID</th>
              <th className="px-3 py-2">Нік</th>
              <th className="px-3 py-2">Доступ</th>
              <th className="px-3 py-2">Роль</th>
              <th className="px-3 py-2">Блок</th>
              <th className="px-3 py-2">Карта</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3 text-zinc-400" colSpan={6}>
                  Завантаження…
                </td>
              </tr>
            ) : null}
            {users.map((u) => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 font-mono text-xs text-zinc-300">{u.discordId}</td>
                <td className="px-3 py-2 text-zinc-200">{u.name}</td>
                <td className="px-3 py-2">
                  <Button
                    onClick={() => setApproved(u.id, !u.isApproved)}
                    disabled={u.role === "OWNER"}
                  >
                    {u.isApproved ? "Доступ є" : "Очікує"}
                  </Button>
                </td>
                <td className="px-3 py-2">
                  <select
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
                    value={u.role}
                    onChange={(e) => setRole(u.id, e.target.value as UserRow["role"])}
                    disabled={u.role === "OWNER"}
                    title={u.role === "OWNER" ? "OWNER не можна понизити" : undefined}
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Button onClick={() => setBlocked(u.id, !u.isBlocked)}>
                    {u.isBlocked ? "Розблок" : "Блок"}
                  </Button>
                </td>
                <td className="px-3 py-2 text-zinc-200">{u.cardNumber ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

