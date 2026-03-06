"use client";

import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, LogOut, MessageSquare } from "lucide-react";

export function BanGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const isBlocked = (session?.user as any)?.isBlocked;
  const banReason = (session?.user as any)?.banReason;
  const unbanDate = (session?.user as any)?.unbanDate;

  if (status === "loading") return <>{children}</>;

  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[3.5rem] border border-red-500/30 bg-zinc-950 p-8 shadow-[0_0_100px_rgba(220,38,38,0.2)] md:p-12 text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-red-600 to-red-950 text-5xl shadow-[0_10px_40px_rgba(220,38,38,0.5)]">
                🚫
              </div>
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-black uppercase italic tracking-tighter text-white md:text-5xl">
            ДОСТУП ЗАБЛОКОВАНО
          </h1>
          
          <div className="mb-8 space-y-4">
            <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Причина блокування:</p>
              <p className="text-lg font-medium text-white italic">
                "{banReason || "Порушення правил спільноти"}"
              </p>
            </div>

            {unbanDate && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs text-amber-400">
                  Блокування закінчиться: <span className="font-bold">{new Date(unbanDate).toLocaleString('uk-UA')}</span>
                </p>
              </div>
            )}
          </div>

          <p className="mb-8 text-sm text-zinc-500 leading-relaxed">
            Ваш акаунт було тимчасово або перманентно відсторонено від використання системи. 
            Якщо ви вважаєте, що це помилка, зверніться до адміністрації.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a 
              href="https://discord.gg/sobranie" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-widest text-white border border-white/10 hover:bg-white/10 transition-all group"
            >
              <MessageSquare className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              Зв'язатися (Discord)
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-red-900/40 hover:bg-red-500 transition-all active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              Вийти
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              ID: {session?.user?.id}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
