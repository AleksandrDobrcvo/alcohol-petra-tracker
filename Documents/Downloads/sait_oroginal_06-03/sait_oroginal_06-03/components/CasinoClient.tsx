"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ==================== TYPES ====================

type GameTab = "slots" | "coinflip" | "wheel";

type HistoryItem = {
  id: string;
  game: string;
  bet: number;
  win: number;
  timestamp: number;
};

// ==================== CONSTANTS ====================

const SLOT_SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "🍀", "⭐"];
const SLOT_PAYOUTS: Record<string, number> = {
  "🍒🍒🍒": 5,
  "🍋🍋🍋": 8,
  "🍊🍊🍊": 10,
  "🍇🍇🍇": 15,
  "🍀🍀🍀": 20,
  "⭐⭐⭐": 30,
  "💎💎💎": 50,
  "7️⃣7️⃣7️⃣": 100,
};

const WHEEL_SEGMENTS = [
  { label: "x0", multiplier: 0, color: "from-red-600 to-red-800", chance: 0.15 },
  { label: "x0.5", multiplier: 0.5, color: "from-orange-500 to-orange-700", chance: 0.20 },
  { label: "x1", multiplier: 1, color: "from-yellow-500 to-yellow-700", chance: 0.25 },
  { label: "x1.5", multiplier: 1.5, color: "from-green-500 to-green-700", chance: 0.18 },
  { label: "x2", multiplier: 2, color: "from-emerald-500 to-emerald-700", chance: 0.10 },
  { label: "x3", multiplier: 3, color: "from-cyan-500 to-cyan-700", chance: 0.06 },
  { label: "x5", multiplier: 5, color: "from-blue-500 to-blue-700", chance: 0.04 },
  { label: "x10", multiplier: 10, color: "from-purple-500 to-purple-700", chance: 0.02 },
];

const DEFAULT_BALANCE = 50000;
const DAILY_BONUS = 15000;
const BET_OPTIONS = [1000, 5000, 10000, 25000, 50000];

// ==================== HELPERS ====================

function getStorageKey(userId: string, key: string) {
  return `casino_${userId}_${key}`;
}

function loadBalance(userId: string): number {
  if (typeof window === "undefined") return DEFAULT_BALANCE;
  const saved = localStorage.getItem(getStorageKey(userId, "balance"));
  return saved ? parseInt(saved, 10) : DEFAULT_BALANCE;
}

function saveBalance(userId: string, balance: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(getStorageKey(userId, "balance"), String(balance));
  }
}

function loadHistory(userId: string): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(getStorageKey(userId, "history"));
  return saved ? JSON.parse(saved) : [];
}

function saveHistory(userId: string, history: HistoryItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(getStorageKey(userId, "history"), JSON.stringify(history.slice(0, 50)));
  }
}

function canClaimDaily(userId: string): boolean {
  if (typeof window === "undefined") return false;
  const last = localStorage.getItem(getStorageKey(userId, "lastDaily"));
  if (!last) return true;
  const lastDate = new Date(parseInt(last, 10));
  const now = new Date();
  return lastDate.toDateString() !== now.toDateString();
}

function claimDaily(userId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(getStorageKey(userId, "lastDaily"), String(Date.now()));
  }
}

function formatMoney(n: number): string {
  return n.toLocaleString("uk-UA");
}

function weightedRandom(items: typeof WHEEL_SEGMENTS): number {
  const total = items.reduce((sum, item) => sum + item.chance, 0);
  let random = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    random -= items[i].chance;
    if (random <= 0) return i;
  }
  return items.length - 1;
}

// ==================== MAIN COMPONENT ====================

