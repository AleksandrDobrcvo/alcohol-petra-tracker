"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Shield, 
  UserCheck, 
  UserX, 
  MoreHorizontal, 
  Settings, 
  Search,
  RefreshCcw,
  CreditCard,
  AlertCircle,
  Beer,
  Sprout
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MaintenanceToggleClient } from "@/components/admin/MaintenanceToggleClient";

type UserRow = {
  id: string;
  discordId: string;
  name: string;
  role: "LEADER" | "DEPUTY" | "SENIOR" | "ALCO_STAFF" | "PETRA_STAFF" | "MEMBER";
  isBlocked: boolean;
  isApproved: boolean;
  cardNumber: string | null;
  moderatesAlco: boolean;
  moderatesPetra: boolean;
};

export function AdminUsersClient() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [reason, setReason] = useState("");

  // Role hierarchy - higher = more power
  const ROLE_POWER: Record<string, number> = {
    LEADER: 100,
    DEPUTY: 80,
    SENIOR: 60,
    ALCO_STAFF: 40,
    PETRA_STAFF: 40,
    MEMBER: 20,
  };

  const myRole = session?.user?.role || "MEMBER";
  const myPower = ROLE_POWER[myRole] || 0;

  // Check if current user can modify target user
  function canModifyUser(target: UserRow): boolean {
    if (myRole === "LEADER") return true;
    const targetPower = ROLE_POWER[target.role] || 0;
    return targetPower < myPower;
  }

  // Check if current user can assign a specific role
  function canAssignRole(role: string): boolean {
    if (myRole === "LEADER") return true;
    const rolePower = ROLE_POWER[role] || 0;
    return rolePower < myPower;
  }

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

  async function updatePermissions(id: string, data: Partial<UserRow>) {
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, reason: reason || "Admin update" }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Update failed");
      setReason("");
      await load();
      // Update selected user if modal is open
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
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

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.discordId.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Пошук за ніком або Discord ID..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-sm text-zinc-400 sm:block">
            Всього: <span className="text-white font-bold">{users.length}</span>
          </div>
          <button 
            onClick={load} 
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Оновити
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
        <MaintenanceToggleClient />
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl bg-white/5 border border-white/10" />
            ))
          ) : (
            filteredUsers.map((u, idx) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative rounded-3xl border border-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 ${u.isBlocked ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 text-xl shadow-inner">
                      👤
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-none mb-1">{u.name}</h3>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{u.discordId}</p>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    u.role === 'LEADER' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    u.role === 'DEPUTY' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                    u.role === 'SENIOR' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                  }`}>
                    {u.role === 'LEADER' ? 'Лідер' : 
                     u.role === 'DEPUTY' ? 'Заступник' : 
                     u.role === 'SENIOR' ? 'Старший' : 
                     u.role === 'ALCO_STAFF' ? 'Сл. Алко' : 
                     u.role === 'PETRA_STAFF' ? 'Сл. Петра' : 
                     'Учасник'}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Статус доступу:</span>
                    <span className={`font-medium ${u.isApproved ? 'text-green-400' : 'text-amber-400'}`}>
                      {u.isApproved ? 'Підтверджено' : 'В очікуванні'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Бан-статус:</span>
                    <span className={`font-medium ${u.isBlocked ? 'text-red-400' : 'text-zinc-400'}`}>
                      {u.isBlocked ? 'ЗАБЛОКОВАНО' : 'Чистий'}
                    </span>
                  </div>
                  {u.cardNumber && (
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 text-xs border border-white/5">
                      <CreditCard className="w-3 h-3 text-zinc-400" />
                      <span className="text-zinc-300 font-mono">{u.cardNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setApproved(u.id, !u.isApproved)}
                    disabled={u.role === "LEADER"}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                      u.isApproved 
                        ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300' 
                        : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/30'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {u.isApproved ? 'Скинути' : 'Схвалити'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedUser(u)}
                    disabled={!canModifyUser(u)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                      canModifyUser(u) 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30' 
                        : 'bg-zinc-800/50 text-zinc-600 border border-zinc-700/50 cursor-not-allowed'
                    }`}
                    title={!canModifyUser(u) ? 'Неможливо змінити (роль вища або рівна вашій)' : 'Керування роллю'}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Роль
                    {!canModifyUser(u) && <span className="text-[8px]">🔒</span>}
                  </button>

                  <button
                    onClick={() => setBlocked(u.id, !u.isBlocked)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      u.isBlocked 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                        : 'bg-white/5 text-zinc-500 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20'
                    }`}
                    title={u.isBlocked ? 'Розблокувати' : 'Заблокувати'}
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Role Management Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-[2.5rem] border border-white/10 bg-zinc-900 p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 text-3xl shadow-lg">
                  👑
                </div>
                <h2 className="text-2xl font-bold text-white">Керування роллю</h2>
                <p className="text-sm text-zinc-500 mt-1">Зміна повноважень для {selectedUser.name}</p>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Виберіть роль</p>
                  {myRole !== "LEADER" && (
                    <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mb-4">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-[10px] text-amber-400">
                        Ви можете призначати тільки ролі нижчі за вашу ({myRole === 'DEPUTY' ? 'Заступник' : myRole === 'SENIOR' ? 'Старший' : myRole})
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3">
                    {(['LEADER', 'DEPUTY', 'SENIOR', 'ALCO_STAFF', 'PETRA_STAFF', 'MEMBER'] as const).map((r) => {
                      const canAssign = canAssignRole(r);
                      const isCurrentRole = selectedUser.role === r;
                      const isSameUser = selectedUser.id === session?.user?.id;
                      const isDisabled = isCurrentRole || !canAssign || (isSameUser && myRole !== 'LEADER');
                      
                      return (
                        <button
                          key={r}
                          onClick={() => updatePermissions(selectedUser.id, { role: r })}
                          disabled={isDisabled}
                          className={`group relative flex items-center gap-4 rounded-[1.5rem] border p-4 text-left transition-all ${
                            isCurrentRole
                              ? 'border-amber-500/50 bg-amber-500/10'
                              : !canAssign 
                                ? 'border-white/5 bg-white/5 opacity-30 cursor-not-allowed' 
                                : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                          } disabled:cursor-not-allowed`}
                        >
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                            r === 'LEADER' ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' :
                            r === 'DEPUTY' ? 'bg-sky-500/20 border-sky-500/30 text-sky-500' :
                            r === 'SENIOR' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' :
                            'bg-zinc-500/20 border-zinc-500/30 text-zinc-400'
                          }`}>
                            {r === 'LEADER' ? '👑' : r === 'DEPUTY' ? '🛡️' : r === 'SENIOR' ? '⚔️' : r.includes('STAFF') ? '📋' : '👤'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-bold uppercase tracking-widest ${
                                isCurrentRole ? 'text-white' : 'text-zinc-500'
                              }`}>
                                {r === 'LEADER' ? 'Лідер' : 
                                 r === 'DEPUTY' ? 'Заступник' : 
                                 r === 'SENIOR' ? 'Старший' : 
                                 r === 'ALCO_STAFF' ? 'Сл. Алко' : 
                                 r === 'PETRA_STAFF' ? 'Сл. Петра' : 
                                 'Учасник'}
                              </p>
                              {!canAssign && !isCurrentRole && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                                  🔒
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                              {r === 'LEADER' ? 'Повний доступ до всього' : 
                               r === 'DEPUTY' ? 'Високий рівень доступу та керування' : 
                               r === 'SENIOR' ? 'Розширені права модерації' :
                               r === 'ALCO_STAFF' ? 'Модерація алкоголю' :
                               r === 'PETRA_STAFF' ? 'Модерація петри' :
                               'Звичайний учасник клану'}
                            </p>
                          </div>
                          {isCurrentRole && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-black shadow-lg">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Додаткові права (Модерація)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updatePermissions(selectedUser.id, { moderatesAlco: !selectedUser.moderatesAlco })}
                      className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
                        selectedUser.moderatesAlco ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-white/5 text-zinc-500'
                      }`}
                    >
                      <Beer className="w-4 h-4" />
                      <span className="text-sm font-bold">Алко</span>
                    </button>
                    <button
                      onClick={() => updatePermissions(selectedUser.id, { moderatesPetra: !selectedUser.moderatesPetra })}
                      className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
                        selectedUser.moderatesPetra ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-zinc-500'
                      }`}
                    >
                      <Sprout className="w-4 h-4" />
                      <span className="text-sm font-bold">Петра</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 px-1">Причина зміни</label>
                  <textarea
                    placeholder="Вкажіть причину..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all min-h-[80px]"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 rounded-2xl bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-all"
                  >
                    Закрити
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

