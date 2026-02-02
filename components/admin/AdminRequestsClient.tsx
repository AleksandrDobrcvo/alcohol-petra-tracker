"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Beer, 
  Sprout, 
  ImageIcon, 
  MessageSquare,
  Search,
  Filter,
  Eye,
  ExternalLink,
  RefreshCcw,
  Trash2,
  Calendar,
  CreditCard,
  Hash,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/components/ui/Toast";
import { MultiRoleBadges, RoleDef } from "@/components/ui/RoleBadge";

type UserMinimal = {
  id: string;
  name: string;
  role: string;
  discordId: string;
  additionalRoles?: string[];
};

type RequestRow = {
  id: string;
  date: string;
  type: "ALCO" | "PETRA";
  stars1Qty: number;
  stars2Qty: number;
  stars3Qty: number;
  totalAmount: number;
  nickname: string;
  screenshotPath: string;
  cardLastDigits: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decisionNote: string | null;
  submitter: UserMinimal;
  decidedBy: UserMinimal | null;
  createdAt: string;
};

export function AdminRequestsClient() {
  const { success, error: notifyError } = useNotifications();
  const [items, setItems] = useState<RequestRow[]>([]);
  const [roleDefs, setRoleDefs] = useState<RoleDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const [type, setType] = useState<"ALL" | "ALCO" | "PETRA">("ALL");
  const [status, setStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // Load roles first if not loaded
      if (roleDefs.length === 0) {
        const rolesRes = await fetch("/api/admin/roles");
        const rolesJson = await rolesRes.json();
        if (rolesJson.ok) setRoleDefs(rolesJson.data.roles);
      }

      const qs = new URLSearchParams();
      if (type !== "ALL") qs.set("type", type);
      if (status !== "ALL") qs.set("status", status);
      const res = await fetch(`/api/requests?${qs.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as { ok: boolean; data?: { requests: RequestRow[] }; error?: { message: string } };
      if (!json.ok || !json.data) throw new Error(json.error?.message ?? "Не вдалося завантажити заявки");
      setItems(json.data.requests);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Невідома помилка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [type, status]);

  async function decide(id: string, next: "APPROVED" | "REJECTED") {
    const note = window.prompt(next === "REJECTED" ? "Причина відмови:" : "Коментар (необовʼязково):") ?? undefined;
    if (next === "REJECTED" && note === undefined) return;

    setError(null);
    try {
      const res = await fetch(`/api/requests/${id}/decision`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next, note }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Не вдалося зберегти рішення");
      
      // Show success notification
      if (next === "APPROVED") {
        success("Заявку схвалено! ✅", "Виплата буде виконана");
      } else {
        success("Заявку відхилено", note || "Без коментаря");
      }
      
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Невідома помилка";
      setError(msg);
      notifyError("Помилка", msg);
    }
  }

  async function deleteRequest(id: string) {
    if (!confirm("Ви впевнені, що хочете видалити цю заявку? Це не видалить пов'язані записи виплат.")) return;
    setError(null);
    try {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Не вдалося видалити");
      success("Заявку видалено", "");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Помилка";
      setError(msg);
      notifyError("Помилка", msg);
    }
  }

  return (
    <div className="space-y-6">
      {/* Підказка для адмінів */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/5 border border-amber-500/10">
        <div className="flex items-start gap-2 sm:gap-3">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[10px] sm:text-xs text-amber-300/80 space-y-0.5 sm:space-y-1">
            <p className="font-bold text-amber-300">👀 Перевірка заявок:</p>
            <p>1. Натисніть 🖼️ щоб переглянути скрін</p>
            <p className="hidden sm:block">2. Перевірте кількість і тип ресурсу</p>
            <p><span className="text-emerald-400 font-bold">СХВАЛИТИ</span> = виплата • <span className="text-red-400 font-bold">ВІДХИЛИТИ</span> = вказати причину</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  status === s 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {s === 'ALL' ? 'Всі' : s === 'PENDING' ? 'Очікують' : s === 'APPROVED' ? 'Схвалені' : 'Відхилені'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-xl">
            {(['ALL', 'ALCO', 'PETRA'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  type === t ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-400'
                }`}
              >
                {t === 'ALCO' && <Beer className="w-3 h-3" />}
                {t === 'PETRA' && <Sprout className="w-3 h-3" />}
                {t === 'ALL' ? 'Всі типи' : t === 'ALCO' ? 'Алко' : 'Петра'}
              </button>
            ))}
          </div>
          <button 
            onClick={load}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/5 border border-white/10" />
            ))
          ) : items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-zinc-600">
                <Clock className="w-8 h-8" />
              </div>
              <p className="text-zinc-500 font-medium">Заявок не знайдено</p>
            </motion.div>
          ) : (
            items.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 shadow-2xl"
              >
                {/* Status Badge - Floating Top Right */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                  {r.status === 'PENDING' ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-widest uppercase">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Очікує
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      r.status === 'APPROVED' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {r.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {r.status === 'APPROVED' ? 'Схвалено' : 'Відхилено'}
                    </div>
                  )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column: Resource & Main Info */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start gap-5">
                      <div className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-[1.5rem] border-2 shadow-2xl ${
                        r.type === 'ALCO' 
                          ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' 
                          : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'
                      }`}>
                        {r.type === 'ALCO' ? <Beer className="w-8 h-8 sm:w-10 sm:h-10" /> : <Sprout className="w-8 h-8 sm:w-10 sm:h-10" />}
                      </div>
                      
                      <div className="space-y-1 pt-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">{r.nickname}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-500">
                            #{r.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-zinc-500" />
                            <span>{new Date(r.createdAt).toLocaleString('uk-UA')}</span>
                          </div>
                          {r.cardLastDigits && (
                            <div className="flex items-center gap-1.5 text-amber-500/80 font-mono">
                              <CreditCard className="w-4 h-4" />
                              <span>**** {r.cardLastDigits}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { stars: 1, qty: r.stars1Qty },
                        { stars: 2, qty: r.stars2Qty },
                        { stars: 3, qty: r.stars3Qty }
                      ].filter(s => s.qty > 0).map(s => (
                        <div key={s.stars} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Рівень {s.stars}</span>
                          <span className="text-lg font-black text-white">⭐ {s.qty}</span>
                        </div>
                      ))}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-emerald-500/70 uppercase mb-1">Всього</span>
                        <span className="text-lg font-black text-emerald-400">{r.totalAmount.toFixed(0)}₴</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Attribution & Actions */}
                  <div className="flex flex-col justify-between gap-6 min-w-[280px]">
                    <div className="space-y-4">
                      {/* Submitter Info */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <User className="w-3 h-3" /> Подав заявку
                        </span>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{r.submitter.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500">@{r.submitter.discordId}</span>
                          </div>
                          <MultiRoleBadges 
                            primaryRole={r.submitter.role} 
                            additionalRoles={r.submitter.additionalRoles}
                            roleDefs={roleDefs}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Decider Info (if applicable) */}
                      {r.decidedBy && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Опрацював
                          </span>
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white">{r.decidedBy.name}</span>
                              <span className="text-[10px] font-mono text-emerald-500/50">@{r.decidedBy.discordId}</span>
                            </div>
                            <MultiRoleBadges 
                              primaryRole={r.decidedBy.role} 
                              additionalRoles={r.decidedBy.additionalRoles}
                              roleDefs={roleDefs}
                              size="sm"
                            />
                            {r.decisionNote && (
                              <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-black/20 text-xs text-zinc-400 italic">
                                <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                                {r.decisionNote}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedImg(r.screenshotPath)}
                        className="flex-1 flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10 transition-all font-bold text-sm"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Скріншот
                      </button>

                      {r.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => decide(r.id, 'APPROVED')}
                            className="h-12 px-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            СХВАЛИТИ
                          </button>
                          <button
                            onClick={() => decide(r.id, 'REJECTED')}
                            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                            title="Відхилити"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => deleteRequest(r.id)}
                          className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 text-zinc-500 border border-white/10 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                          title="Видалити зі списку"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImg(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-full max-w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
            >
              <img 
                src={selectedImg} 
                alt="Screenshot" 
                className="max-h-[85vh] w-auto object-contain"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <a 
                  href={selectedImg} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setSelectedImg(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
