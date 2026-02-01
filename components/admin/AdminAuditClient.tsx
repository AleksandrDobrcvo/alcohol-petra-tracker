"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings,
  LayoutDashboard,
  RefreshCcw, 
  User, 
  FileText, 
  ArrowRight, 
  Clock,
  Shield,
  Star,
  DollarSign,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Plus,
  Eye
} from "lucide-react";

type AuditRow = {
  id: string;
  createdAt: string;
  action: string;
  targetType: string;
  targetId: string;
  before: unknown;
  after: unknown;
  actor: { id: string; name: string; role: string };
};

// Parse JSON data safely and recursively to handle double stringification
function parseData(data: unknown): Record<string, unknown> | null {
  if (!data) return null;
  if (typeof data === 'object' && data !== null) return data as Record<string, unknown>;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      // If the result is still a string and looks like JSON, try one more time
      if (typeof parsed === 'string' && (parsed.startsWith('{') || parsed.startsWith('['))) {
        return parseData(parsed);
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, unknown>;
      }
      return null;
    } catch {
      return null;
    }
  }
  return null;
}

// Get action icon and color
function getActionStyle(action: string) {
  const styles: Record<string, { icon: typeof User; color: string; bg: string; label: string }> = {
    USER_ROLE_CHANGE: { icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Зміна ролі' },
    USER_APPROVE: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Підтвердження' },
    USER_BLOCK_CHANGE: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Бан / Розбан' },
    USER_BLOCK: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Блокування' },
    ENTRY_CREATE: { icon: Plus, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', label: 'Створення запису' },
    ENTRY_UPDATE: { icon: Edit2, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Редагування запису' },
    ENTRY_DELETE: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Видалення запису' },
    REQUEST_CREATE: { icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', label: 'Нова заявка' },
    REQUEST_DECISION: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Рішення заявки' },
    PRICE_UPDATE: { icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Зміна ціни' },
    MAINTENANCE_TOGGLE: { icon: Settings, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20', label: 'Тех. роботи' },
    PUBLIC_TOKEN_CREATE: { icon: Plus, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', label: 'Публічне посилання' },
    PUBLIC_TOKEN_REVOKE: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Відклик посилання' },
  };
  return styles[action] || { icon: Eye, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20', label: action };
}

// Get role badge
function getRoleBadge(role: string) {
  const badges: Record<string, { label: string; color: string }> = {
    LEADER: { label: '👑 Лідер', color: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black' },
    DEPUTY: { label: '⭐ Заступник', color: 'bg-gradient-to-r from-amber-400 to-orange-400 text-black' },
    SENIOR: { label: '🛡️ Старший', color: 'bg-amber-500/20 text-amber-300' },
    ALCO_STAFF: { label: '🍺 Алко', color: 'bg-emerald-500/20 text-emerald-300' },
    PETRA_STAFF: { label: '🌿 Петра', color: 'bg-emerald-500/20 text-emerald-300' },
    MEMBER: { label: '✅ Учасник', color: 'bg-sky-500/20 text-sky-300' },
  };
  return badges[role] || { label: role, color: 'bg-zinc-500/20 text-zinc-300' };
}

// Format value for display
function formatValue(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined) return '-';
  if (key === 'role') {
    const badge = getRoleBadge(String(value));
    return (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  }
  if (key === 'status') {
    const statuses: Record<string, { label: string; color: string }> = {
      PENDING: { label: '⏳ Очікує', color: 'text-amber-400' },
      APPROVED: { label: '✅ Схвалено', color: 'text-emerald-400' },
      REJECTED: { label: '❌ Відхилено', color: 'text-red-400' },
      PAID: { label: '💰 Оплачено', color: 'text-sky-400' },
      UNPAID: { label: '⏳ Не оплачено', color: 'text-zinc-400' },
    };
    const s = statuses[String(value)];
    return s ? <span className={s.color}>{s.label}</span> : String(value);
  }
  if (key === 'type') {
    return value === 'ALCO' ? '🍺 Алко' : value === 'PETRA' ? '🌿 Петра' : String(value);
  }
  if (key === 'amount' && typeof value === 'number') {
    return <span className="text-white font-mono">{value.toLocaleString('uk-UA')} ₴</span>;
  }
  if (key === 'stars' && typeof value === 'number') {
    return <span className="text-amber-400">{'★'.repeat(value)}</span>;
  }
  if (key === 'date' && typeof value === 'string') {
    return new Date(value).toLocaleDateString('uk-UA');
  }
  if (key === 'unbanDate' && typeof value === 'string') {
    return new Date(value).toLocaleString('uk-UA');
  }
  if (typeof value === 'boolean') {
    return value ? <span className="text-emerald-400">✅ ТАК</span> : <span className="text-red-400">❌ НІ</span>;
  }
  if (key === 'stars1Qty' || key === 'stars2Qty' || key === 'stars3Qty') {
    const stars = key.includes('1') ? 1 : key.includes('2') ? 2 : 3;
    return <span>{String(value)} шт ({stars}★)</span>;
  }
  return String(value);
}

// Get field label
function getFieldLabel(key: string): string {
  const labels: Record<string, string> = {
    role: 'Роль',
    reason: 'Причина',
    status: 'Статус',
    type: 'Тип',
    stars: 'Зірки',
    quantity: 'Кількість',
    amount: 'Сума',
    paymentStatus: 'Оплата',
    nickname: 'Нік',
    date: 'Дата',
    submitterId: 'Користувач',
    decisionNote: 'Коментар',
    isBlocked: 'Бан-статус',
    isApproved: 'Підтверджений',
    screenshotPath: 'Скріншот',
    cardLastDigits: 'Карта',
    banReason: 'Причина бана',
    unbanDate: 'Дата розбану',
    moderatesAlco: 'Алко-модер',
    moderatesPetra: 'Петра-модер',
    stars1Qty: '1★ К-сть',
    stars2Qty: '2★ К-сть',
    stars3Qty: '3★ К-сть',
    totalAmount: 'Загальна сума',
    label: 'Назва',
    color: 'Колір',
    emoji: 'Емодзі',
    power: 'Сила',
    desc: 'Опис',
    price: 'Ціна',
    isFrozen: 'Заморозка',
    frozenReason: 'Причина заморозки',
  };
  return labels[key] || key;
}

export function AdminAuditClient() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; data?: { logs: AuditRow[] } };
      if (!json.ok || !json.data) throw new Error("Failed to load logs");
      setLogs(json.data.logs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-400">
          Показано: <span className="font-bold text-white">{logs.length}</span> <span className="text-zinc-600">(останні 200)</span>
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-zinc-300 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Оновити
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {logs.map((l, idx) => {
              const style = getActionStyle(l.action);
              const Icon = style.icon;
              const beforeData = parseData(l.before);
              const afterData = parseData(l.after);
              const roleBadge = getRoleBadge(l.actor.role);

              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.02 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/[0.02] border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg}`}>
                        <Icon className={`w-5 h-5 ${style.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${roleBadge.color}`}>
                            {roleBadge.label}
                          </span>
                          <span className="text-white font-medium">{l.actor.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-bold ${style.color}`}>{style.label}</span>
                          <span className="text-zinc-600">→</span>
                          <span className="text-xs text-zinc-500">{l.targetType}</span>
                          <span className="text-[10px] font-mono text-zinc-600">{l.targetId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {new Date(l.createdAt).toLocaleString('uk-UA')}
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 p-4 md:p-6 gap-6">
                    {/* Before */}
                    <div className="relative rounded-3xl bg-black/40 border border-white/5 p-5 shadow-inner">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Було</span>
                        </div>
                        {beforeData && <span className="text-[10px] text-zinc-700 italic">Колишній стан</span>}
                      </div>
                      {beforeData ? (
                        <div className="space-y-3">
                          {Object.entries(beforeData)
                            .filter(([k]) => k !== 'screenshotPath' && k !== 'id' && k !== 'updatedAt' && k !== 'createdAt')
                            .map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between gap-4 border-b border-white/[0.02] pb-2 last:border-0 last:pb-0">
                              <span className="text-[11px] font-bold text-zinc-500">{getFieldLabel(key)}</span>
                              <div className="text-xs text-zinc-400 font-medium">{formatValue(key, value)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                          <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Дані відсутні</div>
                        </div>
                      )}
                    </div>

                    {/* After */}
                    <div className="relative rounded-3xl bg-white/[0.03] border border-white/10 p-5 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Стало</span>
                        </div>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <ArrowRight className="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                      {afterData ? (
                        <div className="space-y-3">
                          {Object.entries(afterData)
                            .filter(([k]) => k !== 'screenshotPath' && k !== 'id' && k !== 'updatedAt' && k !== 'createdAt')
                            .map(([key, value]) => {
                            const isChanged = beforeData && (beforeData as any)[key] !== value;
                            return (
                              <div key={key} className={`flex items-center justify-between gap-4 border-b border-white/[0.02] pb-2 last:border-0 last:pb-0 ${isChanged ? 'animate-pulse-subtle' : ''}`}>
                                <span className="text-[11px] font-bold text-zinc-500">{getFieldLabel(key)}</span>
                                <div className={`text-xs font-black ${isChanged ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                  {formatValue(key, value)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                          <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Об'єкт видалено</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