export default function CasinoClient() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id || "guest";

  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [bet, setBet] = useState(BET_OPTIONS[0]);
  const [activeTab, setActiveTab] = useState<GameTab>("slots");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dailyAvailable, setDailyAvailable] = useState(false);
  const [showDailyPopup, setShowDailyPopup] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  // Slot state
  const [slotReels, setSlotReels] = useState(["🍒", "🍒", "🍒"]);
  const [slotSpinning, setSlotSpinning] = useState(false);

  // Coin flip state
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null);
  const [coinChoice, setCoinChoice] = useState<"heads" | "tails">("heads");
  const [coinFlipping, setCoinFlipping] = useState(false);

  // Wheel state
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState<number | null>(null);

  // Initialize
  useEffect(() => {
    if (userId) {
      setBalance(loadBalance(userId));
      setHistory(loadHistory(userId));
      setDailyAvailable(canClaimDaily(userId));
    }
  }, [userId]);

  // Save balance when it changes
  useEffect(() => {
    if (userId) saveBalance(userId, balance);
  }, [balance, userId]);

  const addToHistory = useCallback(
    (game: string, betAmount: number, winAmount: number) => {
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        game,
        bet: betAmount,
        win: winAmount,
        timestamp: Date.now(),
      };
      const newHistory = [item, ...history].slice(0, 50);
      setHistory(newHistory);
      saveHistory(userId, newHistory);
    },
    [history, userId]
  );

  // ==================== DAILY BONUS ====================

  const handleClaimDaily = () => {
    setBalance((prev) => prev + DAILY_BONUS);
    claimDaily(userId);
    setDailyAvailable(false);
    setShowDailyPopup(true);
    setTimeout(() => setShowDailyPopup(false), 3000);
  };

  // ==================== SLOT MACHINE ====================

  const spinSlots = useCallback(() => {
    if (slotSpinning || balance < bet) return;
    setSlotSpinning(true);
    setLastWin(null);
    setBalance((prev) => prev - bet);

    // Animate reels
    let tick = 0;
    const maxTicks = 20;
    const interval = setInterval(() => {
      setSlotReels([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ]);
      tick++;
      if (tick >= maxTicks) {
        clearInterval(interval);
        // Determine final result
        const finalReels = [
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        ];
        setSlotReels(finalReels);

        const combo = finalReels.join("");
        const multiplier = SLOT_PAYOUTS[combo] || 0;
        let winAmount = 0;

        // Check for 2 matches (partial win)
        if (multiplier > 0) {
          winAmount = bet * multiplier;
        } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
          winAmount = Math.floor(bet * 1.5);
        }

        if (winAmount > 0) {
          setBalance((prev) => prev + winAmount);
          setLastWin(winAmount);
        }
        addToHistory("Слоти", bet, winAmount);
        setSlotSpinning(false);
      }
    }, 80);
  }, [slotSpinning, balance, bet, addToHistory]);

  // ==================== COIN FLIP ====================

  const flipCoin = useCallback(() => {
    if (coinFlipping || balance < bet) return;
    setCoinFlipping(true);
    setLastWin(null);
    setBalance((prev) => prev - bet);
    setCoinResult(null);

    setTimeout(() => {
      const result: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
      setCoinResult(result);

      const won = result === coinChoice;
      const winAmount = won ? bet * 2 : 0;

      if (winAmount > 0) {
        setBalance((prev) => prev + winAmount);
        setLastWin(winAmount);
      }
      addToHistory("Монетка", bet, winAmount);
      setCoinFlipping(false);
    }, 1500);
  }, [coinFlipping, balance, bet, coinChoice, addToHistory]);

  // ==================== LUCKY WHEEL ====================

  const spinWheel = useCallback(() => {
    if (wheelSpinning || balance < bet) return;
    setWheelSpinning(true);
    setLastWin(null);
    setWheelResult(null);
    setBalance((prev) => prev - bet);

    const resultIndex = weightedRandom(WHEEL_SEGMENTS);
    const segment = WHEEL_SEGMENTS[resultIndex];
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetAngle = 360 - (resultIndex * segmentAngle + segmentAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = wheelRotation + spins * 360 + targetAngle;

    setWheelRotation(finalRotation);

    setTimeout(() => {
      const winAmount = Math.floor(bet * segment.multiplier);
      setWheelResult(resultIndex);

      if (winAmount > 0) {
        setBalance((prev) => prev + winAmount);
        setLastWin(winAmount);
      }
      addToHistory("Колесо", bet, winAmount);
      setWheelSpinning(false);
    }, 4000);
  }, [wheelSpinning, balance, bet, wheelRotation, addToHistory]);

  // ==================== AUTH CHECK ====================

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-xl text-zinc-400 animate-pulse">Завантаження...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">🎰 Казино</h1>
          <p className="text-zinc-300 mb-6">Увійди через Discord, щоб грати!</p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
          >
            🔐 Увійти
          </Link>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================

  const isAnySpinning = slotSpinning || coinFlipping || wheelSpinning;

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px] animate-blob" />
        <div className="absolute -right-28 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-pink-500/10 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 text-center"
      >
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 mb-2">
          🎰 Казино SOBRANIE
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">Випробуй удачу та збільш свій баланс!</p>
      </motion.div>

      {/* Balance Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-2xl shadow-lg shadow-amber-500/20">
            💰
          </div>
          <div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Баланс</div>
            <motion.div
              key={balance}
              initial={{ scale: 1.1, color: "#fbbf24" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="text-2xl font-black"
            >
              {formatMoney(balance)} ₴
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dailyAvailable && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimDaily}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
            >
              🎁 Щоденний бонус (+{formatMoney(DAILY_BONUS)} ₴)
            </motion.button>
          )}

          {/* Bet selector */}
          <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
            {BET_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => !isAnySpinning && setBet(option)}
                disabled={isAnySpinning}
                className={`rounded-lg px-2 sm:px-3 py-1.5 text-xs font-bold transition-all ${
                  bet === option
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                } ${isAnySpinning ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {option >= 1000 ? `${option / 1000}к` : option}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Daily bonus popup */}
      <AnimatePresence>
        {showDailyPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-gradient-to-r from-green-500/90 to-emerald-600/90 px-6 py-4 text-center text-white shadow-2xl backdrop-blur-md border border-green-400/30"
          >
            <div className="text-2xl mb-1">🎁</div>
            <div className="font-bold">+{formatMoney(DAILY_BONUS)} ₴</div>
            <div className="text-xs text-green-100">Щоденний бонус отримано!</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win popup */}
      <AnimatePresence>
        {lastWin !== null && lastWin > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl sm:text-8xl mb-2"
              >
                🎉
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 drop-shadow-lg"
              >
                +{formatMoney(lastWin)} ₴
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Tabs */}
      <div className="relative z-10 mb-6 flex gap-2 rounded-xl bg-white/5 border border-white/10 p-1.5 backdrop-blur-md">
        {[
          { key: "slots" as GameTab, label: "🎰 Слоти", desc: "Крути барабани" },
          { key: "coinflip" as GameTab, label: "🪙 Монетка", desc: "Орел чи решка" },
          { key: "wheel" as GameTab, label: "🎡 Колесо", desc: "Крути колесо" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => !isAnySpinning && setActiveTab(tab.key)}
            disabled={isAnySpinning}
            className={`flex-1 rounded-lg px-3 py-3 text-center transition-all ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white shadow-lg shadow-purple-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            } ${isAnySpinning && activeTab !== tab.key ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="text-lg sm:text-xl font-bold">{tab.label}</div>
            <div className="text-[10px] sm:text-xs opacity-70 hidden sm:block">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* Game Area */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "slots" && (
            <motion.div
              key="slots"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">🎰 Слот-машина</h2>

              {/* Slot Reels */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
                {slotReels.map((symbol, i) => (
                  <motion.div
                    key={i}
                    animate={slotSpinning ? { y: [0, -10, 10, -5, 5, 0] } : {}}
                    transition={slotSpinning ? { repeat: Infinity, duration: 0.3, delay: i * 0.05 } : {}}
                    className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-b from-white/10 to-white/5 text-4xl sm:text-6xl shadow-inner backdrop-blur-sm"
                  >
                    <motion.span
                      key={symbol + i + (slotSpinning ? "spin" : "stop")}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {symbol}
                    </motion.span>
                  </motion.div>
                ))}
              </div>

              {/* Payout table (compact) */}
              <div className="mb-6 grid grid-cols-4 gap-2 text-center text-xs">
                {Object.entries(SLOT_PAYOUTS).map(([combo, mult]) => (
                  <div
                    key={combo}
                    className="rounded-lg bg-white/5 border border-white/10 py-1.5 px-1"
                  >
                    <div className="text-sm">{combo.slice(0, 2)}{combo.slice(2, 4)}{combo.slice(4)}</div>
                    <div className="text-amber-400 font-bold">x{mult}</div>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-zinc-500 mb-4">2 однакових = x1.5</div>

              {/* Spin button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={!slotSpinning && balance >= bet ? { scale: 1.05 } : {}}
                  whileTap={!slotSpinning && balance >= bet ? { scale: 0.95 } : {}}
                  onClick={spinSlots}
                  disabled={slotSpinning || balance < bet}
                  className={`rounded-2xl px-10 py-4 text-xl font-black shadow-2xl transition-all ${
                    slotSpinning || balance < bet
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30 hover:shadow-purple-500/50"
                  }`}
                >
                  {slotSpinning ? "Крутимо..." : balance < bet ? "Мало коштів" : `🎰 Крутити (${formatMoney(bet)} ₴)`}
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === "coinflip" && (
            <motion.div
              key="coinflip"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">🪙 Орел чи Решка</h2>
              <p className="text-center text-zinc-400 text-sm mb-6">Вгадай сторону монети та подвой ставку!</p>

              {/* Choice buttons */}
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => !coinFlipping && setCoinChoice("heads")}
                  disabled={coinFlipping}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-8 py-4 transition-all ${
                    coinChoice === "heads"
                      ? "border-amber-400 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/20"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-4xl">🦅</span>
                  <span className="font-bold">Орел</span>
                </button>
                <button
                  onClick={() => !coinFlipping && setCoinChoice("tails")}
                  disabled={coinFlipping}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-8 py-4 transition-all ${
                    coinChoice === "tails"
                      ? "border-purple-400 bg-purple-500/10 text-purple-400 shadow-lg shadow-purple-500/20"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-4xl">🌙</span>
                  <span className="font-bold">Решка</span>
                </button>
              </div>

              {/* Coin animation area */}
              <div className="flex justify-center mb-8">
                <motion.div
                  animate={coinFlipping ? { rotateY: [0, 360, 720, 1080, 1440] } : {}}
                  transition={coinFlipping ? { duration: 1.5, ease: "easeOut" } : {}}
                  className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-amber-400/50 bg-gradient-to-br from-amber-400/20 to-yellow-600/20 text-6xl shadow-2xl shadow-amber-500/20 backdrop-blur-sm"
                >
                  {coinFlipping ? "🪙" : coinResult === "heads" ? "🦅" : coinResult === "tails" ? "🌙" : "🪙"}
                </motion.div>
              </div>

              {/* Result */}
              {coinResult && !coinFlipping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center text-xl font-bold mb-6 ${
                    coinResult === coinChoice ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {coinResult === "heads" ? "🦅 Орел" : "🌙 Решка"} —{" "}
                  {coinResult === coinChoice ? "Перемога!" : "Програш!"}
                </motion.div>
              )}

              {/* Flip button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={!coinFlipping && balance >= bet ? { scale: 1.05 } : {}}
                  whileTap={!coinFlipping && balance >= bet ? { scale: 0.95 } : {}}
                  onClick={flipCoin}
                  disabled={coinFlipping || balance < bet}
                  className={`rounded-2xl px-10 py-4 text-xl font-black shadow-2xl transition-all ${
                    coinFlipping || balance < bet
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-amber-500/30 hover:shadow-amber-500/50"
                  }`}
                >
                  {coinFlipping ? "Підкидаємо..." : balance < bet ? "Мало коштів" : `🪙 Підкинути (${formatMoney(bet)} ₴)`}
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === "wheel" && (
            <motion.div
              key="wheel"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">🎡 Колесо Фортуни</h2>

              {/* Wheel */}
              <div className="relative mx-auto mb-8 w-64 h-64 sm:w-80 sm:h-80">
                {/* Pointer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-3xl drop-shadow-lg">
                  ▼
                </div>

                {/* Wheel */}
                <motion.div
                  animate={{ rotate: wheelRotation }}
                  transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
                  className="relative w-full h-full rounded-full border-4 border-white/20 shadow-2xl overflow-hidden"
                >
                  {WHEEL_SEGMENTS.map((segment, i) => {
                    const segAngle = 360 / WHEEL_SEGMENTS.length;
                    const rotation = i * segAngle;
                    return (
                      <div
                        key={i}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((segAngle * Math.PI) / 360)}% 0%)`,
                        }}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${segment.color}`}
                          style={{ transform: `rotate(${segAngle / 2}deg)` }}
                        />
                      </div>
                    );
                  })}

                  {/* Segment labels */}
                  {WHEEL_SEGMENTS.map((segment, i) => {
                    const segAngle = 360 / WHEEL_SEGMENTS.length;
                    const rotation = i * segAngle + segAngle / 2;
                    const rad = ((rotation - 90) * Math.PI) / 180;
                    const radius = 38;
                    const x = 50 + radius * Math.cos(rad);
                    const y = 50 + radius * Math.sin(rad);
                    return (
                      <div
                        key={`label-${i}`}
                        className="absolute text-white font-black text-xs sm:text-sm drop-shadow-lg"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        }}
                      >
                        {segment.label}
                      </div>
                    );
                  })}

                  {/* Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 flex items-center justify-center text-xl sm:text-2xl backdrop-blur-sm shadow-lg">
                      🎡
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Multiplier table */}
              <div className="mb-6 grid grid-cols-4 gap-2 text-center text-xs">
                {WHEEL_SEGMENTS.map((seg, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border py-1.5 px-1 transition-all ${
                      wheelResult === i
                        ? "border-amber-400 bg-amber-500/20 text-amber-400"
                        : "border-white/10 bg-white/5 text-zinc-400"
                    }`}
                  >
                    <div className={`font-bold text-sm bg-gradient-to-r ${seg.color} bg-clip-text text-transparent`}>
                      {seg.label}
                    </div>
                    <div className="text-[10px] opacity-60">{Math.round(seg.chance * 100)}%</div>
                  </div>
                ))}
              </div>

              {/* Spin button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={!wheelSpinning && balance >= bet ? { scale: 1.05 } : {}}
                  whileTap={!wheelSpinning && balance >= bet ? { scale: 0.95 } : {}}
                  onClick={spinWheel}
                  disabled={wheelSpinning || balance < bet}
                  className={`rounded-2xl px-10 py-4 text-xl font-black shadow-2xl transition-all ${
                    wheelSpinning || balance < bet
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:shadow-cyan-500/50"
                  }`}
                >
                  {wheelSpinning ? "Крутимо..." : balance < bet ? "Мало коштів" : `🎡 Крутити (${formatMoney(bet)} ₴)`}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <h3 className="text-lg font-bold text-white mb-4">📜 Історія ігор</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {history.slice(0, 20).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">{item.game}</span>
                  <span className="text-zinc-500">Ставка: {formatMoney(item.bet)} ₴</span>
                </div>
                <span className={item.win > 0 ? "text-green-400 font-bold" : "text-red-400"}>
                  {item.win > 0 ? `+${formatMoney(item.win)} ₴` : `-${formatMoney(item.bet)} ₴`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Back button */}
      <div className="relative z-10 mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          ← На головну
        </Link>
      </div>
    </div>
  );
}
