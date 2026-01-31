"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  Save, 
  RefreshCcw, 
  Beer, 
  Sprout, 
  Star,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type PricingItem = {
  type: "ALCO" | "PETRA";
  stars: number;
  price: number;
};

export function AdminPricingClient() {
  const [prices, setPrices] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      const json = await res.json();
      if (!json.ok) throw new Error("Failed to load prices");
      setPrices(json.data.prices);
    } catch (e) {
      setError("Error loading prices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updatePrice(type: string, stars: number, price: number) {
    const key = `${type}-${stars}`;
    setSaving(key);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, stars, price }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error("Failed to save");
      
      setPrices(prev => prev.map(p => 
        (p.type === type && p.stars === stars) ? { ...p, price } : p
      ));
    } catch (e) {
      alert("Error saving price");
    } finally {
      setSaving(null);
    }
  }

  const alcoPrices = useMemo(() => {
    return [1, 2, 3].map(s => {
      const found = prices.find(p => p.type === "ALCO" && p.stars === s);
      return found || { type: "ALCO" as const, stars: s, price: 0 };
    });
  }, [prices]);

  const petraPrices = useMemo(() => {
    return [1, 2, 3].map(s => {
      const found = prices.find(p => p.type === "PETRA" && p.stars === s);
      return found || { type: "PETRA" as const, stars: s, price: 0 };
    });
  }, [prices]);

  if (loading) return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="h-64 animate-pulse rounded-[2.5rem] bg-white/5 border border-white/10" />
      <div className="h-64 animate-pulse rounded-[2.5rem] bg-white/5 border border-white/10" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            Конфігурація виплат
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Встановіть вартість кожної зірки для автоматичного підрахунку</p>
        </div>
        <button 
          onClick={load} 
          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Оновити дані
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Alcohol Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-1"
        >
          <div className="relative rounded-[2.9rem] bg-zinc-950/40 p-8 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:scale-110 transition-transform duration-500">
                  <Beer className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">АЛКОГОЛЬ</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-[10px] text-amber-500/80 uppercase tracking-[0.2em] font-black">Нарахування за пиво</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {alcoPrices.length > 0 ? (
                alcoPrices.map((p: PricingItem) => (
                  <PriceCard key={`ALCO-${p.stars}`} item={p} onSave={updatePrice} isSaving={saving === `ALCO-${p.stars}`} />
                ))
              ) : (
                <div className="py-10 text-center text-zinc-600 font-medium">Дані відсутні</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Petra Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-1"
        >
          <div className="relative rounded-[2.9rem] bg-zinc-950/40 p-8 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform duration-500">
                  <Sprout className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">ПЕТРА</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] text-emerald-500/80 uppercase tracking-[0.2em] font-black">Нарахування за петру</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {petraPrices.length > 0 ? (
                petraPrices.map((p: PricingItem) => (
                  <PriceCard key={`PETRA-${p.stars}`} item={p} onSave={updatePrice} isSaving={saving === `PETRA-${p.stars}`} />
                ))
              ) : (
                <div className="py-10 text-center text-zinc-600 font-medium">Дані відсутні</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="rounded-3xl border border-amber-500/10 bg-amber-500/5 p-6 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-200">Важливо про розрахунки</h4>
            <p className="text-sm text-amber-200/60 mt-1 leading-relaxed">
              Зміна ціни вплине лише на нові записи та заявки. Вже створені записи збережуть суму, яка була актуальна на момент їх створення.
              Ціна вказується за <b>одну одиницю</b> відповідного рівня (зірок).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceCard({ item, onSave, isSaving }: { item: PricingItem, onSave: any, isSaving: boolean }) {
  const [val, setVal] = useState(item.price.toString());
  const hasChanged = parseFloat(val) !== item.price && !isNaN(parseFloat(val));

  return (
    <div className={`group relative rounded-2xl border transition-all duration-300 ${
      hasChanged ? 'border-amber-500/30 bg-amber-500/5 shadow-lg shadow-amber-500/5' : 'border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]'
    }`}>
      <div className="flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex gap-0.5 mb-1">
              {[...Array(item.stars)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
              ))}
            </div>
            <span className="text-xs font-black text-zinc-500 uppercase tracking-tighter">Рівень {item.stars}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group/input">
            <input 
              type="number" 
              step="0.01"
              className="w-28 rounded-xl border border-white/10 bg-black/60 py-2.5 pl-8 pr-3 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder-zinc-700"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="0.00"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">₴</div>
          </div>
          
          <button
            onClick={() => onSave(item.type, item.stars, parseFloat(val))}
            disabled={isSaving || !hasChanged}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 overflow-hidden ${
              hasChanged 
                ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95' 
                : 'bg-white/5 text-zinc-700 opacity-50 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <RefreshCcw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 relative z-10" />
                {hasChanged && (
                  <motion.div 
                    layoutId="glow"
                    className="absolute inset-0 bg-white/20 blur-md"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
