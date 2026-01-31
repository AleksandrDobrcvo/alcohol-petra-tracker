"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Beer, 
  Sprout, 
  Star, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Wallet,
  History,
  Info,
  RefreshCcw,
  User,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type PricingItem = {
  type: "ALCO" | "PETRA";
  stars: number;
  price: number;
};

type EntryRow = {
  id: string;
  date: string;
  type: "ALCO" | "PETRA";
  stars: number;
  quantity: number;
  amount: string;
  paymentStatus: "PAID" | "UNPAID";
  paidAt: string | null;
  submitter: { id: string; name: string };
};

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

function StatusBadge({ status }: { status: RequestRow["status"] }) {
  if (status === "PENDING") return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] backdrop-blur-md"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      ОЧІКУЄ
    </motion.span>
  );
  if (status === "APPROVED") return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-md"
    >
      <div className="relative flex h-2 w-2">
        <div className="absolute inset-0 rounded-full bg-emerald-500 blur-[2px] animate-pulse"></div>
        <CheckCircle className="relative w-3.5 h-3.5" />
      </div>
      СХВАЛЕНО
    </motion.span>
  );
  return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] backdrop-blur-md"
    >
      <XCircle className="w-3.5 h-3.5" /> ВІДМОВА
    </motion.span>
  );
}

