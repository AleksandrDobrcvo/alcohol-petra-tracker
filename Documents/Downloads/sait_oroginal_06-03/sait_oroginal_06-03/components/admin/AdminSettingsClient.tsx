"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

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

type RoleDef = {
  id?: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
  textColor: string;
  power: number;
  desc?: string;
};

// Predefined color themes for easy selection
const COLOR_THEMES = [
  { name: "Золото", color: "from-amber-500 to-yellow-500", textColor: "text-amber-400", preview: "bg-gradient-to-r from-amber-500 to-yellow-500" },
  { name: "Помаранч", color: "from-amber-400 to-orange-400", textColor: "text-orange-400", preview: "bg-gradient-to-r from-amber-400 to-orange-400" },
  { name: "Червоний", color: "from-red-500 to-rose-500", textColor: "text-red-400", preview: "bg-gradient-to-r from-red-500 to-rose-500" },
  { name: "Рожевий", color: "from-pink-500 to-rose-400", textColor: "text-pink-400", preview: "bg-gradient-to-r from-pink-500 to-rose-400" },
  { name: "Фіолет", color: "from-purple-500 to-violet-500", textColor: "text-purple-400", preview: "bg-gradient-to-r from-purple-500 to-violet-500" },
  { name: "Синій", color: "from-blue-500 to-indigo-500", textColor: "text-blue-400", preview: "bg-gradient-to-r from-blue-500 to-indigo-500" },
  { name: "Блакитний", color: "from-sky-500 to-cyan-500", textColor: "text-sky-400", preview: "bg-gradient-to-r from-sky-500 to-cyan-500" },
  { name: "Бірюза", color: "from-teal-500 to-emerald-500", textColor: "text-teal-400", preview: "bg-gradient-to-r from-teal-500 to-emerald-500" },
  { name: "Зелений", color: "from-emerald-500 to-green-500", textColor: "text-emerald-400", preview: "bg-gradient-to-r from-emerald-500 to-green-500" },
  { name: "Сірий", color: "from-zinc-500 to-slate-500", textColor: "text-zinc-400", preview: "bg-gradient-to-r from-zinc-500 to-slate-500" },
];

// Popular emojis for roles
const ROLE_EMOJIS = ["👑", "⭐", "🛡️", "🍺", "🌿", "✅", "🔥", "⚡", "💎", "🌟", "🏆", "🎯", "🚀", "💠", "💔", "🥇", "🥈", "🥉", "🎉", "🌈"];

