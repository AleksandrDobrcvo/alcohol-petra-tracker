"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MultiRoleBadges } from "../ui/RoleBadge";
import { Button } from "../ui/Button";
import RefreshSessionButton from "../RefreshSessionButton";
import {
  Search,
  SlidersHorizontal,
  Shield,
  Users as UsersIcon,
  Snowflake,
  UserCheck,
  UserX,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";

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
  activeWarnings: number;
};

type Warning = {
  id: string;
  reason: string;
  requiredAmount: number;
  workedOffAmount: number;
  isWorkedOff: boolean;
  issuedAt: string;
  issuedBy: { id: string; name: string; role: string };
};

type RoleOption = {
  name: string;
  label: string;
};

type StatusFilter = "ALL" | "APPROVED" | "PENDING" | "BLOCKED" | "FROZEN";
type SortKey = "ROLE" | "NAME" | "LAST_SEEN" | "CREATED_AT";

export function AdminUsersClient() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockUser, setBlockUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockUntil, setBlockUntil] = useState("");
  const [blockSaving, setBlockSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [search, setSearch] = useState("");
  
  // Warning (доган) state
  const [warningUser, setWarningUser] = useState<User | null>(null);
  const [warningReason, setWarningReason] = useState("");
  const [warningAmount, setWarningAmount] = useState(50);
  const [warningSaving, setWarningSaving] = useState(false);
  const [viewWarningsUser, setViewWarningsUser] = useState<User | null>(null);
  const [userWarnings, setUserWarnings] = useState<Warning[]>([]);
  const [warningsLoading, setWarningsLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("ROLE");
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  // Check if user has required permissions
  const hasPermission =
    session?.user?.role === "LEADER" ||
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

  // Load available role definitions for additional roles selector
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("/api/admin/roles", { cache: "no-store" });
        const json = await res.json();
        if (json.ok) {
          const opts =
            (json.data.roles as any[]).map((r) => ({
              name: r.name as string,
              label: (r.label as string) || (r.name as string),
            })) ?? [];
          setRoleOptions(opts);
        }
      } catch {
        // тихо игнорируем, это не критично
      }
    };
    if (hasPermission) {
      fetchRoles();
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

  // Warning functions
  const openWarningModal = (user: User) => {
    setWarningUser(user);
    setWarningReason("");
    setWarningAmount(50);
  };

  const submitWarning = async () => {
    if (!warningUser || !warningReason.trim()) return;
    
    try {
      setWarningSaving(true);
      const res = await fetch(`/api/users/${warningUser.id}/warning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: warningReason.trim(),
          requiredAmount: warningAmount,
        }),
      });
      const json = await res.json();

      if (json.ok) {
        setUsers(prev =>
          prev.map((u: User) =>
            u.id === warningUser.id
              ? {
                  ...u,
                  activeWarnings: json.data.activeWarnings,
                  isFrozen: json.data.isFrozen || u.isFrozen,
                  frozenReason: json.data.isFrozen ? "Автоматична заморозка: 3 догани" : u.frozenReason,
                }
              : u
          )
        );
        setWarningUser(null);
        alert(json.data.message || "Доган успішно видано");
      } else {
        alert(json.error?.message || "Помилка при видачі догана");
      }
    } catch (err) {
      alert("Помилка при видачі догана");
    } finally {
      setWarningSaving(false);
    }
  };

  const openViewWarnings = async (user: User) => {
    setViewWarningsUser(user);
    setWarningsLoading(true);
    
    try {
      const res = await fetch(`/api/users/${user.id}/warning`);
      const json = await res.json();
      
      if (json.ok) {
        setUserWarnings(json.data.warnings || []);
      } else {
        setUserWarnings([]);
      }
    } catch {
      setUserWarnings([]);
    } finally {
      setWarningsLoading(false);
    }
  };

  const removeWarning = async (warningId: string) => {
    if (!viewWarningsUser) return;
    if (!confirm("Ви впевнені, що хочете зняти цей доган?")) return;
    
    try {
      const res = await fetch(`/api/users/${viewWarningsUser.id}/warning`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warningId }),
      });
      const json = await res.json();

      if (json.ok) {
        setUserWarnings(prev => prev.filter(w => w.id !== warningId));
        setUsers(prev =>
          prev.map((u: User) =>
            u.id === viewWarningsUser.id
              ? {
                  ...u,
                  activeWarnings: json.data.activeWarnings,
                  isFrozen: json.data.wasUnfrozen ? false : u.isFrozen,
                  frozenReason: json.data.wasUnfrozen ? null : u.frozenReason,
                }
              : u
          )
        );
        alert(json.data.message || "Доган знято");
      } else {
        alert(json.error?.message || "Помилка при знятті догана");
      }
    } catch {
      alert("Помилка при знятті догана");
    }
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

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "невідомо";
    return d.toLocaleDateString("uk-UA", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const stats = useMemo(() => {
    const total = users.length;
    const approved = users.filter((u) => u.isApproved).length;
    const blocked = users.filter((u) => u.isBlocked).length;
    const frozen = users.filter((u) => u.isFrozen).length;
    const pending = total - approved;
    const withWarnings = users.filter((u) => (u.activeWarnings || 0) > 0).length;
    return { total, approved, blocked, frozen, pending, withWarnings };
  }, [users]);

  const isUserOnline = (u: User) => {
    if (!u.lastSeenAt) return false;
    const t = new Date(u.lastSeenAt).getTime();
    if (!t) return false;
    return Date.now() - t < 5 * 60 * 1000;
  };

  const filteredUsers = useMemo(() => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    const text = search.trim().toLowerCase();

    let list = [...users];

    if (text) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(text) ||
          u.discordId.toLowerCase().includes(text)
      );
    }

    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "ALL") {
      list = list.filter((u) => {
        if (statusFilter === "APPROVED") return u.isApproved && !u.isBlocked;
        if (statusFilter === "PENDING") return !u.isApproved;
        if (statusFilter === "BLOCKED") return u.isBlocked;
        if (statusFilter === "FROZEN") return u.isFrozen;
        return true;
      });
    }

    list.sort((a, b) => {
      if (sortBy === "NAME") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "ROLE") {
        if (a.role === b.role) return a.name.localeCompare(b.name);
        return a.role.localeCompare(b.role);
      }
      if (sortBy === "CREATED_AT") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "LAST_SEEN") {
        const aTime = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
        const bTime = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
        const aOnline = aTime && now - aTime < fiveMinutes;
        const bOnline = bTime && now - bTime < fiveMinutes;
        if (aOnline !== bOnline) return aOnline ? -1 : 1;
        return bTime - aTime;
      }
      return 0;
    });

    return list;
  }, [users, search, roleFilter, statusFilter, sortBy]);

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
      {/* Header + quick stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Користувачі
          </h2>
          <p className="text-zinc-500 text-sm">
            Керування доступом та ролями учасників клану
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-zinc-400" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                Всього
              </div>
              <div className="font-bold text-white">{stats.total}</div>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-emerald-300/80">
                Підтверджено
              </div>
              <div className="font-bold text-emerald-200">{stats.approved}</div>
            </div>
          </div>
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-2 flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-rose-300/80">
                Заблоковано
              </div>
              <div className="font-bold text-rose-200">{stats.blocked}</div>
            </div>
          </div>
          <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 px-3 py-2 flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-sky-300" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-sky-200/80">
                Заморожено
              </div>
              <div className="font-bold text-sky-100">{stats.frozen}</div>
            </div>
          </div>
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-orange-300/80">
                З доганами
              </div>
              <div className="font-bold text-orange-200">{stats.withWarnings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук за ім'ям або Discord ID…"
              className="w-full rounded-xl bg-zinc-900/60 border border-white/10 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
            />
          </div>
          <div className="hidden md:flex items-center gap-1">
            <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Фільтри
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {/* Status filter pills */}
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.16em] uppercase ${
              statusFilter === "ALL"
                ? "bg-white text-black border-white"
                : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Усі
          </button>
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.16em] uppercase ${
              statusFilter === "APPROVED"
                ? "bg-emerald-500 text-white border-emerald-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
            }`}
          >
            Підтверджені
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.16em] uppercase ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-white border-amber-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            }`}
          >
            Очікують
          </button>
          <button
            onClick={() => setStatusFilter("BLOCKED")}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.16em] uppercase ${
              statusFilter === "BLOCKED"
                ? "bg-rose-500 text-white border-rose-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
            }`}
          >
            Заблоковані
          </button>
          <button
            onClick={() => setStatusFilter("FROZEN")}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.16em] uppercase ${
              statusFilter === "FROZEN"
                ? "bg-sky-500 text-white border-sky-400"
                : "bg-sky-500/10 border-sky-500/30 text-sky-200 hover:bg-sky-500/20"
            }`}
          >
            Заморожені
          </button>
        </div>
      </div>

      {/* Role + sort */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2 text-xs">
          {["LEADER", "DEPUTY", "SENIOR", "ALCO_STAFF", "PETRA_STAFF", "MEMBER"].map(
            (role) => (
              <button
                key={role}
                onClick={() =>
                  setRoleFilter((prev) => (prev === role ? "ALL" : (role as any)))
                }
                className={`px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.16em] uppercase ${
                  roleFilter === role
                    ? "bg-white text-black border-white"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                }`}
              >
                {role}
              </button>
            )
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CalendarClock className="w-4 h-4 text-zinc-500" />
          <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            Сортування
          </span>
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortBy(e.target.value as SortKey)
            }
            className="rounded-xl bg-zinc-900/70 border border-white/10 px-3 py-1.5 text-xs text-white"
          >
            <option value="ROLE">За роллю</option>
            <option value="NAME">За ім'ям</option>
            <option value="LAST_SEEN">За активністю</option>
            <option value="CREATED_AT">За датою створення</option>
          </select>
        </div>
      </div>

      {/* Users list */}
      <div className="grid gap-4">
        {filteredUsers.map((user: User) => (
          <div 
            key={user.id} 
            className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <Link
                  href={`/profile/${user.id}`}
                  className="font-bold text-white hover:text-amber-300 transition-colors"
                >
                  {user.name}
                </Link>
                <span className="text-xs text-zinc-500">ID: {user.discordId}</span>
                <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  Створено: {formatDate(user.createdAt)}
                </span>
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
                <span className={`${user.isBlocked ? 'text-rose-400' : isUserOnline(user) ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {user.isBlocked
                    ? '🚫 Заблоковано'
                    : isUserOnline(user)
                    ? '🟢 Зараз онлайн'
                    : '⚪ Офлайн'}
                </span>
                {user.isFrozen && (
                  <span className="text-amber-400">
                    Заморожено{user.frozenReason ? `: ${user.frozenReason}` : ""}
                  </span>
                )}
                {(user.activeWarnings || 0) > 0 && (
                  <span className={`flex items-center gap-1 ${
                    user.activeWarnings >= 3 ? 'text-rose-400' : 
                    user.activeWarnings >= 2 ? 'text-orange-400' : 'text-amber-400'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    Догани: {user.activeWarnings}/3
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => openWarningModal(user)}
                className="text-orange-400 border-orange-400/30"
                disabled={(user.activeWarnings || 0) >= 3}
              >
                Доган
              </Button>
              {(user.activeWarnings || 0) > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openViewWarnings(user)}
                  className="text-amber-400 border-amber-400/30"
                >
                  {user.activeWarnings}/3
                </Button>
              )}
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
            {roleOptions.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] text-zinc-500 font-bold uppercase">
                  Додаткові ролі
                </label>
                <div className="flex flex-wrap gap-2">
                  {roleOptions
                    .filter((r) => r.name !== editingUser.role)
                    .map((r) => {
                      const active = editingUser.additionalRoles.includes(r.name);
                      return (
                        <button
                          key={r.name}
                          type="button"
                          onClick={() =>
                            setEditingUser((prev) => {
                              if (!prev) return prev;
                              const exists = prev.additionalRoles.includes(r.name);
                              return {
                                ...prev,
                                additionalRoles: exists
                                  ? prev.additionalRoles.filter((x) => x !== r.name)
                                  : [...prev.additionalRoles, r.name],
                              };
                            })
                          }
                          className={`px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.16em] uppercase ${
                            active
                              ? "bg-purple-500 text-white border-purple-400"
                              : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
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

      {/* Issue Warning Modal */}
      {warningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-orange-500/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-bold text-white">
                Видати доган - {warningUser.name}
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Поточна кількість доганів: <span className="font-bold text-orange-300">{warningUser.activeWarnings || 0}/3</span>
              {(warningUser.activeWarnings || 0) >= 2 && (
                <span className="block text-rose-400 mt-1">
                  Увага! При видачі 3-го догана користувача буде автоматично заморожено.
                </span>
              )}
            </p>
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 font-bold uppercase">
                Причина догана *
              </label>
              <textarea
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white"
                rows={3}
                placeholder="Вкажіть причину догана..."
                value={warningReason}
                onChange={e => setWarningReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 font-bold uppercase">
                Кількість для відпрацювання (шт.)
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white"
                value={warningAmount}
                onChange={e => setWarningAmount(parseInt(e.target.value) || 50)}
              />
              <p className="text-[10px] text-zinc-500">
                Користувач зможе відпрацювати доган, здаючи петру або алко
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWarningUser(null)}
                className="flex-1 border-zinc-600 text-zinc-300"
                disabled={warningSaving}
              >
                Скасувати
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={submitWarning}
                className="flex-1 bg-orange-600 hover:bg-orange-500"
                disabled={warningSaving || !warningReason.trim()}
              >
                {warningSaving ? "Збереження..." : "Видати доган"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Warnings Modal */}
      {viewWarningsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-amber-500/30 p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Догани - {viewWarningsUser.name}
                </h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                (viewWarningsUser.activeWarnings || 0) >= 3 
                  ? 'bg-rose-500/20 text-rose-300' 
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {viewWarningsUser.activeWarnings || 0}/3
              </span>
            </div>
            
            {warningsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
              </div>
            ) : userWarnings.length === 0 ? (
              <p className="text-zinc-400 text-center py-4">Доганів немає</p>
            ) : (
              <div className="space-y-3">
                {userWarnings.map((warning, idx) => (
                  <div 
                    key={warning.id}
                    className={`rounded-xl p-4 border ${
                      warning.isWorkedOff 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-zinc-800/50 border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-zinc-500">Доган #{userWarnings.length - idx}</span>
                        <h4 className="font-bold text-white">{warning.reason}</h4>
                      </div>
                      {warning.isWorkedOff ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          ВІДПРАЦЬОВАНО
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeWarning(warning.id)}
                          className="text-rose-400 border-rose-400/30 text-xs px-2 py-1"
                        >
                          Зняти
                        </Button>
                      )}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Прогрес відпрацювання</span>
                        <span>{warning.workedOffAmount}/{warning.requiredAmount}</span>
                      </div>
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            warning.isWorkedOff ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (warning.workedOffAmount / warning.requiredAmount) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Видав: {warning.issuedBy?.name || 'Невідомо'}</span>
                      <span>{new Date(warning.issuedAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewWarningsUser(null)}
                className="w-full border-zinc-600 text-zinc-300"
              >
                Закрити
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
