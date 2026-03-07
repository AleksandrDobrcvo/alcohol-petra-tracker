"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ==================== TYPES ====================

type Prize = {
  label: string;
  emoji: string;
  value: string;
  color: string;
  glow: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  chance: number;
};

type SpinRecord = {
  prize: string;
  emoji: string;
  rarity: string;
  timestamp: number;
};

// ==================== PRIZES ====================

const PRIZES: Prize[] = [
  { label: "10 000 ₴", emoji: "💰", value: "10000", color: "from-zinc-400 to-zinc-600", glow: "shadow-zinc-400/50", rarity: "common", chance: 0.25 },
  { label: "15 000 ₴", emoji: "💵", value: "15000", color: "from-green-400 to-green-600", glow: "shadow-green-400/50", rarity: "common", chance: 0.20 },
  { label: "25 000 ₴", emoji: "💎", value: "25000", color: "from-cyan-400 to-blue-600", glow: "shadow-cyan-400/50", rarity: "uncommon", chance: 0.18 },
  { label: "35 000 ₴", emoji: "🌟", value: "35000", color: "from-amber-400 to-orange-600", glow: "shadow-amber-400/50", rarity: "uncommon", chance: 0.13 },
  { label: "50 000 ₴", emoji: "🔥", value: "50000", color: "from-orange-400 to-red-600", glow: "shadow-orange-400/50", rarity: "rare", chance: 0.10 },
  { label: "75 000 ₴", emoji: "👑", value: "75000", color: "from-purple-400 to-pink-600", glow: "shadow-purple-400/50", rarity: "epic", chance: 0.08 },
  { label: "100 000 ₴", emoji: "🏆", value: "100000", color: "from-yellow-300 to-amber-500", glow: "shadow-yellow-400/60", rarity: "legendary", chance: 0.05 },
  { label: "Нічого", emoji: "💨", value: "0", color: "from-zinc-600 to-zinc-800", glow: "shadow-zinc-500/30", rarity: "common", chance: 0.01 },
];

const RARITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  common: { label: "Звичайний", color: "text-zinc-400", bg: "bg-zinc-500/20 border-zinc-500/30" },
  uncommon: { label: "Незвичайний", color: "text-green-400", bg: "bg-green-500/20 border-green-500/30" },
  rare: { label: "Рідкісний", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  epic: { label: "Епічний", color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/30" },
  legendary: { label: "Легендарний", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" },
};

// ==================== CONFETTI ====================

function Confetti({ active }: { active: boolean }) {
  const particles = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 8,
      color: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#a855f7", "#ec4899", "#06b6d4", "#f97316"][
        Math.floor(Math.random() * 8)
      ],
      rotation: Math.random() * 360,
      wobble: (Math.random() - 0.5) * 40,
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: "110vh",
            x: `${p.x + p.wobble}vw`,
            opacity: [1, 1, 0.8, 0],
            rotate: p.rotation + 720,
            scale: [1, 1.2, 0.8, 0.5],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

// ==================== HELPERS ====================

function getStorageKey(userId: string, key: string) {
  return `casino_v2_${userId}_${key}`;
}

function getLastSpinTime(userId: string): number | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(getStorageKey(userId, "lastSpin"));
  return saved ? parseInt(saved, 10) : null;
}

function setLastSpinTime(userId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(getStorageKey(userId, "lastSpin"), String(Date.now()));
  }
}

function getSpinHistory(userId: string): SpinRecord[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(getStorageKey(userId, "history"));
  return saved ? JSON.parse(saved) : [];
}

function saveSpinHistory(userId: string, history: SpinRecord[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(getStorageKey(userId, "history"), JSON.stringify(history.slice(0, 30)));
  }
}

function getTotalWinnings(userId: string): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem(getStorageKey(userId, "totalWinnings"));
  return saved ? parseInt(saved, 10) : 0;
}

function addToTotalWinnings(userId: string, amount: number) {
  if (typeof window !== "undefined") {
    const current = getTotalWinnings(userId);
    localStorage.setItem(getStorageKey(userId, "totalWinnings"), String(current + amount));
  }
}

function formatMoney(n: number): string {
  return n.toLocaleString("uk-UA");
}

function weightedRandom(prizes: Prize[]): number {
  const total = prizes.reduce((sum, p) => sum + p.chance, 0);
  let random = Math.random() * total;
  for (let i = 0; i < prizes.length; i++) {
    random -= prizes[i].chance;
    if (random <= 0) return i;
  }
  return 0;
}

