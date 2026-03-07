"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ==================== TYPES ====================

type UserInfo = {
  id: string;
  name: string;
  role: string;
  discordId?: string;
  additionalRoles?: string[];
};

type Booking = {
  id: string;
  workshopId: string;
  userId: string;
  status: "ACTIVE" | "WAITING" | "COMPLETED" | "CANCELLED";
  position: number;
  note: string | null;
  startedAt: string | null;
  createdAt: string;
  user: UserInfo;
};

type Workshop = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  emoji: string;
  color: string;
  capacity: number;
  bookings: Booking[];
};

// ==================== HELPERS ====================

const TYPE_CONFIG: Record<string, { label: string; gradient: string; glow: string; icon: string }> = {
  ALCO: {
    label: "Алко",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
    icon: "🍺",
  },
  PETRA: {
    label: "Петра",
    gradient: "from-emerald-500 to-green-600",
    glow: "shadow-emerald-500/30",
    icon: "🌿",
  },
  UNIVERSAL: {
    label: "Універсальний",
    gradient: "from-purple-500 to-pink-600",
    glow: "shadow-purple-500/30",
    icon: "⚡",
  },
};

const ROLE_COLORS: Record<string, string> = {
  LEADER: "text-red-400",
  DEPUTY: "text-orange-400",
  SENIOR: "text-amber-400",
  ALCO_STAFF: "text-yellow-400",
  PETRA_STAFF: "text-emerald-400",
  MEMBER: "text-zinc-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "щойно";
  if (minutes < 60) return `${minutes} хв тому`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год тому`;
  return `${Math.floor(hours / 24)} дн тому`;
}

// ==================== MAIN COMPONENT ====================

export default function WorkshopsClient() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ALCO" | "PETRA">("ALL");
  const [bookingNote, setBookingNote] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ==================== FETCH ====================

  const fetchWorkshops = useCallback(async () => {
    try {
      const res = await fetch("/api/workshops", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setWorkshops(json.data.workshops);
      }
    } catch (e) {
      console.error("Failed to fetch workshops", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkshops();
    // Auto-refresh every 10 seconds for real-time feel
    const interval = setInterval(fetchWorkshops, 10000);
    return () => clearInterval(interval);
  }, [fetchWorkshops]);

  // ==================== ACTIONS ====================

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBook = async (workshopId: string) => {
    setActionLoading(workshopId);
    try {
      const res = await fetch("/api/workshops/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId, note: bookingNote || undefined }),
      });
      const json = await res.json();
      if (json.ok) {
        showToast(json.data.message, "success");
        setBookingNote("");
        setSelectedWorkshop(null);
        await fetchWorkshops();
      } else {
        showToast(json.error?.message || "Error", "error");
      }
    } catch {
      showToast("Connection error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelease = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/workshops/${bookingId}`, { method: "PATCH" });
      const json = await res.json();
      if (json.ok) {
        showToast("Цех звільнено!", "success");
        await fetchWorkshops();
      } else {
        showToast(json.error?.message || "Error", "error");
      }
    } catch {
      showToast("Connection error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/workshops/${bookingId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        showToast("Бронювання скасовано", "success");
        await fetchWorkshops();
      } else {
        showToast(json.error?.message || "Error", "error");
      }
    } catch {
      showToast("Connection error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== AUTH CHECK ====================

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-5xl"
        >
          🏭
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-900/20 to-transparent p-10 backdrop-blur-md shadow-2xl shadow-emerald-500/10"
        >
          <div className="text-7xl mb-4">🏭</div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400 mb-4">
            Цехи Клану
          </h1>
          <p className="text-zinc-300 mb-8 text-lg">Увійди, щоб бронювати цехи!</p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-105 transition-all"
          >
            🔐 Увійти через Discord
          </Link>
        </motion.div>
      </div>
    );
  }

  // ==================== DERIVED DATA ====================

  const isAdmin =
    (session.user as any)?.role === "LEADER" ||
    (session.user as any)?.role === "DEPUTY" ||
    (session.user as any)?.role === "SENIOR";

  const filteredWorkshops = workshops.filter((w) =>
    filter === "ALL" ? true : w.type === filter
  );

  const myBookings = workshops.flatMap((w) =>
    w.bookings.filter((b) => b.userId === userId && (b.status === "ACTIVE" || b.status === "WAITING"))
  );

  const totalActive = workshops.reduce(
    (sum, w) => sum + w.bookings.filter((b) => b.status === "ACTIVE").length,
    0
  );
  const totalWaiting = workshops.reduce(
    (sum, w) => sum + w.bookings.filter((b) => b.status === "WAITING").length,
    0
  );

  // ==================== RENDER ====================

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-6 py-3 text-sm font-bold shadow-2xl backdrop-blur-md border ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400/30 text-white"
                : "bg-red-500/90 border-red-400/30 text-white"
            }`}
          >
            {toast.type === "success" ? "✅" : "❌"} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 top-16 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[120px] animate-blob" />
        <div className="absolute -right-32 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute left-1/3 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-6xl sm:text-7xl mb-4"
        >
          🏭
        </motion.div>
        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-400 mb-3 leading-tight">
          Цехи Клану
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-lg mx-auto">
          Бронюй цех, дивись хто працює, ставай у чергу
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Всього цехів</div>
          <div className="text-2xl font-black text-white">{workshops.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-md text-center">
          <div className="text-xs text-emerald-500 uppercase tracking-wider mb-1">Зайнято</div>
          <div className="text-2xl font-black text-emerald-400">{totalActive}</div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-md text-center">
          <div className="text-xs text-amber-500 uppercase tracking-wider mb-1">В черзі</div>
          <div className="text-2xl font-black text-amber-400">{totalWaiting}</div>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 backdrop-blur-md text-center">
          <div className="text-xs text-purple-500 uppercase tracking-wider mb-1">Мої бронювання</div>
          <div className="text-2xl font-black text-purple-400">{myBookings.length}</div>
        </div>
      </motion.div>

      {/* My Active Bookings */}
      {myBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative z-10 mb-8 rounded-3xl border border-purple-500/20 bg-purple-500/5 p-6 backdrop-blur-md"
        >
          <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
            👤 Мої бронювання
          </h3>
          <div className="space-y-3">
            {myBookings.map((booking) => {
              const workshop = workshops.find((w) => w.id === booking.workshopId);
              if (!workshop) return null;
              const typeConf = TYPE_CONFIG[workshop.type] || TYPE_CONFIG.UNIVERSAL;
              return (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{workshop.emoji}</span>
                    <div>
                      <div className="font-bold text-white">{workshop.name}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          booking.status === "ACTIVE"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {booking.status === "ACTIVE" ? "🟢 Активний" : `⏳ В черзі #${booking.position}`}
                        </span>
                        {booking.startedAt && (
                          <span className="text-zinc-500">з {timeAgo(booking.startedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === "ACTIVE" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRelease(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all disabled:opacity-50"
                      >
                        {actionLoading === booking.id ? "..." : "✅ Звільнити"}
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCancel(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                    >
                      {actionLoading === booking.id ? "..." : "❌ Скасувати"}
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mb-6 flex gap-2 rounded-xl bg-white/5 border border-white/10 p-1.5 backdrop-blur-md"
      >
        {[
          { key: "ALL" as const, label: "🏭 Всі цехи" },
          { key: "ALCO" as const, label: "🍺 Алко" },
          { key: "PETRA" as const, label: "🌿 Петра" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 rounded-lg px-3 py-3 text-center transition-all font-bold text-sm ${
              filter === tab.key
                ? "bg-gradient-to-r from-emerald-600/80 to-amber-600/80 text-white shadow-lg"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Workshop Cards */}
      <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWorkshops.map((workshop, i) => {
          const typeConf = TYPE_CONFIG[workshop.type] || TYPE_CONFIG.UNIVERSAL;
          const activeBookings = workshop.bookings.filter((b) => b.status === "ACTIVE");
          const waitingBookings = workshop.bookings.filter((b) => b.status === "WAITING");
          const isFull = activeBookings.length >= workshop.capacity;
          const myBooking = workshop.bookings.find(
            (b) => b.userId === userId && (b.status === "ACTIVE" || b.status === "WAITING")
          );
          const isBookingThis = selectedWorkshop === workshop.id;

          return (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`group relative rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
                isFull && !myBooking
                  ? "border-red-500/20 bg-red-500/[0.03]"
                  : myBooking
                    ? "border-purple-500/30 bg-purple-500/[0.05] shadow-lg shadow-purple-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {/* Top gradient bar */}
              <div className={`h-1.5 bg-gradient-to-r ${typeConf.gradient}`} />

              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                {isFull ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-400">ЗАЙНЯТО</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 border border-green-500/30 px-2.5 py-1">
                    <div className="relative w-2 h-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </div>
                    <span className="text-[10px] font-bold text-green-400">ВІЛЬНО</span>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {/* Workshop info */}
                <div className="flex items-start gap-3 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${typeConf.gradient} text-3xl shadow-lg ${typeConf.glow}`}
                  >
                    {workshop.emoji}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-white truncate">{workshop.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold bg-gradient-to-r ${typeConf.gradient} bg-clip-text text-transparent`}>
                        {typeConf.label}
                      </span>
                      {workshop.description && (
                        <span className="text-[10px] text-zinc-500 truncate">{workshop.description}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active user */}
                <div className="mb-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">
                    {activeBookings.length > 0 ? "🟢 Зараз працює" : "Нікого немає"}
                  </div>
                  {activeBookings.length > 0 ? (
                    <div className="space-y-2">
                      {activeBookings.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 text-sm font-black text-green-400">
                              {b.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={`text-sm font-bold ${b.userId === userId ? "text-purple-300" : "text-white"}`}>
                                {b.user.name}
                                {b.userId === userId && (
                                  <span className="ml-1 text-[10px] text-purple-400">(ти)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                {b.startedAt ? timeAgo(b.startedAt) : ""}
                                {b.note && ` · ${b.note}`}
                              </div>
                            </div>
                          </div>
                          {(b.userId === userId || isAdmin) && (
                            <button
                              onClick={() => handleRelease(b.id)}
                              disabled={actionLoading === b.id}
                              className="rounded-lg bg-green-500/20 px-2 py-1 text-[10px] font-bold text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50"
                            >
                              {actionLoading === b.id ? "..." : "Звільнити"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-center text-sm text-zinc-600">
                      Цех вільний — займи його!
                    </div>
                  )}
                </div>

                {/* Waiting queue */}
                {waitingBookings.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">
                      ⏳ Черга ({waitingBookings.length})
                    </div>
                    <div className="space-y-1.5">
                      {waitingBookings.map((b, qi) => (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: qi * 0.05 }}
                          className="flex items-center justify-between rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-[10px] font-black text-amber-400">
                              #{b.position}
                            </div>
                            <span className={`text-xs font-medium ${b.userId === userId ? "text-purple-300" : "text-zinc-300"}`}>
                              {b.user.name}
                              {b.userId === userId && (
                                <span className="ml-1 text-[10px] text-purple-400">(ти)</span>
                              )}
                            </span>
                            {b.note && (
                              <span className="text-[10px] text-zinc-600 truncate max-w-[80px]">{b.note}</span>
                            )}
                          </div>
                          {(b.userId === userId || isAdmin) && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={actionLoading === b.id}
                              className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === b.id ? "..." : "✕"}
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book / Join queue button */}
                {!myBooking ? (
                  <div>
                    {isBookingThis ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                      >
                        <input
                          type="text"
                          placeholder="Нотатка (необовʼязково)..."
                          value={bookingNote}
                          onChange={(e) => setBookingNote(e.target.value)}
                          maxLength={100}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 transition-all"
                        />
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBook(workshop.id)}
                            disabled={actionLoading === workshop.id}
                            className={`flex-1 rounded-xl bg-gradient-to-r ${typeConf.gradient} px-4 py-2.5 text-sm font-bold text-white shadow-lg ${typeConf.glow} hover:shadow-xl transition-all disabled:opacity-50`}
                          >
                            {actionLoading === workshop.id
                              ? "..."
                              : isFull
                                ? `⏳ В чергу (#${waitingBookings.length + 1})`
                                : "✅ Зайняти цех"}
                          </motion.button>
                          <button
                            onClick={() => {
                              setSelectedWorkshop(null);
                              setBookingNote("");
                            }}
                            className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-zinc-400 hover:text-white transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedWorkshop(workshop.id)}
                        className={`w-full rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                          isFull
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            : `border-transparent bg-gradient-to-r ${typeConf.gradient} text-white shadow-lg ${typeConf.glow} hover:shadow-xl`
                        }`}
                      >
                        {isFull ? "⏳ Стати в чергу" : "🔒 Забронювати"}
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-center text-xs text-purple-300 font-bold">
                    {myBooking.status === "ACTIVE" ? "🟢 Ти тут працюєш" : `⏳ Ти в черзі #${myBooking.position}`}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredWorkshops.length === 0 && (
        <div className="relative z-10 text-center py-20">
          <div className="text-5xl mb-4">🏗️</div>
          <div className="text-zinc-500 text-lg">Цехів поки немає</div>
        </div>
      )}

      {/* Back button */}
      <div className="relative z-10 mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          ← На головну
        </Link>
      </div>
    </div>
  );
}