export function AdminSettingsClient() {
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<RoleDef | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  async function loadRoles() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles");
      const json = await res.json();
      if (json.ok) setRoles(json.data.roles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  async function saveRole(role: RoleDef) {
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(role),
      });
      const json = await res.json();
      if (json.ok) {
        setEditingRole(null);
        setIsAdding(false);
        loadRoles();
      } else {
        alert(json.error?.message || "Error saving role");
      }
    } catch (e) {
      alert("Network error");
    }
  }

  async function deleteRole(name: string) {
    if (!confirm(`Ви впевнені, що хочете видалити роль ${name}?`)) return;
    try {
      const res = await fetch("/api/admin/roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (json.ok) loadRoles();
      else alert(json.error?.message || "Error deleting role");
    } catch (e) {
      alert("Network error");
    }
  }

  async function seedRoles() {
    const defaultRoles = [
      { name: "LEADER", label: "Лідер", emoji: "👑", color: "from-amber-500 to-yellow-500", textColor: "text-amber-400", power: 100, desc: "Повний доступ до всіх функцій" },
      { name: "DEPUTY", label: "Заступник", emoji: "⭐", color: "from-amber-400 to-orange-400", textColor: "text-orange-400", power: 80, desc: "Керування користувачами та заявками" },
      { name: "SENIOR", label: "Старший", emoji: "🛡️", color: "from-amber-500/50 to-amber-600/50", textColor: "text-amber-300", power: 60, desc: "Перегляд та схвалення заявок" },
      { name: "ALCO_STAFF", label: "Алко-персонал", emoji: "🍺", color: "from-emerald-500/50 to-emerald-600/50", textColor: "text-emerald-400", power: 40, desc: "Модерація заявок на алкоголь" },
      { name: "PETRA_STAFF", label: "Петра-персонал", emoji: "🌿", color: "from-emerald-500/50 to-teal-600/50", textColor: "text-teal-400", power: 40, desc: "Модерація заявок на петру" },
      { name: "MEMBER", label: "Учасник", emoji: "✅", color: "from-sky-500/50 to-sky-600/50", textColor: "text-sky-400", power: 20, desc: "Базовий доступ для подачі заявок" },
    ];

    for (const r of defaultRoles) {
      await saveRole(r);
    }
    loadRoles();
  }

  return (
    <div className="space-y-10 pb-20">
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
        <p className="text-zinc-500 mt-2">Панель керування системою та ролями</p>
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

      {/* Role Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-500">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Керування ролями</h2>
              <p className="text-xs text-zinc-500">Налаштування ієрархії, назв та кольорів</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {roles.length === 0 && !loading && (
              <button 
                onClick={seedRoles}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-white/10 transition-all"
              >
                📥 Відновити стандартні
              </button>
            )}
            <button 
              onClick={() => {
                setIsAdding(true);
                setEditingRole({ name: "", label: "", emoji: "👤", color: "from-sky-500/50 to-sky-600/50", textColor: "text-sky-400", power: 0, desc: "" });
              }}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-white hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Додати роль
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="w-8 h-8 text-zinc-700 animate-spin" />
            </div>
          ) : (
            roles.map((role, i) => (
              <motion.div
                key={role.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="group relative flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${role.color} text-2xl shadow-lg`}>
                  {role.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-black ${role.textColor}`}>{role.label}</span>
                    <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">{role.name}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-400 border border-white/5">Power: {role.power}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{role.desc || "Опис відсутній"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingRole(role)}
                    className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  { !["LEADER", "DEPUTY", "SENIOR", "MEMBER"].includes(role.name) && (
                    <button 
                      onClick={() => deleteRole(role.name)}
                      className="p-3 rounded-xl bg-white/5 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Edit Role Modal - Visual Editor */}
      <AnimatePresence>
        {(editingRole || isAdding) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setEditingRole(null); setIsAdding(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 bg-zinc-900 p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {isAdding ? "Нова роль" : "Редагування ролі"}
                </h2>
                <button onClick={() => { setEditingRole(null); setIsAdding(false); }} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Live Preview */}
              <div className="mb-8 p-6 rounded-2xl bg-black/30 border border-white/5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-4">Перегляд</div>
                <div className="flex items-center gap-4">
                  <motion.div 
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${editingRole?.color} text-3xl shadow-lg`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {editingRole?.emoji || "👤"}
                  </motion.div>
                  <div>
                    <div className={`text-xl font-black ${editingRole?.textColor || 'text-white'}`}>
                      {editingRole?.label || "Назва ролі"}
                    </div>
                    <div className="text-xs text-zinc-500">{editingRole?.desc || "Опис ролі"}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded">{editingRole?.name || "ROLE_ID"}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Сила: {editingRole?.power || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">ID Ролі <span className="text-zinc-600">(латиниця)</span></label>
                    <input 
                      type="text"
                      disabled={!isAdding}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                      value={editingRole?.name}
                      onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') } : null)}
                      placeholder="MODERATOR"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Назва ролі</label>
                    <input 
                      type="text"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                      value={editingRole?.label}
                      onChange={(e) => setEditingRole(prev => prev ? { ...prev, label: e.target.value } : null)}
                      placeholder="Модератор"
                    />
                  </div>
                </div>

                {/* Emoji Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Іконка ролі</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_EMOJIS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingRole(prev => prev ? { ...prev, emoji } : null)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                          editingRole?.emoji === emoji 
                            ? 'bg-amber-500 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400' 
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                    <input
                      type="text"
                      className="w-12 h-12 rounded-xl bg-white/5 text-center text-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      value={editingRole?.emoji}
                      onChange={(e) => setEditingRole(prev => prev ? { ...prev, emoji: e.target.value.slice(-2) } : null)}
                      maxLength={2}
                      title="Або введіть свой емодзі"
                    />
                  </div>
                </div>

                {/* Color Theme Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Колір ролі</label>
                  <div className="grid grid-cols-5 gap-3">
                    {COLOR_THEMES.map((theme) => (
                      <motion.button
                        key={theme.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingRole(prev => prev ? { ...prev, color: theme.color, textColor: theme.textColor } : null)}
                        className={`relative h-14 rounded-xl ${theme.preview} overflow-hidden transition-all ${
                          editingRole?.color === theme.color 
                            ? 'ring-2 ring-white shadow-lg' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="absolute inset-0 flex items-end justify-center pb-1">
                          <span className="text-[9px] font-bold text-white/90 drop-shadow-lg">{theme.name}</span>
                        </div>
                        {editingRole?.color === theme.color && (
                          <motion.div 
                            className="absolute inset-0 border-2 border-white rounded-xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Power Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Сила ролі</label>
                    <span className="text-sm font-black text-amber-400">{editingRole?.power || 0}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editingRole?.power || 0}
                      onChange={(e) => setEditingRole(prev => prev ? { ...prev, power: parseInt(e.target.value) } : null)}
                      className="w-full h-3 rounded-full appearance-none bg-zinc-800 cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-500/30"
                    />
                    <div className="flex justify-between mt-2 px-1">
                      <span className="text-[9px] text-zinc-600">Новачок (0)</span>
                      <span className="text-[9px] text-zinc-600">Лідер (100)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600 px-1">
                    Чим більше сила, тим більше прав. Роль з силою 80 може керувати ролями з силою до 79.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Опис <span className="text-zinc-600">(опціонально)</span></label>
                  <textarea 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all min-h-[80px]"
                    value={editingRole?.desc || ''}
                    onChange={(e) => setEditingRole(prev => prev ? { ...prev, desc: e.target.value } : null)}
                    placeholder="Що може робити ця роль?"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => { setEditingRole(null); setIsAdding(false); }}
                    className="flex-1 rounded-2xl bg-white/5 py-4 text-sm font-black text-zinc-500 uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Скасувати
                  </button>
                  <button 
                    onClick={() => editingRole && saveRole(editingRole)}
                    className="flex-[2] rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 py-4 text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Зберегти
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
