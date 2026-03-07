"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CecBookingModal } from "./CecBookingModal";

interface CecBooking {
  id: string;
  cecType: string;
  user: { id: string; name: string };
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
}

export function CecBookingCards() {
  const { data: session } = useSession();
  const [current, setCurrent] = useState<Record<string, CecBooking | null>>({
    PETRA: null,
    ALCO: null,
  });
  const [queue, setQueue] = useState<Record<string, number>>({
    PETRA: 0,
    ALCO: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCec, setSelectedCec] = useState<"PETRA" | "ALCO">("PETRA");
  const [selectedQueueCount, setSelectedQueueCount] = useState(0);
  const [selectedHasActive, setSelectedHasActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currentRes, queueRes] = await Promise.all([
          fetch("/api/cec-bookings/list?view=current"),
          fetch("/api/cec-bookings/list?view=queue"),
        ]);

        const currentData = await currentRes.json();
        const queueData = await queueRes.json();

        const cecMap: Record<string, CecBooking | null> = {
          PETRA: null,
          ALCO: null,
        };

        currentData.data.forEach((booking: CecBooking) => {
          if (new Date(booking.endTime) > new Date()) {
            cecMap[booking.cecType] = booking;
          }
        });

        setCurrent(cecMap);

        const queueMap: Record<string, number> = { PETRA: 0, ALCO: 0 };
        queueData.data.forEach(
          (q: { cecType: string; count: number }) => {
            queueMap[q.cecType] = q.count;
          }
        );
        setQueue(queueMap);
      } catch (error) {
        console.error("Помилка завантаження цехів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Оновлювати кожні 30 сек
    return () => clearInterval(interval);
  }, []);

  const handleBooking = (cecType: "PETRA" | "ALCO") => {
    setSelectedCec(cecType);
    setSelectedQueueCount(queue[cecType] || 0);
    setSelectedHasActive(!!current[cecType]);
    setIsModalOpen(true);
  };

  const getTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Закінчено";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}ч ${minutes}м`;
  };

  if (loading) {
    return <div className="text-center text-zinc-400">Завантажуємо...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ПЕТРУШКА */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-emerald-900/40 to-emerald-900/10 p-6 md:p-7 backdrop-blur-xl transition-all hover:border-emerald-400/80 hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl shadow-inner shadow-emerald-500/40">
                  🍃
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-emerald-200 tracking-wide">
                    ПЕТРУШКА
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/70">
                    зелений цех
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${
                    current.PETRA
                      ? "bg-amber-500/15 text-amber-200 border border-amber-400/40"
                      : "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      current.PETRA ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                    }`}
                  />
                  {current.PETRA ? "ЗАЙНЯТО" : "ВІЛЬНО"}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Черга:{" "}
                  <span className="font-semibold text-emerald-200">
                    {queue.PETRA} {queue.PETRA === 1 ? "особа" : "осіб"}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-400">Поточний гравець</p>
                <p className="text-base font-semibold text-white">
                  {current.PETRA ? `@${current.PETRA.user.name}` : "Ніхто не зайняв"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Приблизно залишилось</p>
                <p className="text-base font-semibold text-emerald-300">
                  {current.PETRA ? getTimeLeft(current.PETRA.endTime) : "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs">
              <p className="text-zinc-400">
                Можеш забронювати місце навіть якщо цех зайнятий — ти потрапиш в
                чергу.
              </p>
            </div>

            <button
              onClick={() => handleBooking("PETRA")}
              disabled={!session}
              className="mt-5 w-full rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.9)] disabled:opacity-50 disabled:shadow-none"
            >
              {session ? "📝 Забронювати місце" : "Увійди через Discord, щоб бронювати"}
            </button>
          </div>
        </div>

        {/* АЛКОГОЛЬ */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/60 via-amber-900/40 to-amber-900/10 p-6 md:p-7 backdrop-blur-xl transition-all hover:border-amber-400/80 hover:shadow-[0_0_40px_rgba(245,158,11,0.35)]">
          <div className="absolute inset-0 bg-amber-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-2xl shadow-inner shadow-amber-500/40">
                  🍺
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-amber-200 tracking-wide">
                    АЛКОГОЛЬ
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300/70">
                    золотий цех
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${
                    current.ALCO
                      ? "bg-amber-500/15 text-amber-200 border border-amber-400/40"
                      : "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      current.ALCO ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                    }`}
                  />
                  {current.ALCO ? "ЗАЙНЯТО" : "ВІЛЬНО"}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Черга:{" "}
                  <span className="font-semibold text-amber-200">
                    {queue.ALCO} {queue.ALCO === 1 ? "особа" : "осіб"}
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-400">Поточний гравець</p>
                <p className="text-base font-semibold text-white">
                  {current.ALCO ? `@${current.ALCO.user.name}` : "Ніхто не зайняв"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Приблизно залишилось</p>
                <p className="text-base font-semibold text-amber-300">
                  {current.ALCO ? getTimeLeft(current.ALCO.endTime) : "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-xs">
              <p className="text-zinc-400">
                Забронюй слот зараз — якщо цех зайнятий, ти станеш наступним у
                черзі.
              </p>
            </div>

            <button
              onClick={() => handleBooking("ALCO")}
              disabled={!session}
              className="mt-5 w-full rounded-xl bg-amber-500/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.9)] disabled:opacity-50 disabled:shadow-none"
            >
              {session ? "📝 Забронювати місце" : "Увійди через Discord, щоб бронювати"}
            </button>
          </div>
        </div>
      </div>

      <CecBookingModal
        isOpen={isModalOpen}
        cecType={selectedCec}
        queueCount={selectedQueueCount}
        hasActive={selectedHasActive}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          // Перезавантажити дані
          window.location.reload();
        }}
      />
    </>
  );
}
