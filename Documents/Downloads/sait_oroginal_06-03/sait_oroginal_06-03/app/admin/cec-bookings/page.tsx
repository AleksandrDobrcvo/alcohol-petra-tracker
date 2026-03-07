"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface CecBooking {
  id: string;
  cecType: string;
  user: { id: string; name: string; discordId: string };
  duration: number;
  reason?: string;
  status: string;
  createdAt: string;
}

export default function CecBookingsAdminPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<CecBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED">("PENDING");

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000); // Оновлювати кожні 10 сек
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const view = filter === "PENDING" ? "pending" : "current";
      const response = await fetch(`/api/cec-bookings/list?view=${view}`);
      const data = await response.json();
      setBookings(data.data || []);
    } catch (error) {
      console.error("Помилка завантаження броней:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/cec-bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      if (response.ok) {
        await fetchBookings();
      }
    } catch (error) {
      console.error("Помилка при одобренні:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/cec-bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });

      if (response.ok) {
        await fetchBookings();
      }
    } catch (error) {
      console.error("Помилка при відхиленні:", error);
    }
  };

  const getCecIcon = (cecType: string) => {
    return cecType === "PETRA" ? "🍃" : "🍺";
  };

  const getCecLabel = (cecType: string) => {
    return cecType === "PETRA" ? "Петрушка" : "Алкоголь";
  };

  const getCecColor = (cecType: string) => {
    return cecType === "PETRA"
      ? "border-emerald-500/30 bg-emerald-950/20"
      : "border-amber-500/30 bg-amber-950/20";
  };

  if (!session || !["LEADER", "DEPUTY", "SENIOR"].includes(session.user?.role as string)) {
    return (
      <div className="mx-auto max-w-4xl text-center py-12">
        <p className="text-red-400">❌ Немає доступу до цієї сторінки</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-12">
      <h1 className="text-3xl font-bold text-white mb-8">🛠️ Управління цехами</h1>

      {/* Табули */}
      <div className="flex gap-4 mb-8 border-b border-white/10">
        <button
          onClick={() => {
            setFilter("PENDING");
            fetchBookings();
          }}
          className={`px-4 py-3 font-medium transition-colors ${
            filter === "PENDING"
              ? "text-white border-b-2 border-white -mb-0.5"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          ⏳ На одобренні ({bookings.length})
        </button>
        <button
          onClick={() => {
            setFilter("APPROVED");
            fetchBookings();
          }}
          className={`px-4 py-3 font-medium transition-colors ${
            filter === "APPROVED"
              ? "text-white border-b-2 border-white -mb-0.5"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          ✅ Активні цехи
        </button>
      </div>

      {loading ? (
        <div className="text-center text-zinc-400">Завантажуємо...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          {filter === "PENDING" ? "Немає нових заявок" : "Немає активних цехів"}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`rounded-xl border p-6 backdrop-blur ${getCecColor(
                booking.cecType
              )}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getCecIcon(booking.cecType)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {getCecLabel(booking.cecType)}
                      </h3>
                      <p className="text-sm text-zinc-400">@{booking.user.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-zinc-400">Користувач:</p>
                      <p className="text-white font-medium">{booking.user.name}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Тривалість:</p>
                      <p className="text-white font-medium">{booking.duration} годин</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Статус:</p>
                      <p
                        className={`font-medium ${
                          booking.status === "PENDING"
                            ? "text-yellow-400"
                            : booking.status === "APPROVED"
                              ? "text-green-400"
                              : "text-zinc-400"
                        }`}
                      >
                        {booking.status === "PENDING"
                          ? "На очікуванні"
                          : booking.status === "APPROVED"
                            ? "Одобрено"
                            : booking.status}
                      </p>
                    </div>
                    {booking.reason && (
                      <div>
                        <p className="text-zinc-400">Причина:</p>
                        <p className="text-white font-medium text-xs">
                          {booking.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {filter === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors"
                    >
                      ✅ Схвалити
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors"
                    >
                      ❌ Відхилити
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
