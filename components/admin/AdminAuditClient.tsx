"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
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

// Parse JSON data safely
function parseData(data: unknown): Record<string, unknown> | null {
  if (!data) return null;
  if (typeof data === 'object') return data as Record<string, unknown>;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

// Get action icon and color
function getActionStyle(action: string) {
  const styles: Record<string, { icon: typeof User; color: string; bg: string; label: string }> = {
    USER_ROLE_CHANGE: { icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Зміна ролі' },
    USER_APPROVE: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Підтвердження' },
    USER_BLOCK: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Блокування' },
    ENTRY_CREATE: { icon: Plus, color: 'text-sky-400', bg: 'bg-sky-500/20', label: 'Створення запису' },
    ENTRY_UPDATE: { icon: Edit2, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Редагування запису' },
    ENTRY_DELETE: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Видалення запису' },
    REQUEST_CREATE: { icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/20', label: 'Нова заявка' },
    REQUEST_DECISION: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Рішення заявки' },
    PRICE_UPDATE: { icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Зміна ціни' },
  };
  return styles[action] || { icon: Eye, color: 'text-zinc-400', bg: 'bg-zinc-500/20', label: action };
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
function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (key === 'role') {
    const badge = getRoleBadge(String(value));
    return badge.label.replace(/[\ud83d\udc51\u2b50\ud83d\udee1\ufe0f\ud83c\udf7a\ud83c\udf3f\u2705]/g, '').trim();
  }
  if (key === 'status') {
    const statuses: Record<string, string> = {
      PENDING: '⏳ Очікує',
      APPROVED: '✅ Схвалено',
      REJECTED: '❌ Відхилено',
      PAID: '💰 Оплачено',
      UNPAID: '⏳ Не оплачено',
    };
    return statuses[String(value)] || String(value);
  }
  if (key === 'type') {
    return value === 'ALCO' ? '🍺 Алко' : value === 'PETRA' ? '🌿 Петра' : String(value);
  }
  if (key === 'amount' && typeof value === 'number') {
    return `${value.toFixed(2)} ₴`;
  }
  if (key === 'stars' && typeof value === 'number') {
    return '⭐'.repeat(value);
  }
  if (key === 'date' && typeof value === 'string') {
    return new Date(value).toLocaleDateString('uk-UA');
  }
  if (typeof value === 'boolean') {
    return value ? '✅ Так' : '❌ Ні';
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
    isBlocked: 'Блокування',
    isApproved: 'Підтверджений',
    screenshotPath: 'Скріншот',
    cardLastDigits: 'Карта',
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
                    {/* Before */}
                    <div className="bg-zinc-900 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Було</span>
                      </div>
                      {beforeData ? (
                        <div className="space-y-2">
                          {Object.entries(beforeData).filter(([k]) => k !== 'screenshotPath').map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                              <span className="text-xs text-zinc-500">{getFieldLabel(key)}</span>
                              <span className="text-sm font-medium text-zinc-300">{formatValue(key, value)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">Немає даних</span>
                      )}
                    </div>

                    {/* After */}
                    <div className="bg-zinc-900 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Стало</span>
                      </div>
                      {afterData ? (
                        <div className="space-y-2">
                          {Object.entries(afterData).filter(([k]) => k !== 'screenshotPath').map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                              <span className="text-xs text-zinc-500">{getFieldLabel(key)}</span>
                              <span className="text-sm font-medium text-emerald-300">{formatValue(key, value)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">Немає даних</span>
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