function getTimeUntilNextSpin(lastSpin: number | null): { hours: number; minutes: number; seconds: number; canSpin: boolean } {
  if (!lastSpin) return { hours: 0, minutes: 0, seconds: 0, canSpin: true };
  const elapsed = Date.now() - lastSpin;
  const cooldown = 24 * 60 * 60 * 1000; // 24 hours
  const remaining = cooldown - elapsed;
  if (remaining <= 0) return { hours: 0, minutes: 0, seconds: 0, canSpin: true };
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
  return { hours, minutes, seconds, canSpin: false };
}

// ==================== MAIN COMPONENT ====================

export default function CasinoClient() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id || "guest";

  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [history, setHistory] = useState<SpinRecord[]>([]);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, canSpin: true });
  const [hoveredPrize, setHoveredPrize] = useState<number | null>(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [pulseReady, setPulseReady] = useState(false);

  // Initialize
  useEffect(() => {
    if (userId) {
      setHistory(getSpinHistory(userId));
      setTotalWinnings(getTotalWinnings(userId));
    }
  }, [userId]);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const lastSpin = getLastSpinTime(userId);
      const cd = getTimeUntilNextSpin(lastSpin);
      setCountdown(cd);
      setPulseReady(cd.canSpin);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  // ==================== SPIN ====================

  const spin = useCallback(() => {
    if (spinning || !countdown.canSpin) return;
    setSpinning(true);
    setShowResult(false);
    setShowConfetti(false);
    setSelectedIndex(null);

    const resultIndex = weightedRandom(PRIZES);
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (resultIndex * segmentAngle + segmentAngle / 2);
    const spins = 6 + Math.floor(Math.random() * 4); // 6-9 full spins
    const finalAngle = wheelAngle + spins * 360 + targetAngle;

    setWheelAngle(finalAngle);

    // Show result after wheel stops
    setTimeout(() => {
      setSelectedIndex(resultIndex);
      setShowResult(true);
      setSpinning(false);

      const prize = PRIZES[resultIndex];
      const winAmount = parseInt(prize.value, 10);

      // Save to history
      const record: SpinRecord = {
        prize: prize.label,
        emoji: prize.emoji,
        rarity: prize.rarity,
        timestamp: Date.now(),
      };
      const newHistory = [record, ...history].slice(0, 30);
      setHistory(newHistory);
      saveSpinHistory(userId, newHistory);

      // Save total winnings
      if (winAmount > 0) {
        addToTotalWinnings(userId, winAmount);
        setTotalWinnings((prev) => prev + winAmount);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }

      // Save spin time
      setLastSpinTime(userId);
    }, 5500); // matches wheel animation duration
  }, [spinning, countdown.canSpin, wheelAngle, history, userId]);

  // ==================== AUTH CHECK ====================

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-5xl"
        >
          🎰
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
          className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-900/20 to-transparent p-10 backdrop-blur-md shadow-2xl shadow-purple-500/10"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl mb-4"
          >
            🎰
          </motion.div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 mb-4">
            Щоденна Рулетка
          </h1>
          <p className="text-zinc-300 mb-8 text-lg">Увійди через Discord, щоб крутити!</p>
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

  const wonPrize = selectedIndex !== null ? PRIZES[selectedIndex] : null;

  // ==================== RENDER ====================

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Confetti */}
      <Confetti active={showConfetti} />

      {/* Decorative blobs - extra bright */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 top-16 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[120px] animate-blob" />
        <div className="absolute -right-32 top-24 h-[600px] w-[600px] rounded-full bg-amber-500/15 blur-[140px] animate-blob animation-delay-2000" />
        <div className="absolute left-1/3 bottom-0 h-96 w-96 rounded-full bg-pink-500/15 blur-[120px] animate-blob animation-delay-4000" />
        <div className="absolute right-1/4 top-1/2 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px] animate-blob animation-delay-2000" />
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
          🎰
        </motion.div>
        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-500 mb-3 leading-tight">
          Щоденна Рулетка
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
          Крути колесо раз на день та виграй до <span className="text-amber-400 font-bold">100 000 ₴</span>!
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Всього виграно</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{formatMoney(totalWinnings)} ₴</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Спінів зроблено</div>
          <div className="text-xl sm:text-2xl font-black text-purple-400">{history.length}</div>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Наступний спін</div>
          {countdown.canSpin ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xl sm:text-2xl font-black text-green-400"
            >
              Зараз!
            </motion.div>
          ) : (
            <div className="text-xl sm:text-2xl font-black text-zinc-300 tabular-nums">
              {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
            </div>
          )}
        </div>
      </motion.div>

      {/* Wheel Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mb-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 sm:p-10 backdrop-blur-xl shadow-2xl"
      >
        {/* Wheel */}
        <div className="relative mx-auto mb-8 w-72 h-72 sm:w-96 sm:h-96">
          {/* Outer glow ring */}
          <div className={`absolute inset-[-8px] rounded-full transition-all duration-1000 ${
            pulseReady && !spinning
              ? "bg-gradient-to-r from-amber-500/30 via-purple-500/30 to-pink-500/30 animate-pulse shadow-[0_0_60px_rgba(168,85,247,0.3)]"
              : spinning
                ? "bg-gradient-to-r from-amber-500/40 via-purple-500/40 to-pink-500/40 shadow-[0_0_80px_rgba(168,85,247,0.5)]"
                : "bg-white/5"
          }`} />

          {/* Pointer */}
          <motion.div
            animate={spinning ? { scale: [1, 1.3, 1] } : {}}
            transition={spinning ? { repeat: Infinity, duration: 0.3 } : {}}
            className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 text-4xl sm:text-5xl drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] filter"
          >
            ▼
          </motion.div>

          {/* Wheel body */}
          <motion.div
            animate={{ rotate: wheelAngle }}
            transition={{ duration: 5.5, ease: [0.1, 0.25, 0.1, 1] }}
            className="relative w-full h-full rounded-full border-[6px] border-white/20 shadow-[0_0_40px_rgba(168,85,247,0.2),inset_0_0_30px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Segments */}
            {PRIZES.map((prize, i) => {
              const segAngle = 360 / PRIZES.length;
              const rotation = i * segAngle;
              const skew = 90 - segAngle;
              return (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left overflow-hidden"
                  style={{
                    transform: `rotate(${rotation}deg) skewY(-${skew}deg)`,
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${prize.color}`}
                    style={{
                      transform: `skewY(${skew}deg)`,
                    }}
                  />
                </div>
              );
            })}

            {/* Segment labels */}
            {PRIZES.map((prize, i) => {
              const segAngle = 360 / PRIZES.length;
              const rotation = i * segAngle + segAngle / 2;
              const rad = ((rotation - 90) * Math.PI) / 180;
              const radius = 35;
              const x = 50 + radius * Math.cos(rad);
              const y = 50 + radius * Math.sin(rad);
              return (
                <div
                  key={`label-${i}`}
                  className="absolute z-10 flex flex-col items-center gap-0.5"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  }}
                >
                  <span className="text-lg sm:text-2xl drop-shadow-lg">{prize.emoji}</span>
                  <span className="text-[8px] sm:text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] whitespace-nowrap">
                    {prize.label}
                  </span>
                </div>
              );
            })}

            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-[#1a1d23] to-[#0d0f12] border-4 border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5),inset_0_0_10px_rgba(255,255,255,0.05)]">
                <span className="text-2xl sm:text-3xl">🎰</span>
              </div>
            </div>
          </motion.div>

          {/* LED dots around the wheel */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const r = 52;
            const x = 50 + r * Math.cos(rad);
            const y = 50 + r * Math.sin(rad);
            return (
              <motion.div
                key={`led-${i}`}
                animate={spinning || pulseReady ? {
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                } : { opacity: 0.2 }}
                transition={spinning || pulseReady ? {
                  repeat: Infinity,
                  duration: spinning ? 0.3 : 1.5,
                  delay: i * (spinning ? 0.02 : 0.06),
                } : {}}
                className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#a855f7" : "#ec4899",
                  boxShadow: `0 0 8px ${i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#a855f7" : "#ec4899"}`,
                }}
              />
            );
          })}
        </div>

        {/* Spin button */}
        <div className="flex justify-center">
          {countdown.canSpin ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={!spinning ? {
                boxShadow: [
                  "0 0 20px rgba(168,85,247,0.3)",
                  "0 0 40px rgba(168,85,247,0.5)",
                  "0 0 20px rgba(168,85,247,0.3)",
                ],
              } : {}}
              transition={!spinning ? { repeat: Infinity, duration: 2 } : {}}
              onClick={spin}
              disabled={spinning}
              className={`relative rounded-2xl px-12 py-5 text-xl sm:text-2xl font-black transition-all overflow-hidden ${
                spinning
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-2xl"
              }`}
            >
              {/* Shimmer effect */}
              {!spinning && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              )}
              <span className="relative z-10">
                {spinning ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      🎰
                    </motion.span>
                    Крутимо...
                  </span>
                ) : (
                  "🎰 Крутити колесо!"
                )}
              </span>
            </motion.button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-center backdrop-blur-md">
              <div className="text-sm text-zinc-500 mb-1">Наступний спін через</div>
              <div className="text-3xl font-black text-white tabular-nums">
                {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
              </div>
              <div className="text-xs text-zinc-600 mt-2">Повертайся завтра!</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Win Result Modal */}
      <AnimatePresence>
        {showResult && wonPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative mx-4 max-w-sm w-full rounded-3xl border p-8 text-center backdrop-blur-xl shadow-2xl ${
                wonPrize.rarity === "legendary"
                  ? "border-amber-400/50 bg-gradient-to-b from-amber-900/40 to-black/80 shadow-amber-500/30"
                  : wonPrize.rarity === "epic"
                    ? "border-purple-400/50 bg-gradient-to-b from-purple-900/40 to-black/80 shadow-purple-500/30"
                    : wonPrize.rarity === "rare"
                      ? "border-blue-400/50 bg-gradient-to-b from-blue-900/40 to-black/80 shadow-blue-500/30"
                      : "border-white/10 bg-gradient-to-b from-white/10 to-black/80"
              }`}
            >
              {/* Rarity badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`inline-block rounded-full border px-4 py-1 text-xs font-bold mb-4 ${RARITY_LABELS[wonPrize.rarity].bg} ${RARITY_LABELS[wonPrize.rarity].color}`}
              >
                {RARITY_LABELS[wonPrize.rarity].label}
              </motion.div>

              {/* Emoji */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, -10, 10, 0],
                }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                className="text-7xl sm:text-8xl mb-4"
              >
                {wonPrize.emoji}
              </motion.div>

              {/* Result text */}
              {parseInt(wonPrize.value, 10) > 0 ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="text-lg text-zinc-400 mb-2"
                  >
                    Ти виграв
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className={`text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${wonPrize.color} mb-4`}
                  >
                    {wonPrize.label}
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl text-zinc-400 mb-4"
                >
                  Не пощастило... Спробуй завтра!
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResult(false)}
                className="rounded-xl bg-white/10 border border-white/10 px-8 py-3 text-white font-bold hover:bg-white/20 transition-all"
              >
                Закрити
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prize Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          🎁 Призи
          <span className="text-xs text-zinc-500 font-normal">наведи для деталей</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRIZES.map((prize, i) => (
            <motion.div
              key={i}
              onHoverStart={() => setHoveredPrize(i)}
              onHoverEnd={() => setHoveredPrize(null)}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`relative rounded-2xl border p-4 text-center cursor-default transition-all ${
                hoveredPrize === i
                  ? `${RARITY_LABELS[prize.rarity].bg} shadow-lg ${prize.glow}`
                  : "border-white/5 bg-white/[0.03]"
              }`}
            >
              <div className="text-3xl mb-2">{prize.emoji}</div>
              <div className={`text-sm font-bold bg-gradient-to-r ${prize.color} bg-clip-text text-transparent`}>
                {prize.label}
              </div>
              <div className={`text-[10px] mt-1 ${RARITY_LABELS[prize.rarity].color}`}>
                {RARITY_LABELS[prize.rarity].label}
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredPrize === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-xl bg-[#0d0f12] border border-white/10 px-3 py-1.5 text-xs text-zinc-300 shadow-xl"
                  >
                    Шанс: {Math.round(prize.chance * 100)}%
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#0d0f12] border-l border-t border-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <h3 className="text-xl font-bold text-white mb-4">📜 Історія спінів</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {history.map((item, i) => {
              const rarityInfo = RARITY_LABELS[item.rarity] || RARITY_LABELS.common;
              return (
                <motion.div
                  key={i}
                  initial={i === 0 ? { opacity: 0, x: -20 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <span className={`font-bold ${rarityInfo.color}`}>{item.prize}</span>
                  </div>
                  <span className="text-zinc-600 text-xs">
                    {new Date(item.timestamp).toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Back button */}
      <div className="relative z-10 text-center">
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
