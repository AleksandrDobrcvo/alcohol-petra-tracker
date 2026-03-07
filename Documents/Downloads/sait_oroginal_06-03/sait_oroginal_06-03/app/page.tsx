import Link from "next/link";
import { unstable_noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/server/authOptions";
import LazyFormWrapper from "@/components/LazyFormWrapper";
import RefreshSessionButton from "@/components/RefreshSessionButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  unstable_noStore();
  let session = null;
  let role: "LEADER" | "DEPUTY" | "SENIOR" | "ALCO_STAFF" | "PETRA_STAFF" | "MEMBER" = "MEMBER";
  let isApproved = false;
  try {
    session = await getServerSession(authOptions);
    role = (session?.user?.role as any) ?? "MEMBER";
    isApproved = session?.user?.isApproved ?? false;
  } catch {
    // БД/сессия недоступны — показываем главную без сессии, без ошибки
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col px-6 py-12 pb-20">
      {/* Decorative Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] animate-blob" />
        <div className="absolute -right-28 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-sky-500/10 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Бутылка (Алко) і Петра на головному екрані */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-0 top-20 hidden w-[180px] select-none sm:block md:w-[240px]">
          <img className="float-petra opacity-90" src="/petra.png" alt="" loading="lazy" draggable={false} />
        </div>
        <div className="absolute right-0 top-28 hidden w-[180px] select-none sm:block md:w-[240px]">
          <img className="float-alco opacity-90" src="/alco.png" alt="" loading="lazy" draggable={false} />
        </div>
      </div>

      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎯 SOBRANIE
        </h1>
        <p className="text-lg text-zinc-300 mb-6">
          Облік ресурсів клану
        </p>

        {session ? (
          <>
            <p className="text-xl text-zinc-300 mb-4">
              👋 Вітаємо, <span className="text-amber-400 font-bold">{session.user?.name || "користувач"}</span>!
            </p>
            {!isApproved && (
              <>
                <div className="mx-auto max-w-md rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200 backdrop-blur-sm shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                  ⏳ Твій акаунт очікує на підтвердження адміністратором. Незабаром ти отримаєш доступ до всіх функцій!
                </div>
                <RefreshSessionButton />
              </>
            )}
            {(role === "LEADER" || role === "DEPUTY" || role === "SENIOR") && (
              <div className="mx-auto max-w-md rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-200 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                ✅ Ти маєш розширений доступ до управління кланом.
              </div>
            )}
          </>
        ) : (
          <div className="mx-auto max-w-xl space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                🔐 Вхід через Discord
              </h2>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                Ми використовуємо Discord тільки для ідентифікації вашого ігрового персонажа. 
                Це необхідно, щоб ваші записи про здачу ресурсів зберігалися у вашому профілі, 
                а ви могли бачити свою статистику та історію виплат.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-green-400 font-medium bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Це на 100% безпечно
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-500 italic">
              *Ми не отримуємо доступ до вашого пароля або особистих даних Discord.
            </p>
          </div>
        )}

        {session && (
          <section className="relative z-10 mt-6 text-center">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
              href="/entries"
            >
              📒 Перейти до записів
            </Link>
          </section>
        )}

        {session && (role === "LEADER" || role === "DEPUTY" || role === "SENIOR") && (
          <section className="relative z-10 mt-4 text-center">
            <Link
              className="group relative inline-flex items-center justify-center rounded-xl bg-red-500/20 px-6 py-3 text-sm font-black uppercase tracking-widest text-red-300 backdrop-blur hover:bg-red-500/30 transition-all"
              href="/admin/users"
            >
              ⚙️ Адмін панель
              <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </section>
        )}
      </div>

      {session && (
        <section className="relative z-10 mt-6 text-center">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            href="/public/stats"
          >
            📊 Публічна статистика клану
          </Link>
        </section>
      )}

      {session && (
        <section className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600/20 to-amber-600/20 border border-emerald-500/20 px-6 py-3 text-sm font-black uppercase tracking-widest text-emerald-300 backdrop-blur hover:from-emerald-600/30 hover:to-amber-600/30 hover:text-white transition-all"
            href="/workshops"
          >
            🏭 Цехи
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 px-6 py-3 text-sm font-black uppercase tracking-widest text-purple-300 backdrop-blur hover:from-purple-600/30 hover:to-pink-600/30 hover:text-white transition-all"
            href="/casino"
          >
            🎰 Казино
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </section>
      )}

      <section className="relative z-10 mt-10 grid gap-6 md:grid-cols-3">
        <div className="group relative rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl group-hover:scale-110 transition-transform duration-300">🍺</div>
            <div className="text-xl font-bold text-white mb-2">Алкоголь</div>
            <div className="text-sm text-zinc-400 leading-relaxed">Здавай алкоголь на склад клану та отримуй винагороду.</div>
          </div>
        </div>
        
        <div className="group relative rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl group-hover:scale-110 transition-transform duration-300">🌿</div>
            <div className="text-xl font-bold text-white mb-2">Петра</div>
            <div className="text-sm text-zinc-400 leading-relaxed">Допомагай клану ресурсами та ставай сильнішим.</div>
          </div>
        </div>

        <div className="group relative rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-2xl group-hover:scale-110 transition-transform duration-300">🛡️</div>
            <div className="text-xl font-bold text-white mb-2">Безпека</div>
            <div className="text-sm text-zinc-400 leading-relaxed">Повна конфіденційність та захист ваших даних.</div>
          </div>
        </div>
      </section>

      {/* Animated submission button */}
      <LazyFormWrapper />
    </main>
  );
}
