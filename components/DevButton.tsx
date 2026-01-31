"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DevButton() {
  const { data: session } = useSession();
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [status, setStatus] = useState<string | null>(null);

  // Seed Owner Function
  const seedOwner = async () => {
    try {
      setStatus("Seeding...");
      const res = await fetch("/api/dev/seed-owner", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setStatus("✅ Owner Seeded!");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatus("❌ " + (data.error || "Error"));
      }
    } catch (e) {
      setStatus("❌ Failed to fetch");
    }
  };

  // Оновлюємо час кожну секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Показувати тільки в development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {/* DEV кнопка збоку з пульсацією */}
      <button
        onClick={() => setShowDevPanel(!showDevPanel)}
        className="fixed top-4 right-4 z-50 bg-red-500/80 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-600/80 transition-all duration-300 animate-pulse shadow-lg"
      >
        DEV
      </button>

      {/* DEV панель */}
      {showDevPanel && (
        <div className="fixed top-16 right-4 z-50 bg-black/95 backdrop-blur-md rounded-lg p-4 border border-red-500/30 text-white text-xs space-y-3 min-w-[250px] shadow-2xl">
          <div className="font-bold text-red-400 mb-2 text-center">🔧 DEV PANEL</div>
          
          {/* Інформація про систему */}
          <div className="bg-black/50 rounded p-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">User:</span>
              <span className="text-white font-medium truncate max-w-[120px]">
                {session?.user?.name || "Guest"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Role:</span>
              <span className="text-amber-400 font-bold">
                {String(session?.user?.role || "NONE")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Perf:</span>
              <span className="text-red-400 animate-pulse font-bold">dev:fast!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span className="text-purple-400">{currentTime}</span>
            </div>
          </div>
          
          {status && (
            <div className="bg-zinc-800 p-2 rounded text-center font-bold text-amber-400 animate-bounce">
              {status}
            </div>
          )}

          {/* Швидкі дії */}
          <div className="border-t border-red-500/30 pt-2">
            <div className="text-gray-400 mb-2 text-center">⚡ Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/users"
                className="bg-red-500/20 border border-red-500/30 p-2 rounded hover:bg-red-500/40 transition-all text-center flex flex-col items-center"
              >
                <span>👥</span>
                <span className="text-[10px]">Users</span>
              </Link>
              <Link
                href="/admin/requests"
                className="bg-purple-500/20 border border-purple-500/30 p-2 rounded hover:bg-purple-500/40 transition-all text-center flex flex-col items-center"
              >
                <span>✅</span>
                <span className="text-[10px]">Requests</span>
              </Link>
              <Link
                href="/entries"
                className="bg-blue-500/20 border border-blue-500/30 p-2 rounded hover:bg-blue-500/40 transition-all text-center flex flex-col items-center"
              >
                <span>📒</span>
                <span className="text-[10px]">Entries</span>
              </Link>
              <Link
                href="/admin/audit"
                className="bg-zinc-500/20 border border-zinc-500/30 p-2 rounded hover:bg-zinc-500/40 transition-all text-center flex flex-col items-center"
              >
                <span>📜</span>
                <span className="text-[10px]">Audit</span>
              </Link>
              <Link
                href="/public/stats"
                className="bg-green-500/20 border border-green-500/30 p-2 rounded hover:bg-green-500/40 transition-all text-center flex flex-col items-center"
              >
                <span>📊</span>
                <span className="text-[10px]">Stats</span>
              </Link>
              <Link
                href="/admin/pricing"
                className="bg-zinc-500/20 border border-zinc-500/30 p-2 rounded hover:bg-zinc-500/40 transition-all text-center flex flex-col items-center"
              >
                <span>💰</span>
                <span className="text-[10px]">Pricing</span>
              </Link>
              <button
                onClick={seedOwner}
                className="bg-yellow-500/20 border border-yellow-500/30 p-2 rounded hover:bg-yellow-500/40 transition-all text-center flex flex-col items-center"
              >
                <span>🌱</span>
                <span className="text-[10px]">Seed</span>
              </button>
            </div>
          </div>
          
          {/* Корисні інструменти */}
          <div className="border-t border-red-500/30 pt-2">
            <div className="text-gray-400 mb-2 text-center">🛠️ Tools</div>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-orange-500/50 px-3 py-2 rounded hover:bg-orange-600/50 transition-colors text-center font-medium"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="block w-full bg-yellow-500/50 px-3 py-2 rounded hover:bg-yellow-600/50 transition-colors text-center font-medium"
              >
                🗑️ Clear Storage
              </button>
              <button
                onClick={() => console.log('DEV INFO:', {
                  mode: process.env.NODE_ENV,
                  time: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                  url: window.location.href
                })}
                className="block w-full bg-cyan-500/50 px-3 py-2 rounded hover:bg-cyan-600/50 transition-colors text-center font-medium"
              >
                📝 Log Info
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowDevPanel(false)}
            className="w-full bg-gray-600/50 px-3 py-2 rounded hover:bg-gray-700/50 transition-colors font-medium"
          >
            ❌ Close Panel
          </button>
        </div>
      )}
    </>
  );
}
