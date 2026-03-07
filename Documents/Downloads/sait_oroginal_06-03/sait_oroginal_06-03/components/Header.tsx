"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Menu, X, Bell, RefreshCw, Users, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MultiRoleBadges, RoleDef } from "@/components/ui/RoleBadge";

type TopContributor = {
  id: string;
  name: string;
  role: string;
  totalAmount: number;
  totalQuantity: number;
};

type NotificationItem =
  | {
      id: string;
      kind: "REQUEST_DECISION";
      type: "ALCO" | "PETRA";
      status: "APPROVED" | "REJECTED" | string;
      totalAmount: number;
      decidedAt: string | Date | null;
      decisionNote?: string | null;
      decidedBy?: { id: string; name: string; role: string } | null;
    }
  | {
      id: string;
      kind: "PROFILE_CHANGE";
      action: string;
      createdAt: string | Date;
      actor: { id: string; name: string; role: string } | null;
      before?: string | null;
      after?: string | null;
    };

export function Header() {
  const { data: session, status, update } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoaded, setNotifLoaded] = useState(false);

  const isAdmin = session?.user?.role === "LEADER" || session?.user?.role === "DEPUTY" || session?.user?.role === "SENIOR";
  const myDiscordId = (session?.user as any)?.discordId;
  const isRoot = myDiscordId === "1223246458975686750";

  const canSeeRequests = isAdmin || isRoot ||
    session?.user?.role === "ALCO_STAFF" || 
    session?.user?.role === "PETRA_STAFF" || 
    session?.user?.moderatesAlco || 
    session?.user?.moderatesPetra;

  // Fetch roles and counts on mount
  useEffect(() => {
    fetch("/api/admin/roles", { cache: "no-store" })
      .then(res => res.json())
      .then(json => {
        if (json.ok) setRoles(json.data.roles);
      })
      .catch(() => {});
    
    // Fetch stats (online count + top contributors)
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store", headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' } });
        const json = await res.json();
        if (json.ok) {
          setOnlineCount(json.data.onlineCount || 0);
          setTopContributors(json.data.topContributors || []);
        }
      } catch (e) {}
    };
    fetchStats();
    const statsInterval = setInterval(fetchStats, 10000); // Refresh every 10 seconds for real-time feel
    return () => clearInterval(statsInterval);
  }, []);

  // Fetch pending counts
  useEffect(() => {
    if (!session) return;
    
    const fetchCounts = async () => {
      try {
        // Fetch pending requests
        const reqRes = await fetch("/api/requests?status=PENDING", { cache: "no-store" });
        const reqJson = await reqRes.json();
        if (reqJson.ok) {
          setPendingRequests(reqJson.data.requests?.length || 0);
        }

        // Fetch pending user approvals (only for admins)
        if (isAdmin || isRoot) {
          const userRes = await fetch("/api/users", { cache: "no-store" });
          const userJson = await userRes.json();
          if (userJson.ok) {
            const pending = userJson.data.users?.filter((u: any) => !u.isApproved).length || 0;
            setPendingUsers(pending);
          }
        }
      } catch (e) {
        console.error("Failed to fetch counts", e);
      }
    };

    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [session, isAdmin, isRoot]);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setNotifications((json.data.items || []) as NotificationItem[]);
      }
    } catch {
      // ignore
    } finally {
      setNotifLoaded(true);
    }
  };

  const roleLabel = (roleName?: string | null) => {
    if (!roleName) return "";
    const found = roles.find((r) => r.name === roleName);
    return found?.label || roleName;
  };

  const prettyNotification = (n: NotificationItem) => {
    if (n.kind === "REQUEST_DECISION") {
      const when = n.decidedAt
        ? new Date(n.decidedAt as any).toLocaleString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const statusLabel = n.status === "APPROVED" ? "Схвалено" : "Відмова";
      const statusClass =
        n.status === "APPROVED"
          ? "bg-emerald-500/10 text-emerald-300"
          : "bg-red-500/10 text-red-300";
      const title = `Заявка: ${n.type === "ALCO" ? "Алко" : "Петра"}`;
      const subtitle = `${Number(n.totalAmount).toFixed(2)} ₴`;
      const by = n.decidedBy?.name ? `Обробив: ${n.decidedBy.name}` : null;
      const note = n.decisionNote ? `Коментар: ${n.decisionNote}` : null;
      return {
        when,
        badgeText: statusLabel,
        badgeClass: statusClass,
        title,
        subtitle,
        details: [by, note].filter(Boolean) as string[],
      };
    }

    // PROFILE_CHANGE
    const when = n.createdAt
      ? new Date(n.createdAt as any).toLocaleString("uk-UA", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const actorName = n.actor?.name || "Адміністратор";
    const actorRole = roleLabel(n.actor?.role);
    const actorLine = actorRole ? `${actorName} · ${actorRole}` : actorName;

    const safeParse = (v?: string | null) => {
      if (!v) return null;
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    };

    const before = safeParse(n.before);
    const after = safeParse(n.after);

    let title = "Оновлення профілю";
    let subtitle = actorLine;
    let badgeText = "Зміна";
    let badgeClass = "bg-sky-500/10 text-sky-300";
    let details: string[] = [];

    if (n.action === "USER_NAME_CHANGE") {
      title = "Змінено нік";
      const from = before?.name ? `Було: ${before.name}` : null;
      const to = after?.name ? `Стало: ${after.name}` : null;
      details = [from, to].filter((x): x is string => Boolean(x));
      badgeText = "Нік";
      badgeClass = "bg-purple-500/10 text-purple-300";
    } else if (n.action === "USER_ROLE_CHANGE") {
      title = "Змінено роль";
      const from = before?.role ? `Було: ${roleLabel(before.role)}` : null;
      const to = after?.role ? `Стало: ${roleLabel(after.role)}` : null;
      const addFrom = Array.isArray(before?.additionalRoles) && before.additionalRoles.length
        ? `Додаткові: ${before.additionalRoles.map((r: string) => roleLabel(r)).join(", ")}`
        : null;
      const addTo = Array.isArray(after?.additionalRoles) && after.additionalRoles.length
        ? `Додаткові: ${after.additionalRoles.map((r: string) => roleLabel(r)).join(", ")}`
        : null;
      const mods: string[] = [];
      if (typeof before?.moderatesAlco === "boolean" || typeof after?.moderatesAlco === "boolean") {
        mods.push(`Алко-модерація: ${after?.moderatesAlco ? "так" : "ні"}`);
      }
      if (typeof before?.moderatesPetra === "boolean" || typeof after?.moderatesPetra === "boolean") {
        mods.push(`Петра-модерація: ${after?.moderatesPetra ? "так" : "ні"}`);
      }
      details = [from, to, addFrom, addTo, ...mods].filter((x): x is string => Boolean(x));
      badgeText = "Роль";
      badgeClass = "bg-amber-500/10 text-amber-300";
    } else if (n.action === "USER_BLOCK_CHANGE") {
      title = after?.isBlocked ? "Вас заблоковано" : "Вас розблоковано";
      badgeText = after?.isBlocked ? "Блок" : "Доступ";
      badgeClass = after?.isBlocked ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300";
      if (after?.banReason) details.push(`Причина: ${after.banReason}`);
      if (after?.unbanDate) {
        try {
          details.push(`До: ${new Date(after.unbanDate).toLocaleString("uk-UA")}`);
        } catch {}
      }
    } else if (n.action === "USER_APPROVE_CHANGE") {
      title = after?.isApproved ? "Акаунт підтверджено" : "Підтвердження скасовано";
      badgeText = "Доступ";
      badgeClass = after?.isApproved ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300";
    } else if (n.action === "USER_CARD_CHANGE") {
      title = "Оновлено карту для виплат";
      badgeText = "Карта";
      badgeClass = "bg-indigo-500/10 text-indigo-300";
      const from = before?.cardNumber ? `Стара карта: ${before.cardNumber}` : null;
      const to = after?.cardNumber ? `Нова карта: ${after.cardNumber}` : null;
      details = [from, to].filter((x): x is string => Boolean(x));
    } else if (n.action === "USER_FREEZE_CHANGE") {
      const nowFrozen = Boolean(after?.isFrozen);
      title = nowFrozen ? "Профіль заморожено" : "Заморозку знято";
      badgeText = nowFrozen ? "Freeze" : "Unfreeze";
      badgeClass = nowFrozen ? "bg-sky-500/10 text-sky-300" : "bg-emerald-500/10 text-emerald-300";
      if (after?.frozenReason) {
        details.push(`Причина: ${after.frozenReason}`);
      }
    }

    return { when, badgeText, badgeClass, title, subtitle, details };
  };

  const handleRefreshSession = async () => {
    setRefreshing(true);
    await update();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#05080a]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-xl font-bold text-white transition-all duration-300 hover:opacity-80">
            <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-xl sm:text-2xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">🏰</span>
            <span className="hidden sm:block">SOBRANIE</span>
          </Link>
          
          {/* Online Counter */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden sm:flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1.5"
          >
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            </div>
            <motion.span 
              key={onlineCount}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-black text-green-400 min-w-[1ch] text-center"
            >
              {onlineCount}
            </motion.span>
            <Users className="w-3.5 h-3.5 text-green-500/80" />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 text-sm">
            {session && (
              <Link href="/public/stats" className="group relative flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-zinc-300 transition-all hover:bg-white/10 hover:text-white">
                <span>📊 Статистика</span>
              </Link>
            )}
            {isAdmin || isRoot ? (
              <Link href="/admin/users" className="relative rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15 transition-all">
                🛠️ Адмінка
                <AnimatePresence>
                  {pendingUsers > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1 text-[10px] font-black text-white shadow-lg shadow-amber-500/30"
                    >
                      {pendingUsers > 9 ? "9+" : pendingUsers}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ) : null}
            {canSeeRequests && (
              <Link href="/admin/requests" className="relative rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15">
                ✅ Заявки
                <AnimatePresence>
                  {pendingRequests > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-1 text-[10px] font-black text-white shadow-lg shadow-emerald-500/30"
                    >
                      {pendingRequests > 9 ? "9+" : pendingRequests}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}
            {session && (
              <Link href="/entries" className="rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15">
                📒 Записи
              </Link>
            )}
            {status === "loading" ? (
              <div className="text-zinc-400">...</div>
            ) : session ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      if (!notifLoaded) {
                        void loadNotifications();
                      }
                    }}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                    )}
                  </button>
                  {/* Notification Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-[#0a0d10]/95 backdrop-blur-xl shadow-2xl z-50">
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">🔔 Сповіщення</span>
                          <button onClick={() => setNotifOpen(false)} className="text-zinc-500 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-zinc-500 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p>Нових сповіщень немає</p>
                            <p className="text-xs text-zinc-600 mt-1">
                              Тут будуть статуси ваших заявок
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {notifications.map((n) => (
                              <div
                                key={n.id}
                                className="p-3.5 text-xs flex flex-col gap-1 hover:bg-white/5 transition-colors"
                              >
                                {(() => {
                                  const p = prettyNotification(n);
                                  return (
                                    <>
                                      <div className="flex items-center justify-between gap-2">
                                        <span
                                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] ${p.badgeClass}`}
                                        >
                                          {p.badgeText}
                                        </span>
                                        <span className="text-[10px] text-zinc-500">{p.when}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-zinc-300">
                                        <span className="font-semibold text-white">{p.title}</span>
                                      </div>
                                      <div className="text-[11px] text-zinc-400">{p.subtitle}</div>
                                      {p.details.length > 0 && (
                                        <div className="text-[11px] text-zinc-500 space-y-0.5">
                                          {p.details.map((d, idx) => (
                                            <div key={idx}>{d}</div>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Refresh Session */}
                <button 
                  onClick={handleRefreshSession}
                  disabled={refreshing}
                  title="Оновити статус"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  href={`/profile/${session.user.id}`}
                  className="text-zinc-300 text-sm hover:text-white underline-offset-4 hover:underline"
                >
                  {session.user.name}
                </Link>
                <MultiRoleBadges
                  primaryRole={isRoot ? "DEV" : session.user.role}
                  additionalRoles={session.user.additionalRoles || []}
                  roleDefs={[
                    { name: "DEV", label: "DEV", emoji: "💻", color: "from-fuchsia-600 to-indigo-600", textColor: "text-fuchsia-400", power: 999 },
                    ...roles
                  ]}
                  size="sm"
                  maxVisible={2}
                />
                <button onClick={() => signOut()} className="rounded-xl bg-red-500/20 px-3 py-2 text-red-300 hover:bg-red-500/30 text-xs">
                  🚪
                </button>
              </div>
            ) : (
              <Link href="/signin" className="rounded-xl bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400">
                🚀 Увійти
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/5 pt-4 space-y-2">
            {session && (
              <>
                <Link href="/entries" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-white/5 px-4 py-3 text-white">
                  📒 Мої записи
                </Link>
                <Link href="/public/stats" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-white/5 px-4 py-3 text-white">
                  📊 Статистика
                </Link>
                {canSeeRequests && (
                  <Link href="/admin/requests" onClick={() => setMobileMenuOpen(false)} className="relative flex items-center justify-between rounded-xl bg-emerald-500/10 px-4 py-3 text-emerald-300">
                    <span>✅ Перевірка заявок</span>
                    {pendingRequests > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-1.5 text-xs font-black text-white shadow-lg">
                        {pendingRequests > 9 ? "9+" : pendingRequests}
                      </span>
                    )}
                  </Link>
                )}
                {isAdmin || isRoot ? (
                  <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className="relative flex items-center justify-between rounded-xl bg-amber-500/10 px-4 py-3 text-amber-300">
                    <span>🛠️ Адмін панель</span>
                    {pendingUsers > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 text-xs font-black text-white shadow-lg">
                        {pendingUsers > 9 ? "9+" : pendingUsers}
                      </span>
                    )}
                  </Link>
                ) : null}
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    {/* Mobile Bell & Refresh */}
                    <div className="relative">
                      <button 
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-zinc-400"
                      >
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                      </button>
                      {/* Mobile Notification Dropdown */}
                      {notifOpen && (
                        <div className="absolute left-0 bottom-full mb-2 w-72 rounded-2xl border border-white/10 bg-[#0a0d10]/98 backdrop-blur-xl shadow-2xl z-50">
                          <div className="p-4 border-b border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">🔔 Сповіщення</span>
                              <button onClick={() => setNotifOpen(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <div className="p-4 text-center text-zinc-500 text-sm">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <p>Нових сповіщень немає</p>
                              <p className="text-xs text-zinc-600 mt-1">Тут будуть статуси заявок</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleRefreshSession}
                      disabled={refreshing}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-zinc-400 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div>
                      <span className="text-white font-medium">{session.user.name}</span>
                      <div className="mt-1">
                        <MultiRoleBadges
                          primaryRole={isRoot ? "DEV" : session.user.role}
                          additionalRoles={session.user.additionalRoles || []}
                          roleDefs={[
                            { name: "DEV", label: "DEV", emoji: "💻", color: "from-fuchsia-600 to-indigo-600", textColor: "text-fuchsia-400", power: 999 },
                            ...roles
                          ]}
                          size="sm"
                          maxVisible={2}
                        />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => signOut()} className="rounded-xl bg-red-500/20 px-4 py-2 text-red-300 text-sm">
                    Вийти
                  </button>
                </div>
              </>
            )}
            {!session && status !== "loading" && (
              <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-indigo-500 px-4 py-3 text-center text-white font-bold">
                🚀 Увійти через Discord
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Top Contributors Ticker - Full Width, Seamless Scroll */}
      <div className="relative border-t border-white/5 bg-black/40 overflow-hidden h-10 flex items-center select-none group/ticker">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#05080a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#05080a] to-transparent z-10 pointer-events-none" />

        <div className="flex whitespace-nowrap items-center w-full">
          <div className="flex gap-12 items-center px-6">
            {(() => {
              const items =
                topContributors.length > 0
                  ? topContributors
                  : [
                      { id: "p1", name: "Очікуємо лідерів...", totalAmount: 0 },
                      { id: "p2", name: "Склад поповнюється...", totalAmount: 0 },
                      { id: "p3", name: "Будь першим!", totalAmount: 0 },
                    ];

              const duplicated = [...items, ...items];
              const duration =
                items.length > 0
                  ? Math.max(30, items.length * 10)
                  : 40;

              return (
                <motion.div
                  className="flex gap-12 items-center"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    duration,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {duplicated.map((c: any, idx) => (
                    <div
                      key={`${c.id || c.name}-${idx}`}
                      className="flex items-center gap-4 hover:scale-105 transition-transform cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                          <Trophy className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-black text-xs text-white uppercase tracking-tight group-hover/ticker:text-amber-400 transition-colors">
                          {c.name}
                        </span>
                      </div>
                      {c.totalAmount > 0 && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <span className="text-[10px] font-black text-emerald-400">
                            {c.totalAmount.toLocaleString()} ₴
                          </span>
                        </div>
                      )}
                      <span className="text-white/10 font-black">/</span>
                    </div>
                  ))}
                </motion.div>
              );
            })()}
          </div>
        </div>
      </div>
    </header>
  );
}