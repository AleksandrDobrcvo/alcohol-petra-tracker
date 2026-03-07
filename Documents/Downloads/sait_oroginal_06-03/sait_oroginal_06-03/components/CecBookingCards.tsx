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
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-emerald-900/20 p-8 backdrop-blur transition-all hover:border-emerald-500/60">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-emerald-400">🍃 ПЕТРУШКА</h3>
              <span
                className={`h-3 w-3 rounded-full ${
                  current.PETRA ? "bg-orange-500 animate-pulse" : "bg-emerald-500"
                }`}
              />
            </div>

            {current.PETRA ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-zinc-400">Займає:</p>
                  <p className="text-lg font-semibold text-white">
                    @{current.PETRA.user.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Залишилось:</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {getTimeLeft(current.PETRA.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Чекають:</p>
                  <p className="text-lg font-semibold text-white">
                    {queue.PETRA} {queue.PETRA === 1 ? "особа" : "осіб"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-emerald-400">ВІЛЬНО!</p>
                </div>
                <button
                  onClick={() => handleBooking("PETRA")}
                  disabled={!session}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  📝 Забронювати
                </button>
              </div>
            )}
          </div>
        </div>

        {/* АЛКОГОЛЬ */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 to-amber-900/20 p-8 backdrop-blur transition-all hover:border-amber-500/60">
          <div className="absolute inset-0 bg-amber-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-amber-400">🍺 АЛКОГОЛЬ</h3>
              <span
                className={`h-3 w-3 rounded-full ${
                  current.ALCO ? "bg-orange-500 animate-pulse" : "bg-amber-500"
                }`}
              />
            </div>

            {current.ALCO ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-zinc-400">Займає:</p>
                  <p className="text-lg font-semibold text-white">
                    @{current.ALCO.user.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Залишилось:</p>
                  <p className="text-lg font-semibold text-amber-400">
                    {getTimeLeft(current.ALCO.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Чекають:</p>
                  <p className="text-lg font-semibold text-white">
                    {queue.ALCO} {queue.ALCO === 1 ? "особа" : "осіб"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-amber-400">ВІЛЬНО!</p>
                </div>
                <button
                  onClick={() => handleBooking("ALCO")}
                  disabled={!session}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  📝 Забронювати
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CecBookingModal
        isOpen={isModalOpen}
        cecType={selectedCec}
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
