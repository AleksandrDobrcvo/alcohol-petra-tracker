"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MultiRoleBadges } from "@/components/ui/RoleBadge";
import {
  Calendar,
  Clock,
  ExternalLink,
  Shield,
  Snowflake,
  User,
  Beer,
  Sprout,
  Star,
  Wallet,
  History,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";

type Viewer = {
  id: string;
  role: string;
};

type ProfileUser = {
  id: string;
  name: string;
  discordId: string;
  role: string;
  additionalRoles: string[];
  isApproved: boolean;
  isBlocked: boolean;
  banReason: string | null;
  unbanDate: string | null;
  isFrozen: boolean;
  frozenReason: string | null;
  cardNumber: string | null;
  createdAt: string;
  lastSeenAt: string | null;
};

type EntrySummary = {
  id: string;
  date: string;
  type: string;
  stars: number;
  quantity: number;
  amount: number;
  paymentStatus: "PAID" | "UNPAID";
};

type RequestSummary = {
  id: string;
  date: string;
  type: string;
  stars1Qty: number;
  stars2Qty: number;
  stars3Qty: number;
  totalAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decisionNote: string | null;
  decidedAt: string | null;
  decidedBy: {
    id: string;
    name: string;
    role: string;
    additionalRoles: string[];
  } | null;
};

type Warning = {
  id: string;
  reason: string;
  requiredAmount: number;
  workedOffAmount: number;
  isWorkedOff: boolean;
  issuedAt: string;
  workedOffType: string | null;
  issuedBy: { id: string; name: string; role: string };
};

type Props = {
  user: ProfileUser;
  stats: {
    totalEntries: number;
    totalQuantity: number;
    totalAmount: number;
    alcoQuantity: number;
    alcoAmount: number;
    petraQuantity: number;
    petraAmount: number;
  };
  recentEntries: EntrySummary[];
  recentRequests: RequestSummary[];
  viewer: Viewer;
};

function formatDate(date: string | null) {
  if (!date) return "невідомо";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "невідомо";
  return d.toLocaleDateString("uk-UA", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(date: string | null) {
  if (!date) return "невідомо";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "невідомо";
  return d.toLocaleString("uk-UA", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLastSeen(iso: string | null) {
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
}

export function UserProfileClient({
  user,
  stats,
  recentEntries,
  recentRequests,
  viewer,
}: Props) {
  const isSelf = viewer.id === user.id;
  const isAdmin =
    viewer.role === "LEADER" ||
    viewer.role === "DEPUTY" ||
    viewer.role === "SENIOR";

  // Warnings state
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [activeWarnings, setActiveWarnings] = useState(0);
  const [warningsLoading, setWarningsLoading] = useState(false);

  // Load warnings for this user (if self or admin)
  useEffect(() => {
    if (!isSelf && !isAdmin) return;
    
    const loadWarnings = async () => {
      setWarningsLoading(true);
      try {
        const res = await fetch(`/api/users/${user.id}/warning`);
        const json = await res.json();
        if (json.ok) {
          setWarnings(json.data.warnings || []);
          setActiveWarnings(json.data.activeWarnings || 0);
        }
      } catch {
        // Ignore errors
      } finally {
        setWarningsLoading(false);
      }
    };
    
    loadWarnings();
  }, [user.id, isSelf, isAdmin]);

  const isOnline =
    !!user.lastSeenAt &&
    Date.now() - new Date(user.lastSeenAt).getTime() < 5 * 60 * 1000;

  const discoIndex = Math.abs(parseInt(user.discordId, 10) || 0) % 5;
  const avatarUrl = `https://cdn.discordapp.com/embed/avatars/${discoIndex}.png`;
  const discordProfileUrl = `https://discord.com/users/${user.discordId}`;

  return (
    <div className="space-y-10">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-r from-[#050814] via-[#05080a] to-[#140805] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-black/40 border border-white/15 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.7)] flex items-center justify-center">
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-[#05080a] flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-200 animate-ping" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300">
                  ID: {user.discordId}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <MultiRoleBadges
                  primaryRole={user.role}
                  additionalRoles={user.additionalRoles}
                  size="md"
                />
                {user.isApproved && !user.isBlocked && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400 border border-emerald-500/30">
                    <Shield className="w-3.5 h-3.5" />
                    Підтверджений учасник
                  </span>
                )}
                {user.isBlocked && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-400 border border-red-500/30">
                    🚫 Заблоковано
                  </span>
                )}
                {user.isFrozen && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300 border border-sky-500/30">
                    <Snowflake className="w-3.5 h-3.5" />
                    Заморожено
                  </span>
                )}
                {activeWarnings > 0 && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] border ${
                    activeWarnings >= 3 
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                      : activeWarnings >= 2
                      ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Догани: {activeWarnings}/3
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Останній онлайн: {formatLastSeen(user.lastSeenAt)}</span>
                </div>
                <div className="hidden h-1 w-1 rounded-full bg-zinc-700 md:inline-block" />
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>В системі з: {formatDate(user.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={discordProfileUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-200 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Профіль Discord</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                {user.cardNumber && (
                  <span className="text-[11px] font-mono text-zinc-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                    💳 Карта: {user.cardNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 lg:mt-0 lg:w-[320px] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Всього записів
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {stats.totalEntries}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300/80">
                  Загальна сума
                </p>
                <p className="mt-1 text-2xl font-black text-amber-100">
                  {stats.totalAmount.toFixed(0)} ₴
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Beer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300/80">
                    Алко
                  </p>
                  <p className="text-sm font-black text-emerald-100">
                    {stats.alcoQuantity} шт · {stats.alcoAmount.toFixed(0)} ₴
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-teal-500/10 border border-teal-500/30 p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-200">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-teal-200/80">
                    Петра
                  </p>
                  <p className="text-sm font-black text-teal-50">
                    {stats.petraQuantity} шт · {stats.petraAmount.toFixed(0)} ₴
                  </p>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="rounded-2xl bg-black/40 border border-white/10 p-4 space-y-2 text-xs text-zinc-300">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Адмінська інформація
                </p>
                <p>
                  Статус:{" "}
                  <span className="font-bold">
                    {user.isBlocked
                      ? "🚫 Заблоковано"
                      : user.isApproved
                      ? "✅ Підтверджено"
                      : "❌ Не підтверджено"}
                  </span>
                </p>
                {user.banReason && (
                  <p className="text-red-300">
                    Причина бану: <span className="font-semibold">{user.banReason}</span>
                  </p>
                )}
                {user.unbanDate && (
                  <p className="text-amber-300">
                    Розблокування:{" "}
                    <span className="font-semibold">
                      {formatDateTime(user.unbanDate)}
                    </span>
                  </p>
                )}
                {user.isFrozen && user.frozenReason && (
                  <p className="text-sky-200">
                    Причина заморозки:{" "}
                    <span className="font-semibold">{user.frozenReason}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Activity panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/10 bg-[#05080f]/80 p-6 sm:p-7 backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 rounded-full bg-amber-500" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300/80">
                  Останні заявки
                </p>
                <p className="text-xs text-zinc-500">
                  Останні подані запити на виплату
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-xs text-zinc-600 italic mt-2">
                Заявок ще немає.
              </p>
            ) : (
              recentRequests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
                        {r.type === "ALCO" ? (
                          <>
                            <Beer className="w-3 h-3 text-amber-400" />
                            Алко
                          </>
                        ) : (
                          <>
                            <Sprout className="w-3 h-3 text-emerald-400" />
                            Петра
                          </>
                        )}
                      </span>
                      <span>·</span>
                      <span>{formatDateTime(r.date)}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                        r.status === "APPROVED"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                          : r.status === "REJECTED"
                          ? "bg-red-500/15 text-red-300 border border-red-500/40"
                          : "bg-amber-500/15 text-amber-200 border border-amber-500/40"
                      }`}
                    >
                      {r.status === "APPROVED"
                        ? "Схвалено"
                        : r.status === "REJECTED"
                        ? "Відмова"
                        : "Очікує"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {r.stars1Qty > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1 border border-white/10">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-zinc-200">
                          {r.stars1Qty} шт
                        </span>
                      </span>
                    )}
                    {r.stars2Qty > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1 border border-white/10">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-zinc-200">
                          {r.stars2Qty} шт
                        </span>
                      </span>
                    )}
                    {r.stars3Qty > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1 border border-white/10">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-zinc-200">
                          {r.stars3Qty} шт
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-emerald-200">
                        {Number(r.totalAmount).toFixed(2)} ₴
                      </span>
                    </div>
                    {r.decidedBy && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                          Обробив:
                        </span>
                        <span className="font-bold text-zinc-200">
                          {r.decidedBy.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {r.decisionNote && (
                    <p className="mt-1 text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-300">
                        Коментар:
                      </span>{" "}
                      {r.decisionNote}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white/10 bg-[#05080f]/80 p-6 sm:p-7 backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 rounded-full bg-emerald-500" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300/80">
                  Останні зарахування
                </p>
                <p className="text-xs text-zinc-500">
                  Останні записані виплати по цьому гравцю
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {recentEntries.length === 0 ? (
              <p className="text-xs text-zinc-600 italic mt-2">
                Записів ще немає.
              </p>
            ) : (
              recentEntries.map((e) => (
                <div
                  key={e.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                        e.type === "ALCO"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {e.type === "ALCO" ? (
                        <Beer className="w-4 h-4" />
                      ) : (
                        <Sprout className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {formatDate(e.date)}
                      </p>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {e.stars}⭐ · {e.quantity} шт
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-black text-white">
                        {Number(e.amount).toFixed(2)} ₴
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {e.paymentStatus === "PAID"
                          ? "Оплачено"
                          : "Очікує виплати"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Warnings section - visible to self and admins */}
      {(isSelf || isAdmin) && (warnings.length > 0 || activeWarnings > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-orange-500/20 bg-[#0f0805]/80 p-6 sm:p-7 backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 rounded-full bg-orange-500" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-300/80">
                  Догани
                </p>
                <p className="text-xs text-zinc-500">
                  {isSelf 
                    ? "Ваші активні попередження. Відпрацюйте здаючи петру або алко."
                    : "Попередження цього користувача"}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-black ${
              activeWarnings >= 3 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : activeWarnings >= 2
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {activeWarnings}/3 активних
            </span>
          </div>

          {warningsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          ) : warnings.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">
              Доганів немає.
            </p>
          ) : (
            <div className="space-y-3">
              {warnings.filter(w => !w.isWorkedOff).map((warning, idx) => (
                <div 
                  key={warning.id}
                  className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-bold text-orange-300">
                          Доган #{warnings.filter(w => !w.isWorkedOff).length - idx}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">{warning.reason}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {formatDate(warning.issuedAt)}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>Прогрес відпрацювання</span>
                      <span className="font-bold text-orange-300">
                        {warning.workedOffAmount}/{warning.requiredAmount}
                      </span>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
                        style={{ 
                          width: `${Math.min(100, (warning.workedOffAmount / warning.requiredAmount) * 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {isSelf 
                        ? `Здайте ще ${warning.requiredAmount - warning.workedOffAmount} шт. петри або алко для відпрацювання`
                        : `Залишилось: ${warning.requiredAmount - warning.workedOffAmount} шт.`
                      }
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Видав: {warning.issuedBy?.name || 'Невідомо'}</span>
                    {warning.workedOffType && (
                      <span>Тип відпрацювання: {warning.workedOffType === 'ALCO' ? 'Алко' : 'Петра'}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Worked off warnings (collapsed) */}
              {warnings.filter(w => w.isWorkedOff).length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    Відпрацьовані догани ({warnings.filter(w => w.isWorkedOff).length})
                  </summary>
                  <div className="mt-3 space-y-2">
                    {warnings.filter(w => w.isWorkedOff).map((warning) => (
                      <div 
                        key={warning.id}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                              ВІДПРАЦЬОВАНО
                            </span>
                            <span className="text-xs text-zinc-300">{warning.reason}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {formatDate(warning.issuedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {isSelf && activeWarnings > 0 && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200">
              <p className="font-bold mb-1">Як відпрацювати доган?</p>
              <p className="text-amber-300/80">
                Кожна здана петра або алко автоматично зараховується в прогрес відпрацювання. 
                Після досягнення необхідної кількості доган буде знято.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Footer note for self profile */}
      {isSelf && (
        <p className="text-[11px] text-zinc-500 text-center">
          Цю сторінку бачите лише ви та адміністрація клану. Публічна частина
          не показує службові причини банів/заморозок.
        </p>
      )}
    </div>
  );
}

