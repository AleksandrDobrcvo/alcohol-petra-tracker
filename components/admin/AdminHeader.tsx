"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, 
  Wallet, 
  CheckCircle2, 
  History, 
  Settings, 
  TrendingUp,
  LayoutDashboard,
  Cog,
  Trophy,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";

type TopContributor = {
  id: string;
  name: string;
  role: string;
  totalAmount: number;
  totalQuantity: number;
};

export function AdminHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const pathname = usePathname();
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);

  // Fetch top contributors for the ticker
  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' });
        const json = await res.json();
        if (json.ok && json.data?.topContributors) {
          setTopContributors(json.data.topContributors);
        } else {
          // Fallback data if API fails
          setTopContributors([
            { name: "Очікуємо лідерів...", totalAmount: 0, id: "1", role: "MEMBER", totalQuantity: 0 },
            { name: "Склад поповнюється...", totalAmount: 0, id: "2", role: "MEMBER", totalQuantity: 0 },
            { name: "Будь першим!", totalAmount: 0, id: "3", role: "MEMBER", totalQuantity: 0 }
          ]);
        }
      } catch (e) {
        console.error('Failed to fetch top contributors:', e);
        // Fallback data if API fails
        setTopContributors([
          { name: "Очікуємо лідерів...", totalAmount: 0, id: "1", role: "MEMBER", totalQuantity: 0 },
          { name: "Склад поповнюється...", totalAmount: 0, id: "2", role: "MEMBER", totalQuantity: 0 },
          { name: "Будь першим!", totalAmount: 0, id: "3", role: "MEMBER", totalQuantity: 0 }
        ]);
      }
    };

    fetchContributors();
    const interval = setInterval(fetchContributors, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: "/admin/users", label: "Користувачі", icon: Users },
    { href: "/admin/entries", label: "Записи", icon: Wallet },
    { href: "/admin/requests", label: "Заявки", icon: CheckCircle2 },
    { href: "/admin/pricing", label: "Ціни", icon: TrendingUp },
    { href: "/admin/audit", label: "Аудит", icon: History },
    { href: "/admin/roles", label: "Ролі", icon: Shield },
    { href: "/admin/settings", label: "⚙️", icon: Cog },
  ];

  return (
    <>
      {/* Top Contributors Ticker */}
      <div className="relative border-b border-white/5 bg-black/40 overflow-hidden h-10 flex items-center select-none group/ticker">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#05080a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#05080a] to-transparent z-10 pointer-events-none" />
        
        <div className="flex whitespace-nowrap items-center">
          <motion.div
            className="flex gap-12 items-center px-6"
            animate={{ x: ["-100%", "0%"] }}
            transition={{ 
              duration: topContributors.length > 0 ? Math.max(40, topContributors.length * 20) : 60, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {/* Content repeated twice for seamless infinite loop - this creates one continuous band */}
            {[...(topContributors.length > 0 ? topContributors : [
              { name: "Очікуємо лідерів...", totalAmount: 0, id: "fallback1" },
              { name: "Склад поповнюється...", totalAmount: 0, id: "fallback2" },
              { name: "Будь першим!", totalAmount: 0, id: "fallback3" }
            ]), ...(topContributors.length > 0 ? topContributors : [
              { name: "Очікуємо лідерів...", totalAmount: 0, id: "fallback1" },
              { name: "Склад поповнюється...", totalAmount: 0, id: "fallback2" },
              { name: "Будь першим!", totalAmount: 0, id: "fallback3" }
            ])].map((c: any, idx) => (
              <div key={`${c.id || idx}-${idx}`} className="flex items-center gap-4 hover:scale-105 transition-transform cursor-default">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-black text-xs text-white uppercase tracking-tight group-hover/ticker:text-amber-400 transition-colors">
                    {c.name}
                  </span>
                </div>
                {c.totalAmount > 0 && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <span className="text-[10px] font-black text-emerald-400">{c.totalAmount.toLocaleString()} ₴</span>
                  </div>
                )}
                <span className="text-white/10 font-black">/</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <header className="relative mb-10 overflow-hidden pt-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">
              <Settings className="w-3 h-3" />
              Адміністрування
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase sm:text-5xl">
              {title}
            </h1>
            <p className="mt-2 text-zinc-500 font-medium">{subtitle}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </header>
    </>
  );
}