export function EntriesClient() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "MEMBER";
  const canEdit = role === "LEADER" || role === "DEPUTY" || role === "SENIOR";

  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [myRequests, setMyRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newSubmitterId, setNewSubmitterId] = useState("");
  const [newType, setNewType] = useState<"ALCO" | "PETRA">("ALCO");
  const [newStars, setNewStars] = useState(1);
  const [newQuantity, setNewQuantity] = useState(1);

  const [prices, setPrices] = useState<PricingItem[]>([]);

  // Форма заявки
  const [reqNickname, setReqNickname] = useState("");
  const [reqType, setReqType] = useState<"ALCO" | "PETRA">("ALCO");
  const [reqStars, setReqStars] = useState(1);
  const [reqQuantity, setReqQuantity] = useState(1);
  const [reqCardDigits, setReqCardDigits] = useState("");
  const [reqScreenshot, setReqScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [entriesRes, requestsRes, pricesRes] = await Promise.all([
        fetch("/api/entries", { cache: "no-store" }),
        fetch("/api/requests", { cache: "no-store" }),
        fetch("/api/admin/pricing", { cache: "no-store" }),
      ]);
      const entriesJson = (await entriesRes.json()) as { ok: boolean; data?: { entries: EntryRow[] } };
      const requestsJson = (await requestsRes.json()) as { ok: boolean; data?: { requests: RequestRow[] } };
      const pricesJson = (await pricesRes.json()) as { ok: boolean; data?: { prices: PricingItem[] } };
      
      if (!entriesJson.ok || !entriesJson.data) throw new Error("Failed to load entries");
      if (!requestsJson.ok || !requestsJson.data) throw new Error("Failed to load requests");
      
      setEntries(entriesJson.data.entries);
      setMyRequests(requestsJson.data.requests);
      if (pricesJson.ok && pricesJson.data) {
        setPrices(pricesJson.data.prices);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const unpaidAmount = useMemo(() => {
    return entries.filter(e => e.paymentStatus === 'UNPAID').reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2);
  }, [entries]);

  const paidAmount = useMemo(() => {
    return entries.filter(e => e.paymentStatus === 'PAID').reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2);
  }, [entries]);

  const estimatedPrice = useMemo(() => {
    const p = prices.find(x => x.type === reqType && x.stars === reqStars);
    return (p?.price ?? 0) * reqQuantity;
  }, [prices, reqType, reqStars, reqQuantity]);

  async function createRequest() {
    setError(null);
    setSubmitting(true);
    try {
      if (!reqNickname.trim() || !reqScreenshot || reqCardDigits.length !== 6 || reqQuantity <= 0) {
        throw new Error("Всі поля обов’язкові, а кількість має бути більше 0");
      }
      const form = new FormData();
      form.append("nickname", reqNickname.trim());
      form.append("type", reqType);
      form.append("stars", String(reqStars));
      form.append("quantity", String(reqQuantity));
      form.append("cardLastDigits", reqCardDigits);
      form.append("screenshot", reqScreenshot);
      const res = await fetch("/api/requests", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Request failed");
      setReqNickname("");
      setReqType("ALCO");
      setReqStars(1);
      setReqQuantity(1);
      setReqCardDigits("");
      setReqScreenshot(null);
      setShowRequestForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  async function createEntry() {
    setError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          submitterId: newSubmitterId,
          type: newType,
          stars: newStars,
          quantity: newQuantity,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Create failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function togglePaid(id: string, next: "PAID" | "UNPAID") {
    setError(null);
    try {
      const res = await fetch(`/api/entries/${id}/payment`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentStatus: next }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="space-y-10">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.5 }
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-400 backdrop-blur-md"
          >
            <XCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="rounded-lg bg-white/5 p-1 hover:bg-white/10 transition-all"
            >
              <XCircle className="h-4 w-4 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Header / Summary Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent p-6 backdrop-blur-xl hover:border-amber-500/30 transition-all duration-500"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.2em]">До виплати</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tighter">{unpaidAmount}</span>
            <span className="text-base font-bold text-zinc-500">₴</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Очікує переказу</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-500"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.2em]">Виплачено</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tighter">{paidAmount}</span>
            <span className="text-base font-bold text-zinc-500">₴</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Вже в грі</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/10 to-transparent p-6 backdrop-blur-xl hover:border-sky-500/30 transition-all duration-500"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-500 border border-sky-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-sky-500/80 uppercase tracking-[0.2em]">Всього в системі</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tighter">{myRequests.length}</span>
            <span className="text-base font-bold text-zinc-500 uppercase">заявок</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Загальна активність</span>
          </div>
        </motion.div>
      </div>

      {/* --- Форма подачі заявки --- */}
      {session && (
        <motion.div 
          layout
          className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl"
        >
          <div 
            className="flex items-center justify-between p-6 cursor-pointer group"
            onClick={() => setShowRequestForm(!showRequestForm)}
          >
            <div className="flex items-center gap-6">
              <div className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition-all duration-500 ${showRequestForm ? 'bg-amber-500 text-white rotate-90 scale-110 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-amber-500 border border-white/10'}`}>
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Нова заявка</h2>
                <p className="text-xs text-zinc-500">Подати скріншот на підтвердження</p>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-zinc-500 group-hover:text-white transition-colors">
              {showRequestForm ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>

          <AnimatePresence>
            {showRequestForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="p-8 pt-0 border-t border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Nickname */}
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Нікнейм в грі</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                          className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                          placeholder="Ваш ігровий нік..."
                          value={reqNickname}
                          onChange={(e) => setReqNickname(e.target.value)}
                          maxLength={32}
                        />
                      </div>
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Тип ресурсу</label>
                      <div className="flex p-1 rounded-[1.25rem] bg-black/20 border border-white/10 h-[60px]">
                        <button
                          onClick={() => setReqType("ALCO")}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${reqType === 'ALCO' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                          <Beer className="w-4 h-4" /> Алко
                        </button>
                        <button
                          onClick={() => setReqType("PETRA")}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${reqType === 'PETRA' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                          <Sprout className="w-4 h-4" /> Петра
                        </button>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Кількість зірок</label>
                      <div className="flex gap-2 h-[60px]">
                        {[1, 2, 3].map((s) => (
                          <button
                            key={s}
                            onClick={() => setReqStars(s)}
                            className={`flex-1 flex items-center justify-center rounded-[1.25rem] border transition-all ${reqStars === s ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-inner' : 'bg-black/20 border-white/10 text-zinc-600 hover:border-white/20'}`}
                          >
                            <div className="flex flex-col items-center leading-none">
                              <Star className={`w-3 h-3 mb-0.5 ${reqStars === s ? 'fill-amber-500' : ''}`} />
                              <span className="text-xs font-black">{s}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Кількість (штук)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 py-4 px-6 text-white text-center font-black focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all h-[60px]"
                        value={reqQuantity}
                        onChange={(e) => setReqQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      />
                    </div>

                    {/* Card Last 6 Digits */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">6 цифр карти</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 py-4 px-6 text-white text-center font-black focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all h-[60px]"
                        value={reqCardDigits}
                        onChange={(e) => setReqCardDigits(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    {/* Screenshot */}
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Доказ (Скріншот)</label>
                      <div className={`relative group/file flex items-center justify-center rounded-[1.5rem] border-2 border-dashed transition-all p-8 ${reqScreenshot ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setReqScreenshot(e.target.files?.[0] ?? null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="text-center">
                          <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${reqScreenshot ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-500'}`}>
                            <ImageIcon className="w-6 h-6" />
                          </div>
                          <p className={`text-sm font-bold ${reqScreenshot ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {reqScreenshot ? reqScreenshot.name : 'Натисніть або перетягніть скрін'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Info / Estimate */}
                    <div className="lg:col-span-2 flex items-center gap-6 rounded-[1.5rem] bg-amber-500/5 border border-amber-500/10 p-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                        <Info className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em]">Приблизна виплата</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-white">{estimatedPrice.toFixed(2)}</span>
                          <span className="text-sm font-bold text-zinc-500 uppercase">гривень</span>
                        </div>
                      </div>
                      <Button 
                        size="lg"
                        className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black shadow-xl shadow-amber-500/20"
                        onClick={createRequest} 
                        disabled={submitting || !reqNickname.trim() || !reqScreenshot}
                      >
                        {submitting ? "ВІДПРАВКА..." : "ПОДАТИ ЗАЯВКУ"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* --- Main Content Tabs --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- Всі заявки --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-1 w-6 bg-amber-500 rounded-full" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Всі заявки</h2>
          </div>

          <div className="space-y-3">
            {myRequests.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/5 bg-white/[0.01] p-10 text-center">
                <p className="text-zinc-600 font-medium text-sm">Заявок ще немає</p>
              </div>
            ) : (
              myRequests.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${r.type === 'ALCO' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                        {r.type === 'ALCO' ? <Beer className="w-5 h-5" /> : <Sprout className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm leading-none">{r.nickname}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                          <span className="font-mono">{r.quantity} шт</span>
                          <span>•</span>
                          <span className="font-bold text-zinc-300">{Number(r.amount).toFixed(2)} ₴</span>
                          {r.cardLastDigits && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-zinc-400">💳 *{r.cardLastDigits}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[9px] text-zinc-600 uppercase font-black text-right hidden sm:block">
                        {r.submitter.name}
                      </div>
                      <a
                        href={r.screenshotPath}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  {r.decisionNote && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-[10px] text-red-400">
                      <strong>Відмова:</strong> {r.decisionNote}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* --- Історія записів --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-1 w-6 bg-emerald-500 rounded-full" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Історія виплат</h2>
            </div>
            <button 
              onClick={load}
              className={`p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/5 bg-white/[0.01] p-10 text-center">
                <p className="text-zinc-600 font-medium text-sm">Записів ще немає</p>
              </div>
            ) : (
              entries.map((e, idx) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between group overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${e.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[40px]">
                      <div className="text-[9px] font-black text-zinc-600 uppercase leading-none">{new Date(e.date).toLocaleDateString('uk-UA', { month: 'short' })}</div>
                      <div className="text-lg font-black text-white leading-tight">{new Date(e.date).getDate()}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{e.submitter.name}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-md border transition-all ${
                          e.paymentStatus === 'PAID' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                        }`}>
                          {e.paymentStatus === 'PAID' ? 'ОПЛАЧЕНО' : 'В ЧЕРЗІ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                        <span>{e.type === 'ALCO' ? '🍺 Алко' : '💎 Петра'}</span>
                        <span>•</span>
                        <span>{e.stars} ⭐</span>
                        <span>•</span>
                        <span>{e.quantity} шт</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-white leading-none">{Number(e.amount).toFixed(2)}</div>
                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Гривень</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
