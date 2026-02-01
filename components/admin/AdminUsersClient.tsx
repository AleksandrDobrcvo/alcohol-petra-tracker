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
import { useNotifications } from "@/components/ui/Toast";
import { MultiRoleBadges } from "@/components/ui/RoleBadge";

type UserRow = {
  id: string;
  discordId: string;
  name: string;
  role: string;
  additionalRoles?: string[];
  isBlocked: boolean;
  banReason?: string | null;
  unbanDate?: string | null;
  isApproved: boolean;
  cardNumber: string | null;
  moderatesAlco: boolean;
  moderatesPetra: boolean;
  lastSeenAt?: string | null;
};

type RoleDef = {
  name: string;
  label: string;
  emoji: string;
  color: string;
  textColor: string;
  power: number;
  desc?: string;
};

export function AdminUsersClient() {
  const { data: session } = useSession();
  const { success, error: notifyError } = useNotifications();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [banModalUser, setBanModalUser] = useState<UserRow | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("");
  const [unbanDateInput, setUnbanDateInput] = useState("");
  const [reason, setReason] = useState("");

  const ROOT_ID = "1223246458975686750";
  const myDiscordId = (session?.user as any)?.discordId;
  const isRoot = myDiscordId === ROOT_ID;

  // Check if user is online (active in last 5 minutes)
  function isOnline(user: UserRow): boolean {
    if (!user.lastSeenAt) return false;
    const lastSeen = new Date(user.lastSeenAt);
    return Date.now() - lastSeen.getTime() < 5 * 60 * 1000;
  }

  // Format last seen time
  function formatLastSeen(user: UserRow): string {
    if (!user.lastSeenAt) return "Ніколи";
    const lastSeen = new Date(user.lastSeenAt);
    const diff = Date.now() - lastSeen.getTime();
    
    if (diff < 60 * 1000) return "Щойно";
    if (diff < 5 * 60 * 1000) return "Онлайн";
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} хв тому`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} год тому`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)} дн тому`;
    return lastSeen.toLocaleDateString("uk-UA");
  }

  // Fallback role powers if not loaded from DB yet
  const ROLE_POWER: Record<string, number> = roles.length > 0 
    ? Object.fromEntries(roles.map(r => [r.name, r.power]))
    : {
        LEADER: 100,
        DEPUTY: 80,
        SENIOR: 60,
        ALCO_STAFF: 40,
        PETRA_STAFF: 40,
        MEMBER: 20,
      };

  const myRole = session?.user?.role || "MEMBER";
  const myUserId = session?.user?.id;
  const myPower = isRoot ? 999 : (ROLE_POWER[myRole] || 0);

  // Check if current user can modify target user
  function canModifyUser(target: UserRow): boolean {
    // Cannot modify yourself
    if (target.id === myUserId && !isRoot) return false;
    // Root can modify anyone
    if (isRoot) return true;
    // Cannot modify ROOT user
    if (target.discordId === ROOT_ID) return false;
    // Cannot modify users with same or higher power
    const targetPower = ROLE_POWER[target.role] || 0;
    return targetPower < myPower;
  }

  // Check if current user can assign a specific role
  function canAssignRole(roleName: string): boolean {
    if (isRoot) return true;
    const rolePower = ROLE_POWER[roleName] || 0;
    // Can only assign roles with LOWER power than yours
    return rolePower < myPower;
  }

  // Get reason why user cannot be modified
  function getModifyBlockReason(target: UserRow): string {
    if (target.id === myUserId) return "Ви не можете змінювати себе";
    if (target.discordId === ROOT_ID) return "Цей користувач захищений";
    const targetPower = ROLE_POWER[target.role] || 0;
    if (targetPower >= myPower) return "Роль користувача вища або рівна вашій";
    return "";
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/admin/roles", { cache: "no-store" })
      ]);
      
      const uJson = await uRes.json();
      const rJson = await rRes.json();

      if (!uJson.ok) throw new Error("Failed to load users");
      setUsers(uJson.data.users);

      if (rJson.ok) {
        setRoles(rJson.data.roles);
      }
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
      success("Успіх!", "Дані користувача оновлено");
      await load();
      // Update selected user if modal is open
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleBan(user: UserRow) {
    if (!banReasonInput.trim()) {
      notifyError("Помилка", "Необхідно вказати причину бана");
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}/block`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          isBlocked: true, 
          reason: banReasonInput,
          unbanDate: unbanDateInput ? new Date(unbanDateInput).toISOString() : null
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Block update failed");
      
      success("Успіх!", `Користувача ${user.name} заблоковано`);
      setBanModalUser(null);
      setBanReasonInput("");
      setUnbanDateInput("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function handleUnban(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}/block`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isBlocked: false }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Unblock failed");
      success("Успіх!", "Користувача розблоковано");
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
            filteredUsers.map((u, idx) => {
              const roleDef = roles.find(r => r.name === u.role);
              return (
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
                      <div className="relative">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${roleDef?.color || 'from-zinc-800 to-zinc-900'} border border-white/10 text-xl shadow-inner`}>
                          {roleDef?.emoji || '👤'}
                        </div>
                        {/* Online indicator */}
                        {isOnline(u) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-zinc-900 shadow-lg shadow-green-500/50"
                          >
                            <motion.div
                              className="absolute inset-0 rounded-full bg-green-400"
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-none mb-1">{u.name}</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{u.discordId}</p>
                      </div>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 ${roleDef?.textColor || 'text-zinc-400'}`}>
                      {roleDef?.label || u.role}
                    </div>
                  </div>

                  {/* Multi-role badges */}
                  <div className="mb-4">
                    <MultiRoleBadges
                      primaryRole={u.role}
                      additionalRoles={u.additionalRoles || []}
                      roleDefs={roles}
                      size="sm"
                      maxVisible={3}
                    />
                  </div>

                <div className="space-y-3 mb-6">
                  {/* Online/Last Seen Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Статус:</span>
                    <span className={`flex items-center gap-1.5 font-medium ${isOnline(u) ? 'text-green-400' : 'text-zinc-500'}`}>
                      {isOnline(u) ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Онлайн
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                          {formatLastSeen(u)}
                        </>
                      )}
                    </span>
                  </div>
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
                    title={getModifyBlockReason(u) || 'Керування роллю'}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Роль
                    {!canModifyUser(u) && <span className="text-[8px]">🔒</span>}
                  </button>

                  <button
                    onClick={() => {
                      if (u.isBlocked) {
                        handleUnban(u.id);
                      } else {
                        setBanModalUser(u);
                      }
                    }}
                    disabled={!canModifyUser(u)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      u.isBlocked 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95' 
                        : 'bg-white/5 text-zinc-500 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20'
                    } disabled:opacity-20 disabled:cursor-not-allowed`}
                    title={u.isBlocked ? 'Розблокувати' : 'Заблокувати'}
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
          )}
        </AnimatePresence>
      </div>

      {/* Role Management Modal */}
      {/* Ban Management Modal */}
      <AnimatePresence>
        {banModalUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBanModalUser(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[3rem] border border-red-500/30 bg-zinc-950 p-8 shadow-[0_0_100px_rgba(239,68,68,0.2)]"
            >
              <div className="text-center mb-8">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-red-600 to-red-950 text-5xl shadow-[0_10px_40px_rgba(220,38,38,0.4)] ring-4 ring-red-500/20 animate-pulse">
                  🚫
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Блокування доступу</h2>
                <p className="text-sm text-zinc-400 mt-2 font-medium">Ви збираєтесь заблокувати <span className="text-red-400 font-bold">{banModalUser.name}</span></p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-red-500/70 uppercase tracking-[0.2em] px-2">Причина бана (Обов'язково)</label>
                  <textarea
                    placeholder="Наприклад: Порушення правил клану, неадекватна поведінка..."
                    className="w-full rounded-[1.8rem] border border-white/5 bg-white/5 p-5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all min-h-[120px] shadow-inner"
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2">Дата розбану (Опціонально)</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                    value={unbanDateInput}
                    onChange={(e) => setUnbanDateInput(e.target.value)}
                  />
                  <p className="text-[10px] text-zinc-600 px-2 italic">Залиште порожнім для перманентного бана</p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-[10px] text-red-300 leading-tight">
                    Це дія обмежить користувачеві доступ до всіх функцій сайту. Ви впевнені?
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setBanModalUser(null)}
                    className="flex-1 rounded-[1.5rem] bg-white/5 px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Відмінити
                  </button>
                  <button
                    onClick={() => handleBan(banModalUser)}
                    className="flex-[2] rounded-[1.5rem] bg-gradient-to-r from-red-600 to-red-800 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-900/40 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    ПІДТВЕРДИТИ БАН
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    {roles.map((r) => {
                      const canAssign = canAssignRole(r.name);
                      const isCurrentRole = selectedUser.role === r.name;
                      const isSameUser = selectedUser.id === session?.user?.id;
                      const isDisabled = isCurrentRole || !canAssign || (isSameUser && !isRoot);
                      
                      return (
                        <button
                          key={r.name}
                          onClick={() => updatePermissions(selectedUser.id, { role: r.name })}
                          disabled={isDisabled}
                          className={`group relative flex items-center gap-4 rounded-[1.8rem] border p-4 text-left transition-all duration-300 ${
                            isCurrentRole
                              ? `border-white/30 bg-gradient-to-br ${r.color} shadow-xl scale-[1.02]`
                              : !canAssign 
                                ? 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed grayscale' 
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]'
                          } disabled:cursor-not-allowed active:scale-95`}
                        >
                          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 ${
                            isCurrentRole ? 'bg-black/20 border-white/40 rotate-6' : `bg-gradient-to-br ${r.color} border-white/20 group-hover:rotate-6`
                          } text-2xl shadow-inner`}>
                            {r.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-black uppercase tracking-widest ${
                                isCurrentRole ? 'text-white drop-shadow-md' : r.textColor
                              }`}>
                                {r.label}
                              </p>
                              <span className="text-[10px] font-mono opacity-50">PW:{r.power}</span>
                              {!canAssign && !isCurrentRole && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] text-red-400 font-bold border border-red-500/20">
                                  🔒
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] ${isCurrentRole ? 'text-white/80' : 'text-zinc-500'} mt-1 leading-tight font-medium`}>
                              {r.desc || "Немає опису"}
                            </p>
                          </div>
                          {isCurrentRole && (
                            <motion.div 
                              layoutId="check"
                              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black text-[12px] font-black shadow-xl"
                            >
                              ✓
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Roles Section */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2">
                  <span>Додаткові ролі</span>
                  <span className="text-amber-500">✨</span>
                </p>
                <p className="text-[9px] text-zinc-600 px-1 -mt-1">Ці ролі будуть показані поряд з основною</p>
                <div className="grid grid-cols-2 gap-2">
                  {roles.filter(r => r.name !== selectedUser.role && canAssignRole(r.name)).map((r) => {
                    const isActive = selectedUser.additionalRoles?.includes(r.name);
                    return (
                      <motion.button
                        key={r.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const currentAdditional = selectedUser.additionalRoles || [];
                          const newAdditional = isActive
                            ? currentAdditional.filter(n => n !== r.name)
                            : [...currentAdditional, r.name];
                          updatePermissions(selectedUser.id, { additionalRoles: newAdditional } as any);
                        }}
                        className={`relative overflow-hidden flex items-center gap-2 rounded-xl border p-3 transition-all ${
                          isActive 
                            ? `border-white/30 bg-gradient-to-br ${r.color} shadow-lg` 
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {/* Shimmer for active */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                        <span className="text-lg relative">{r.emoji}</span>
                        <span className={`text-xs font-bold relative ${isActive ? 'text-white' : r.textColor}`}>
                          {r.label}
                        </span>
                        {isActive && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto text-white text-xs"
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.button>
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

