"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Shield, User, FileText, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { MultiRoleBadges } from "@/components/ui/RoleBadge";

type AuditActor = {
  id: string;
  name: string;
  role: string;
};

type AuditRow = {
  id: string;
  createdAt: string;
  action: string;
  targetType: string;
  targetId: string;
  before: unknown;
  after: unknown;
  actor: AuditActor;
};

function parseJson(value: unknown): any | null {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildSummary(row: AuditRow) {
  const before = parseJson(row.before);
  const after = parseJson(row.after);

  switch (row.action) {
    case "REQUEST_CREATE": {
      const type = after?.type === "ALCO" ? "Алко" : "Петра";
      const total = after?.totalAmount ? Number(after.totalAmount).toFixed(0) + " ₴" : "";
      return {
        title: `Нова заявка · ${type}`,
        subtitle: total ? `Сума: ${total}` : undefined,
      };
    }
    case "REQUEST_DECISION": {
      const status = after?.status ?? after?.entriesCount ? "APPROVED" : before?.status;
      const label =
        status === "APPROVED"
          ? "Заявку схвалено"
          : status === "REJECTED"
          ? "Заявку відхилено"
          : "Оновлення заявки";
      return {
        title: label,
        subtitle: after?.decisionNote ? `Коментар: ${after.decisionNote}` : undefined,
      };
    }
    case "ENTRY_CREATE":
    case "ENTRY_CREATE_FROM_REQUEST": {
      const type = after?.type === "ALCO" ? "Алко" : after?.type === "PETRA" ? "Петра" : "Запис";
      const qty = after?.quantity ?? 0;
      const amount = after?.amount ? Number(after.amount).toFixed(0) + " ₴" : "";
      return {
        title: `Новий запис · ${type}`,
        subtitle: `${qty} шт · ${amount}`,
      };
    }
    case "USER_NAME_CHANGE": {
      const from = before?.name;
      const to = after?.name;
      return {
        title: "Змінено нік користувача",
        subtitle: from && to ? `${from} → ${to}` : to ?? from,
      };
    }
    case "USER_ROLE_CHANGE": {
      const from = before?.role;
      const to = after?.role;
      return {
        title: "Оновлено роль",
        subtitle: from && to ? `${from} → ${to}` : to ?? from,
      };
    }
    case "USER_APPROVE_CHANGE": {
      const ok = Boolean(after?.isApproved);
      return {
        title: ok ? "Акаунт підтверджено" : "Підтвердження акаунту скасовано",
      };
    }
    default:
      return {
        title: row.action,
      };
  }
}

export function ClanActivityFeed() {
  const [items, setItems] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/activity", { cache: "no-store" });
        const json = (await res.json()) as { ok: boolean; data?: { logs: AuditRow[] } };
        if (!json.ok || !json.data) throw new Error("Не вдалося завантажити стрічку");
        setItems(json.data.logs);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <section className="relative z-10 mt-8 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-semibold uppercase tracking-[0.18em]">
            Стрічка активності клану
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-zinc-500">
          <Clock className="w-3 h-3" />
          <span>Показано останні 100 подій</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-white/5 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {items.map((row, idx) => {
            const when = formatWhen(row.createdAt);
            const summary = buildSummary(row);
            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.01 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-white/15">
                    <User className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {row.actor.name}
                      </span>
                      <MultiRoleBadges
                        primaryRole={row.actor.role}
                        additionalRoles={[]}
                        size="sm"
                        maxVisible={1}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-xs text-zinc-300">
                      <span>{summary.title}</span>
                      {summary.subtitle && (
                        <>
                          <ArrowRight className="w-3 h-3 text-zinc-500" />
                          <span className="text-zinc-400">{summary.subtitle}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-[11px] text-zinc-500">
                  <span>{when}</span>
                </div>
              </motion.div>
            );
          })}
          {items.length === 0 && !loading && !error && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-6 text-center text-xs text-zinc-500">
              Поки що активності немає. Зроби перший внесок або заявку — і тут з'являться події.
            </div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}

