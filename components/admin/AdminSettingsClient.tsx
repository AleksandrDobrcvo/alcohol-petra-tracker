"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Users, 
  Crown, 
  Star, 
  Shield, 
  Palette, 
  Sliders,
  Save,
  Info,
  Beer,
  Sprout,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

const roleInfo = [
  { 
    role: "LEADER", 
    label: "Лідер", 
    emoji: "👑", 
    color: "from-amber-500 to-yellow-500",
    textColor: "text-amber-400",
    desc: "Повний доступ до всіх функцій системи" 
  },
  { 
    role: "DEPUTY", 
    label: "Заступник", 
    emoji: "⭐", 
    color: "from-amber-400 to-orange-400",
    textColor: "text-orange-400",
    desc: "Управління користувачами та заявками" 
  },
  { 
    role: "SENIOR", 
    label: "Старший", 
    emoji: "🛡️", 
    color: "from-amber-500/50 to-amber-600/50",
    textColor: "text-amber-300",
    desc: "Перегляд та схвалення заявок" 
  },
  { 
    role: "ALCO_STAFF", 
    label: "Алко-персонал", 
    emoji: "🍺", 
    color: "from-emerald-500/50 to-emerald-600/50",
    textColor: "text-emerald-400",
    desc: "Модерація заявок на алкоголь" 
  },
  { 
    role: "PETRA_STAFF", 
    label: "Петра-персонал", 
    emoji: "🌿", 
    color: "from-emerald-500/50 to-teal-600/50",
    textColor: "text-teal-400",
    desc: "Модерація заявок на петру" 
  },
  { 
    role: "MEMBER", 
    label: "Учасник", 
    emoji: "✅", 
    color: "from-sky-500/50 to-sky-600/50",
    textColor: "text-sky-400",
    desc: "Базовий доступ для подачі заявок" 
  },
];

const adminSections = [
  { 
    href: "/admin/users", 
    icon: Users, 
    label: "Користувачі", 
    desc: "Управління ролями та доступом",
    color: "from-amber-500/10 to-orange-500/5",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-500"
  },
  { 
    href: "/admin/requests", 
    icon: Shield, 
    label: "Заявки", 
    desc: "Перевірка та схвалення заявок",
    color: "from-emerald-500/10 to-teal-500/5",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-500"
  },
  { 
    href: "/admin/entries", 
    icon: Beer, 
    label: "Записи", 
    desc: "Історія всіх записів ресурсів",
    color: "from-sky-500/10 to-blue-500/5",
    borderColor: "border-sky-500/20",
    iconColor: "text-sky-500"
  },
  { 
    href: "/admin/pricing", 
    icon: Sliders, 
    label: "Ціни", 
    desc: "Налаштування цін за зірками",
    color: "from-purple-500/10 to-violet-500/5",
    borderColor: "border-purple-500/20",
    iconColor: "text-purple-500"
  },
  { 
    href: "/admin/audit", 
    icon: Info, 
    label: "Аудит", 
    desc: "Журнал всіх дій в системі",
    color: "from-pink-500/10 to-rose-500/5",
    borderColor: "border-pink-500/20",
    iconColor: "text-pink-500"
  },
  { 
    href: "/admin/public-link", 
    icon: Crown, 
    label: "Публічне посилання", 
    desc: "Налаштування публічної статистики",
    color: "from-indigo-500/10 to-blue-500/5",
    borderColor: "border-indigo-500/20",
    iconColor: "text-indigo-500"
  },
];

export function AdminSettingsClient() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 mb-6">
          <Settings className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Налаштування</h1>
        <p className="text-zinc-500 mt-2">Панель керування системою</p>
      </motion.div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {adminSections.map((section, i) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link 
              href={section.href}
              className={`group block p-5 rounded-2xl bg-gradient-to-br ${section.color} border ${section.borderColor} hover:border-white/20 transition-all duration-300`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ${section.iconColor} group-hover:scale-110 transition-transform`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{section.label}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{section.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Role Hierarchy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-500">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Ієрархія ролей</h2>
            <p className="text-xs text-zinc-500">Опис прав доступу кожної ролі</p>
          </div>
        </div>

        <div className="space-y-3">
          {roleInfo.map((role, i) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${role.color} text-lg`}>
                {role.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${role.textColor}`}>{role.label}</span>
                  <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded">{role.role}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{role.desc}</p>
              </div>
              <div className="text-[10px] font-black text-zinc-600 uppercase">
                #{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
              <Info className="w-5 h-5" />
            </div>
            <span className="font-bold text-emerald-400">Як призначити роль?</span>
          </div>
          <ol className="text-sm text-zinc-400 space-y-2">
            <li>1. Перейдіть до <span className="text-white font-medium">Користувачі</span></li>
            <li>2. Знайдіть потрібного користувача</li>
            <li>3. Натисніть на випадаюче меню ролі</li>
            <li>4. Оберіть нову роль зі списку</li>
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="font-bold text-amber-400">Налаштування цін</span>
          </div>
          <p className="text-sm text-zinc-400 mb-3">
            Ціни за зірками можна змінити у розділі <span className="text-white font-medium">Ціни</span>.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-zinc-500">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 1★ = 50₴
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 2★ = 100₴
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /><Star className="w-3 h-3 text-amber-500 fill-amber-500" /><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 3★ = 150₴
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
