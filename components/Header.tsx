"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Menu, X, Bell, RefreshCw } from "lucide-react";

export function Header() {
  const { data: session, status, update } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isAdmin = session?.user?.role === "LEADER" || session?.user?.role === "DEPUTY" || session?.user?.role === "SENIOR";
  const canSeeRequests = isAdmin || 
    session?.user?.role === "ALCO_STAFF" || 
    session?.user?.role === "PETRA_STAFF" || 
    session?.user?.moderatesAlco || 
    session?.user?.moderatesPetra;

  // Role badge config
  const getRoleBadge = () => {
    if (!session?.user) return { label: '', color: '' };
    const role = session.user.role;
    const isApproved = session.user.isApproved;
    
    if (role === 'LEADER') return { label: '👑 Лідер', color: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black' };
    if (role === 'DEPUTY') return { label: '⭐ Заступник', color: 'bg-gradient-to-r from-amber-400 to-orange-400 text-black' };
    if (role === 'SENIOR') return { label: '🛡️ Старший', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' };
    if (role === 'ALCO_STAFF') return { label: '🍺 Алко', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
    if (role === 'PETRA_STAFF') return { label: '🌿 Петра', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
    if (!isApproved) return { label: '⏳ Очікування', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' };
    return { label: '✅ Учасник', color: 'bg-sky-500/20 text-sky-300 border border-sky-500/30' };
  };

  const badge = getRoleBadge();

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 text-sm">
            {session && (
              <Link href="/public/stats" className="group relative flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-zinc-300 transition-all hover:bg-white/10 hover:text-white">
                <span>📊 Статистика</span>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin/users" className="rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15">
                🛠️ Адмінка
              </Link>
            )}
            {canSeeRequests && (
              <Link href="/admin/requests" className="rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15">
                ✅ Заявки
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
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
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
                        <div className="p-4 text-center text-zinc-500 text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>Нових сповіщень немає</p>
                          <p className="text-xs text-zinc-600 mt-1">Тут будуть статуси заявок</p>
                        </div>
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
                <span className="text-zinc-300 text-sm">{session.user.name}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.color}`}>
                  {badge.label}
                </span>
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
                  <Link href="/admin/requests" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-emerald-500/10 px-4 py-3 text-emerald-300">
                    ✅ Перевірка заявок
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-amber-500/10 px-4 py-3 text-amber-300">
                    🛠️ Адмін панель
                  </Link>
                )}
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    {/* Mobile Bell & Refresh */}
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-zinc-400">
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                      </span>
                    </button>
                    <button 
                      onClick={handleRefreshSession}
                      disabled={refreshing}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-zinc-400 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div>
                      <span className="text-white font-medium">{session.user.name}</span>
                      <span className={`block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold w-fit ${badge.color}`}>
                        {badge.label}
                      </span>
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
    </header>
  );
}
