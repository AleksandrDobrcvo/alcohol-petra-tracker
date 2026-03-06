"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MultiRoleBadges } from "../ui/RoleBadge";
import { Button } from "../ui/Button";
import RefreshSessionButton from "../RefreshSessionButton";

type User = {
  id: string;
  name: string;
  discordId: string;
  role: string;
  additionalRoles: string[];
  isApproved: boolean;
  isBlocked: boolean;
  moderatesAlco: boolean;
  moderatesPetra: boolean;
  isFrozen: boolean;
  frozenReason: string | null;
  banReason: string | null;
  unbanDate: string | null;
  cardNumber: string | null;
  createdAt: string;
  lastSeenAt: string | null;
};

export function AdminUsersClient() {
  const { data: session, status, update } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockUser, setBlockUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockUntil, setBlockUntil] = useState("");
  const [blockSaving, setBlockSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Check if user has required permissions
  const hasPermission = session?.user?.role === "LEADER" || 
                       session?.user?.role === "DEPUTY" || 
                       session?.user?.role === "SENIOR";

  useEffect(() => {
    if (!hasPermission) {
      setError("Insufficient role-based permissions");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users", { cache: "no-store" });
        const json = await res.json();
        
        if (!json.ok) {
          setError(json.error?.message || "Failed to fetch users");
          return;
        }
        
        setUsers(json.data.users || []);
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (hasPermission) {
      fetchUsers();
    }
  }, [hasPermission]);

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });
      const json = await res.json();
      
      if (json.ok) {
        setUsers(prev => prev.map((u: User) => 
          u.id === userId ? { ...u, isApproved: !currentStatus } : u
        ));
      } else {
        alert(json.error?.message || "Failed to update user approval");
      }
    } catch (err) {
      alert("Failed to update user approval");
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      
      if (json.ok) {
        setUsers(prev =>
          prev.map((u: User) =>
            u.id === userId
              ? {
                  ...u,
                  role: json.data.user?.role ?? newRole,
                  additionalRoles: json.data.user?.additionalRoles ?? u.additionalRoles,
                  moderatesAlco: json.data.user?.moderatesAlco ?? u.moderatesAlco,
                  moderatesPetra: json.data.user?.moderatesPetra ?? u.moderatesPetra,
                  cardNumber: json.data.user?.cardNumber ?? u.cardNumber,
                  isFrozen: json.data.user?.isFrozen ?? u.isFrozen,
                  frozenReason: json.data.user?.frozenReason ?? u.frozenReason,
                }
              : u
          )
        );
      } else {
        alert(json.error?.message || "Failed to update user role");
      }
    } catch (err) {
      alert("Failed to update user role");
    }
  };

  const handleBlockClick = (user: User) => {
    if (user.isBlocked) {
      if (!confirm(`Розблокувати користувача ${user.name}?`)) return;
      submitBlock(user.id, false, null, null);
    } else {
      setBlockUser(user);
      setBlockReason("");
      setBlockUntil("");
    }
  };

  const submitBlock = async (
    userId: string,
    isBlocked: boolean,
    reason: string | null,
    unbanDate: string | null
  ) => {
    try {
      setBlockSaving(true);
      const res = await fetch(`/api/users/${userId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBlocked,
          reason,
          unbanDate,
        }),
      });
      const json = await res.json();

      if (json.ok) {
        setUsers(prev =>
          prev.map((u: User) =>
            u.id === userId
              ? {
                  ...u,
                  isBlocked: json.data.user?.isBlocked ?? isBlocked,
                  banReason: json.data.user?.banReason ?? null,
                  unbanDate: json.data.user?.unbanDate ?? null,
                }
              : u
          )
        );
        setBlockUser(null);
      } else {
        alert(json.error?.message || "Failed to update block status");
      }
    } catch (err) {
      alert("Failed to update block status");
    } finally {
      setBlockSaving(false);
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
  };

  const saveUserDetails = async () => {
    if (!editingUser) return;
    try {
      setEditSaving(true);
      const res = await fetch(`/api/users/${editingUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editingUser.role,
          additionalRoles: editingUser.additionalRoles,
          moderatesAlco: editingUser.moderatesAlco,
          moderatesPetra: editingUser.moderatesPetra,
          cardNumber: editingUser.cardNumber,
          isFrozen: editingUser.isFrozen,
          frozenReason: editingUser.isFrozen
            ? editingUser.frozenReason || null
            : null,
        }),
      });
      const json = await res.json();

      if (json.ok && json.data.user) {
        const updated = json.data.user;
        setUsers(prev =>
          prev.map((u: User) =>
            u.id === updated.id
              ? {
                  ...u,
                  role: updated.role,
                  additionalRoles: updated.additionalRoles,
                  moderatesAlco: updated.moderatesAlco,
                  moderatesPetra: updated.moderatesPetra,
                  cardNumber: updated.cardNumber,
                  isFrozen: updated.isFrozen,
                  frozenReason: updated.frozenReason,
                }
              : u
          )
        );
        setEditingUser(null);
      } else {
        alert(json.error?.message || "Failed to save user settings");
      }
    } catch (err) {
      alert("Failed to save user settings");
    } finally {
      setEditSaving(false);
    }
  };

  const formatLastSeen = (iso: string | null) => {
    if (!iso) return "немає даних";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "невідомо";
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "щойно";
    if (diffMin < 60) return `${diffMin} хв тому`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} год тому`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} дн тому`;
  };

  if (!hasPermission) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full mx-auto">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Недостатньо прав</h2>
        <p className="text-zinc-400 mb-6">
          У вас недостатньо прав для доступу до цієї сторінки
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Повернутися назад
          </Button>
          <RefreshSessionButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full mx-auto">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Помилка</h2>
        <p className="text-zinc-400 mb-6">
          {error}
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="border-white/20 text-white hover:bg-white/10 w-full"
        >
          Спробувати ще раз
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Користувачі</h2>
          <p className="text-zinc-500">Усього: {users.length}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user: User) => (
          <div 
            key={user.id} 
            className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-bold text-white">{user.name}</span>
                <span className="text-xs text-zinc-500">ID: {user.discordId}</span>
                <span className="text-[10px] text-zinc-500">
                  Останній онлайн: {formatLastSeen(user.lastSeenAt)}
                </span>
                {user.cardNumber && (
                  <span className="text-[10px] text-zinc-400">
                    Карта: {user.cardNumber}
                  </span>
                )}
              </div>
              <MultiRoleBadges 
                primaryRole={user.role} 
                additionalRoles={user.additionalRoles} 
                size="sm"
              />
              <div className="flex flex-col text-xs">
                <span className={`font-mono ${user.isApproved ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {user.isApproved ? '✅ Підтверджено' : '❌ Не підтверджено'}
                </span>
                <span className={`${user.isBlocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {user.isBlocked ? '🚫 Заблоковано' : '🟢 Активний'}
                </span>
                {user.isFrozen && (
                  <span className="text-amber-400">
                    🧊 Заморожено{user.frozenReason ? `: ${user.frozenReason}` : ""}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <select
                value={user.role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeRole(user.id, e.target.value)}
                className="px-3 py-1 text-xs bg-zinc-800 border border-zinc-600 rounded text-white"
              >
                <option value="MEMBER">MEMBER</option>
                <option value="ALCO_STAFF">ALCO_STAFF</option>
                <option value="PETRA_STAFF">PETRA_STAFF</option>
                <option value="SENIOR">SENIOR</option>
                <option value="DEPUTY">DEPUTY</option>
                <option value="LEADER">LEADER</option>
              </select>
              <Button
                variant={user.isApproved ? "outline" : "primary"}
                size="sm"
                onClick={() => toggleApproval(user.id, user.isApproved)}
                className={user.isApproved ? "text-rose-400 border-rose-400/30" : "text-emerald-400 border-emerald-400/30"}
              >
                {user.isApproved ? "Відхилити" : "Підтвердити"}
              </Button>
              <Button
                variant={user.isBlocked ? "primary" : "outline"}
                size="sm"
                onClick={() => handleBlockClick(user)}
                className={user.isBlocked ? "text-emerald-400 border-emerald-400/30" : "text-rose-400 border-rose-400/30"}
              >
                {user.isBlocked ? "Розблокувати" : "Заблокувати"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditUser(user)}
                className="text-zinc-300 border-zinc-600/60"
              >
                Деталі
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Block modal */}
      {blockUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              Заблокувати {blockUser.name}?
            </h3>
            <p className="text-xs text-zinc-400">
              Вкажіть причину блокування та (опціонально) дату автоматичного розблокування.
            </p>
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 font-bold uppercase">
                Причина
              </label>
              <textarea
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white"
                rows={3}
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 font-bold uppercase">
                Дата розблокування (опціонально)
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white"
                value={blockUntil}
                onChange={e => setBlockUntil(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlockUser(null)}
                className="flex-1 border-zinc-600 text-zinc-300"
                disabled={blockSaving}
              >
                Скасувати
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  submitBlock(
                    blockUser.id,
                    true,
                    blockReason.trim() || null,
                    blockUntil ? new Date(blockUntil).toISOString() : null
                  )
                }
                className="flex-1 bg-rose-600 hover:bg-rose-500"
                disabled={blockSaving}
              >
                {blockSaving ? "Збереження..." : "Підтвердити блок"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editingUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/10 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              Налаштування користувача {editingUser.name}
            </h3>
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 font-bold uppercase">
                Номер карти
              </label>
              <input
                type="text"
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white"
                value={editingUser.cardNumber ?? ""}
                onChange={e =>
                  setEditingUser(prev =>
                    prev ? { ...prev, cardNumber: e.target.value || null } : prev
                  )
                }
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={editingUser.moderatesAlco}
                  onChange={e =>
                    setEditingUser(prev =>
                      prev
                        ? { ...prev, moderatesAlco: e.target.checked }
                        : prev
                    )
                  }
                />
                Модерує ALCO
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={editingUser.moderatesPetra}
                  onChange={e =>
                    setEditingUser(prev =>
                      prev
                        ? { ...prev, moderatesPetra: e.target.checked }
                        : prev
                    )
                  }
                />
                Модерує PETRA
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={editingUser.isFrozen}
                  onChange={e =>
                    setEditingUser(prev =>
                      prev
                        ? {
                            ...prev,
                            isFrozen: e.target.checked,
                            frozenReason: e.target.checked
                              ? prev.frozenReason
                              : null,
                          }
                        : prev
                    )
                  }
                />
                Заморозити профіль
              </label>
              {editingUser.isFrozen && (
                <textarea
                  className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white"
                  placeholder="Причина заморозки (опціонально)"
                  rows={2}
                  value={editingUser.frozenReason ?? ""}
                  onChange={e =>
                    setEditingUser(prev =>
                      prev
                        ? { ...prev, frozenReason: e.target.value || null }
                        : prev
                    )
                  }
                />
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
                className="flex-1 border-zinc-600 text-zinc-300"
                disabled={editSaving}
              >
                Скасувати
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={saveUserDetails}
                className="flex-1"
                disabled={editSaving}
              >
                {editSaving ? "Збереження..." : "Зберегти"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}