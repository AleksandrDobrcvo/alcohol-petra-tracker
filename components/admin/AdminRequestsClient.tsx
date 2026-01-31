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
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type RequestRow = {
  id: string;
  date: string;
  type: "ALCO" | "PETRA";
  stars: number;
  quantity: number;
  amount: number;
  nickname: string;
  screenshotPath: string;
  cardLastDigits: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decisionNote: string | null;
  submitter: { id: string; name: string };
  decidedBy: { id: string; name: string } | null;
};

export function AdminRequestsClient() {
  const [items, setItems] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const [type, setType] = useState<"ALL" | "ALCO" | "PETRA">("ALL");
  const [status, setStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  async function load() {
    setLoading(true);
    setError(null);
    try {
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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Невідома помилка");
    }
  }

  return (
    <div className="space-y-6">
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
              >
                <div className="flex flex-1 items-center gap-6">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border shadow-lg transition-transform group-hover:scale-110 ${
                    r.type === 'ALCO' 
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' 
                      : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'
                  }`}>
                    {r.type === 'ALCO' ? <Beer className="w-8 h-8" /> : <Sprout className="w-8 h-8" />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-lg">{r.nickname}</h4>
                      <span className="text-[10px] text-zinc-600 font-mono">ID: {r.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span>{r.submitter.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span>⭐ {r.stars}</span>
                        <span className="text-zinc-600 px-1">•</span>
                        <span>{r.amount.toFixed(2)} ₴</span>
                        {r.cardLastDigits && (
                          <>
                            <span className="text-zinc-600 px-1">•</span>
                            <span className="text-amber-500 font-mono text-xs">💳 *{r.cardLastDigits}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs opacity-60">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(r.date).toLocaleString('uk-UA')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedImg(r.screenshotPath)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5 transition-all"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <div className="h-10 w-px bg-white/10 hidden md:block" />

                  <div className="flex items-center gap-2">
                    {r.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => decide(r.id, 'APPROVED')}
                          className="flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 px-6 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          СХВАЛИТИ
                        </button>
                        <button
                          onClick={() => decide(r.id, 'REJECTED')}
                          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-inner"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-end">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg transition-all ${
                            r.status === 'APPROVED' 
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' 
                              : 'bg-red-500/20 border-red-500/30 text-red-400 shadow-red-500/10'
                          }`}
                        >
                          {r.status === 'APPROVED' ? (
                            <>
                              <div className="relative flex h-2 w-2">
                                <div className="absolute inset-0 rounded-full bg-emerald-500 blur-[2px] animate-pulse"></div>
                                <CheckCircle2 className="relative w-3 h-3" />
                              </div>
                              СХВАЛЕНО
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              ВІДХИЛЕНО
                            </>
                          )}
                        </motion.div>
                        {r.decisionNote && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500 italic max-w-[200px] truncate bg-white/5 px-2 py-1 rounded-lg">
                            <MessageSquare className="w-3 h-3" />
                            {r.decisionNote}
                          </div>
                        )}
                      </div>
                    )}
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
