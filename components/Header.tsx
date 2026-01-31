"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#05080a]/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-xl font-bold text-white transition-all duration-300 hover:opacity-80">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-2xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">🏰</span>
            <span className="hidden sm:block">SOBRANIE</span>
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {session && (
              <Link
                href="/public/stats"
                className="group relative flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
              >
                <span>📊 Статистика</span>
                <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}

            {status === "loading" ? (
              <div className="text-zinc-400">Завантаження...</div>
            ) : session ? (
              <>
                {session.user.role === "LEADER" || session.user.role === "DEPUTY" || session.user.role === "SENIOR" ? (
                  <Link
                    href="/admin/users"
                    className="group relative inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-white transition-all hover:bg-white/15"
                  >
                    🛠️ Адмінка
                    <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ) : null}

                {session.user.role === "LEADER" ||
                session.user.role === "DEPUTY" ||
                session.user.role === "SENIOR" ||
                session.user.role === "ALCO_STAFF" ||
                session.user.role === "PETRA_STAFF" ||
                session.user.moderatesAlco ||
                session.user.moderatesPetra ? (
                  <Link
                    href="/admin/requests"
                    className="group relative inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-white transition-all hover:bg-white/15"
                  >
                    ✅ Заявки
                    <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ) : null}
                <Link
                  href="/entries"
                  className="inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15"
                >
                  📒 Записи
                </Link>
                <div className="flex items-center gap-2 text-zinc-200">
                  <span>{session.user.name}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {session.user.role === 'LEADER' ? 'Лідер' : 
                     session.user.role === 'DEPUTY' ? 'Заступник' : 
                     session.user.role === 'SENIOR' ? 'Старший' : 
                     session.user.role === 'ALCO_STAFF' ? 'Сл. Алко' : 
                     session.user.role === 'PETRA_STAFF' ? 'Сл. Петра' : 
                     'Учасник'}
                  </span>
                  {session.user.moderatesAlco ? (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-200">
                      🍺 Наглядач
                    </span>
                  ) : null}
                  {session.user.moderatesPetra ? (
                    <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-xs text-sky-200">
                      💎 Наглядач
                    </span>
                  ) : null}
                  {!session.user.isApproved && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                      ⏳ Очікує
                    </span>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center justify-center rounded-xl bg-red-500/20 px-3 py-2 text-red-300 hover:bg-red-500/30"
                >
                  🚪 Вийти
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-white hover:bg-indigo-400"
              >
                🚀 Увійти через Discord
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
