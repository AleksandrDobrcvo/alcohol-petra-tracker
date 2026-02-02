"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Wallet, 
  CheckCircle2, 
  History, 
  Settings, 
  TrendingUp,
  LayoutDashboard,
  Cog,
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
                    <div
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"
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