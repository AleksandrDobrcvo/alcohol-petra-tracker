"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="relative z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
            🏰 Клан
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/public/stats"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15"
            >
              📊 Статистика
            </Link>

            {status === "loading" ? (
              <div className="text-zinc-400">Завантаження...</div>
            ) : session ? (
              <>
                {session.user.role === "OWNER" || session.user.role === "ADMIN" ? (
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15"
                  >
                    🛠️ Адмінка
                  </Link>
                ) : null}

                {session.user.role === "OWNER" ||
                session.user.role === "ADMIN" ||
                session.user.moderatesAlco ||
                session.user.moderatesPetra ? (
                  <Link
                    href="/admin/requests"
                    className="inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/15"
                  >
                    ✅ Заявки
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
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                    {session.user.role}
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
