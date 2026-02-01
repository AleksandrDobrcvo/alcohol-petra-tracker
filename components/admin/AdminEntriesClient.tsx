"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  RefreshCcw, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Beer,
  Sprout,
  Save,
  ChevronDown,
  Plus,
  DollarSign,
  Calendar,
  Wallet,
  ArrowRight,
  Star,
  Info,
  Eye,
  X,
  Image as ImageIcon,
  Shield,
  Crown,
  History,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// Role badge helper component
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; color: string }> = {
    LEADER: { label: '👑 Лідер', color: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black' },
    DEPUTY: { label: '⭐ Заступник', color: 'bg-gradient-to-r from-amber-400 to-orange-400 text-black' },
    SENIOR: { label: '🛡️ Старший', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
    ALCO_STAFF: { label: '🍺 Алко', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    PETRA_STAFF: { label: '🌿 Петра', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    MEMBER: { label: '✅ Учасник', color: 'bg-sky-500/20 text-sky-300 border border-sky-500/30' },
  };
  const c = config[role] || { label: role, color: 'bg-zinc-500/20 text-zinc-300' };
  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${c.color}`}>
      {c.label}
    </span>
  );
}

type PricingItem = {
  type: "ALCO" | "PETRA";
  stars: number;
  price: number;
};

type Entry = {
  id: string;
  date: string;
  type: "ALCO" | "PETRA";
  stars: number;
  quantity: number;
  amount: number;
  paymentStatus: "PAID" | "UNPAID";
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  submitter: { id: string; name: string; role: string };
  createdBy: { id: string; name: string; role: string };
  updatedBy?: { id: string; name: string; role: string } | null;
  entryRequest?: {
    id: string;
    nickname: string;
    screenshotPath: string;
    status: string;
    decidedAt?: string;
    decisionNote?: string;
    cardLastDigits?: string;
    createdAt: string;
    decidedBy?: { id: string; name: string; role: string } | null;
  } | null;
};

export function AdminEntriesClient() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [prices, setPrices] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "ALCO" | "PETRA">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PAID" | "UNPAID">("ALL");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ 
    stars: number; 
    type: "ALCO" | "PETRA";
    quantity: number;
    amount: number;
  } | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [detailEntry, setDetailEntry] = useState<Entry | null>(null);
  const [addForm, setAddForm] = useState<{
    userId: string;
    type: "ALCO" | "PETRA";
    stars: number;
    quantity: number;
  }>({ userId: "", type: "ALCO", stars: 1, quantity: 1 });
  const [users, setUsers] = useState<{ id: string, name: string }[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [entriesRes, pricesRes, usersRes] = await Promise.all([
        fetch("/api/entries", { cache: "no-store" }),
        fetch("/api/admin/pricing", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" })
      ]);
      
      const eJson = await entriesRes.json();
      const pJson = await pricesRes.json();
      const uJson = await usersRes.json();
      
      if (!eJson.ok) throw new Error(eJson.error?.message || "Failed to load entries");
      if (!pJson.ok) throw new Error("Failed to load prices");
      if (!uJson.ok) throw new Error("Failed to load users");
      
      setEntries(eJson.data.entries);
      setPrices(pJson.data.prices);
      setUsers(uJson.data.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function createManualEntry() {
    if (!addForm.userId) return alert("Виберіть користувача");
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          date: new Date().toISOString(),
          submitterId: addForm.userId
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Create failed");
      setShowAddModal(false);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => { load(); }, []);

  // Auto-calculate amount for edit form
  useEffect(() => {
    if (editForm) {
      const p = prices.find(x => x.type === editForm.type && x.stars === editForm.stars);
      const newAmount = (p?.price ?? 0) * editForm.quantity;
      if (newAmount !== editForm.amount) {
        setEditForm(prev => prev ? { ...prev, amount: newAmount } : null);
      }
    }
  }, [editForm?.stars, editForm?.type, editForm?.quantity, prices]);

  async function deleteEntry(id: string) {
    if (!confirm("Ви впевнені, що хочете видалити цей запис?")) return;
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (res.ok) await load();
    } catch (e) {
      alert("Error deleting");
    }
  }

  async function updateEntry(id: string) {
    if (!editForm) return;
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Update failed");
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error updating");
    }
  }

  async function togglePayment(id: string, current: string) {
    try {
      const res = await fetch(`/api/entries/${id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: current === "PAID" ? "UNPAID" : "PAID" }),
      });
      if (res.ok) await load();
    } catch (e) {
      alert("Error updating payment");
    }
  }

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = e.submitter.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "ALL" || e.type === filterType;
      const matchesStatus = filterStatus === "ALL" || e.paymentStatus === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entries, search, filterType, filterStatus]);

  const stats = useMemo(() => {
    const total = filtered.reduce((acc, e) => acc + e.amount, 0);
    const unpaid = filtered.filter(e => e.paymentStatus === "UNPAID").reduce((acc, e) => acc + e.amount, 0);
    const paid = total - unpaid;
    return { total, unpaid, paid };
  }, [filtered]);

  return (
    <div className="space-y-8 pb-20">
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Всього нараховано</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.total.toFixed(2)} ₴</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Виплачено</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.paid.toFixed(2)} ₴</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-500">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Борг (Очікує)</span>
          </div>
          <div className="text-2xl font-black text-red-400">{stats.unpaid.toFixed(2)} ₴</div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Пошук за ніком..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 border border-white/10">
            {(['ALL', 'ALCO', 'PETRA'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === t ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t === 'ALL' ? 'Всі' : t === 'ALCO' ? '🍺 Алко' : '🌿 Петра'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 border border-white/10">
            {(['ALL', 'PAID', 'UNPAID'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === s ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {s === 'ALL' ? 'Статус' : s === 'PAID' ? '✅ Оплачено' : '⏳ Очікує'}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-black text-white hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Створити запис
        </button>

        <button 
          onClick={load} 
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-6 py-3 text-sm font-bold text-zinc-300 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Оновити
        </button>
      </div>

      {/* List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/5 border border-white/10" />
            ))
          ) : filtered.length > 0 ? (
            filtered.map((e, idx) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 ${
                  editingId === e.id 
                    ? 'border-amber-500/50 bg-amber-500/5 shadow-2xl shadow-amber-500/10' 
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 transition-transform group-hover:scale-110 duration-500 ${
                        e.type === 'ALCO' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      }`}>
                        {e.type === 'ALCO' ? <Beer className="w-8 h-8" /> : <Sprout className="w-8 h-8" />}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-black text-white tracking-tight">{e.submitter.name}</h4>
                          <div className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter border ${
                            e.type === 'ALCO' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                          }`}>
                            {e.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="text-white">{e.stars} зірок</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <Plus className="w-3 h-3" />
                            <span>{e.quantity} шт</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(e.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-black text-white tracking-tighter">
                          {e.amount.toFixed(2)} <span className="text-sm font-bold text-zinc-500 ml-1">₴</span>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Сума виплати</p>
                      </div>

                      <div className="h-10 w-px bg-white/10 hidden md:block" />

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePayment(e.id, e.paymentStatus)}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                            e.paymentStatus === 'PAID' 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105' 
                              : 'bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {e.paymentStatus === 'PAID' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {e.paymentStatus === 'PAID' ? 'Виплачено' : 'Очікує'}
                        </button>

                        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                          <button 
                            onClick={() => setDetailEntry(e)}
                            className="p-2 text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all"
                            title="Деталі"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (editingId === e.id) {
                                setEditingId(null);
                                setEditForm(null);
                              } else {
                                setEditingId(e.id);
                                setEditForm({ stars: e.stars, type: e.type, quantity: e.quantity || 1, amount: e.amount });
                              }
                            }}
                            className={`p-2 rounded-lg transition-all ${editingId === e.id ? 'bg-amber-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/10'}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteEntry(e.id)}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Panel */}
                  <AnimatePresence>
                    {editingId === e.id && editForm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-white/10 grid gap-6 sm:grid-cols-4 items-end">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Тип ресурсу</label>
                            <select 
                              className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all appearance-none"
                              value={editForm.type}
                              onChange={(ev) => setEditForm(f => f ? {...f, type: ev.target.value as any} : null)}
                            >
                              <option value="ALCO">🍺 Алкоголь</option>
                              <option value="PETRA">🌿 Петра</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Зірки</label>
                            <div className="flex items-center gap-2 bg-zinc-950/60 border border-white/10 rounded-xl p-1">
                              {[1, 2, 3].map(s => (
                                <button
                                  key={s}
                                  onClick={() => setEditForm(f => f ? {...f, stars: s} : null)}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    editForm.stars === s ? 'bg-amber-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {s}⭐
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Кількість</label>
                            <input 
                              type="number" min="1"
                              className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-black focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                              value={editForm.quantity}
                              onChange={(ev) => setEditForm(f => f ? {...f, quantity: parseInt(ev.target.value) || 1} : null)}
                            />
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={() => updateEntry(e.id)}
                              className="flex-1 bg-gradient-to-br from-amber-400 to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl py-3 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              Зберегти
                            </button>
                            <button 
                              onClick={() => { setEditingId(null); setEditForm(null); }}
                              className="px-4 bg-white/5 text-zinc-400 font-bold text-xs uppercase rounded-xl hover:bg-white/10 transition-all"
                            >
                              Скасувати
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between px-2">
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                            <Info className="w-3 h-3" />
                            Авто-перерахунок суми активований
                          </div>
                          <div className="text-sm font-black text-amber-500">
                             ≈ {editForm.amount.toFixed(2)} ₴
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-4"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-700">
                <Search className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Записів не знайдено</h3>
                <p className="text-sm text-zinc-500 mt-1">Спробуйте змінити параметри пошуку або фільтри</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-zinc-900 p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Plus className="w-40 h-40" />
              </div>

              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Новий запис</h2>
                  <p className="text-zinc-500 text-sm mt-1">Ручне додавання виплати для користувача</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Користувач</label>
                    <select 
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none shadow-inner"
                      value={addForm.userId}
                      onChange={(e) => setAddForm(f => ({ ...f, userId: e.target.value }))}
                    >
                      <option value="">Виберіть зі списку...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Тип</label>
                      <div className="flex p-1 rounded-2xl bg-zinc-950 border border-white/10 h-[60px]">
                        <button
                          onClick={() => setAddForm(f => ({ ...f, type: "ALCO" }))}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${addForm.type === 'ALCO' ? 'bg-amber-500 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}
                        >
                          <Beer className="w-4 h-4" /> Алко
                        </button>
                        <button
                          onClick={() => setAddForm(f => ({ ...f, type: "PETRA" }))}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${addForm.type === 'PETRA' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}
                        >
                          <Sprout className="w-4 h-4" /> Петра
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Зірки</label>
                      <div className="flex p-1 rounded-2xl bg-zinc-950 border border-white/10 h-[60px]">
                        {[1, 2, 3].map(s => (
                          <button
                            key={s}
                            onClick={() => setAddForm(f => ({ ...f, stars: s }))}
                            className={`flex-1 rounded-xl text-sm font-black transition-all ${addForm.stars === s ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                          >
                            {s}⭐
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Кількість одиниць</label>
                      <div className="relative">
                        <input 
                          type="number" min="1"
                          className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-4 text-white font-black text-center text-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-inner"
                          value={addForm.quantity}
                          onChange={(e) => setAddForm(f => ({ ...f, quantity: Math.max(1, parseInt(e.target.value) || 0) }))}
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700">
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2 mt-1">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Орієнтовна сума:</span>
                        <span className="text-sm font-black text-amber-500">
                          {((prices.find(p => p.type === addForm.type && p.stars === addForm.stars)?.price ?? 0) * addForm.quantity).toFixed(2)} ₴
                        </span>
                      </div>
                    </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 rounded-2xl bg-white/5 py-4 text-sm font-black text-zinc-500 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                      Скасувати
                    </button>
                    <button
                      onClick={createManualEntry}
                      className="flex-[2] rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 py-4 text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Створити запис
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {detailEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailEntry(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 bg-zinc-900 shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/95 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${detailEntry.type === 'ALCO' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    {detailEntry.type === 'ALCO' ? <Beer className="w-7 h-7" /> : <Sprout className="w-7 h-7" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Деталі запису</h2>
                    <p className="text-xs text-zinc-500 font-mono">ID: {detailEntry.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailEntry(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Main Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Тип</p>
                    <p className="text-lg font-black text-white">{detailEntry.type === 'ALCO' ? '🍺 Алко' : '🌿 Петра'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Зірки</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: detailEntry.stars }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Кількість</p>
                    <p className="text-lg font-black text-white">{detailEntry.quantity} шт</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Сума</p>
                    <p className="text-lg font-black text-amber-500">{detailEntry.amount.toFixed(2)} ₴</p>
                  </div>
                </div>

                {/* Status */}
                <div className={`rounded-2xl p-5 border ${detailEntry.paymentStatus === 'PAID' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {detailEntry.paymentStatus === 'PAID' ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-500" />
                      )}
                      <div>
                        <p className="font-black text-white text-lg">
                          {detailEntry.paymentStatus === 'PAID' ? 'Виплачено' : 'Очікує виплати'}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {detailEntry.paymentStatus === 'PAID' && detailEntry.paidAt 
                            ? `Виплачено: ${new Date(detailEntry.paidAt).toLocaleString()}` 
                            : 'Статус оплати'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* People Involved */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-widest">
                    <User className="w-4 h-4" />
                    Учасники
                  </h3>
                  
                  <div className="grid gap-3">
                    {/* Submitter */}
                    <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Отримувач</p>
                        <p className="font-bold text-white">{detailEntry.submitter.name}</p>
                      </div>
                      <RoleBadge role={detailEntry.submitter.role} />
                    </div>

                    {/* Created By */}
                    <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Створив</p>
                        <p className="font-bold text-white">{detailEntry.createdBy.name}</p>
                        <p className="text-[10px] text-zinc-600">{new Date(detailEntry.createdAt).toLocaleString()}</p>
                      </div>
                      <RoleBadge role={detailEntry.createdBy.role} />
                    </div>

                    {/* Updated By */}
                    {detailEntry.updatedBy && (
                      <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                          <Edit2 className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Останнє редагування</p>
                          <p className="font-bold text-white">{detailEntry.updatedBy.name}</p>
                          <p className="text-[10px] text-zinc-600">{new Date(detailEntry.updatedAt).toLocaleString()}</p>
                        </div>
                        <RoleBadge role={detailEntry.updatedBy.role} />
                      </div>
                    )}

                    {/* Request Approver */}
                    {detailEntry.entryRequest?.decidedBy && (
                      <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Заявку схвалив</p>
                          <p className="font-bold text-white">{detailEntry.entryRequest.decidedBy.name}</p>
                          <p className="text-[10px] text-zinc-600">
                            {detailEntry.entryRequest.decidedAt && new Date(detailEntry.entryRequest.decidedAt).toLocaleString()}
                          </p>
                        </div>
                        <RoleBadge role={detailEntry.entryRequest.decidedBy.role} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Info */}
                {detailEntry.entryRequest && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-widest">
                      <FileText className="w-4 h-4" />
                      Заявка
                    </h3>
                    
                    <div className="rounded-2xl bg-white/5 p-5 border border-white/5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Нікнейм</p>
                          <p className="font-bold text-white">{detailEntry.entryRequest.nickname}</p>
                        </div>
                        {detailEntry.entryRequest.cardLastDigits && (
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Карта</p>
                            <p className="font-bold text-white font-mono">💳 *{detailEntry.entryRequest.cardLastDigits}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Screenshot */}
                      {detailEntry.entryRequest.screenshotPath && (
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Скріншот</p>
                          <img 
                            src={detailEntry.entryRequest.screenshotPath} 
                            alt="Скріншот" 
                            className="max-h-60 rounded-xl border border-white/10 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-widest">
                    <History className="w-4 h-4" />
                    Історія
                  </h3>
                  
                  <div className="rounded-2xl bg-white/5 p-5 border border-white/5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Дата запису</span>
                        <span className="font-bold text-white">{new Date(detailEntry.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Створено</span>
                        <span className="font-bold text-white">{new Date(detailEntry.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Оновлено</span>
                        <span className="font-bold text-white">{new Date(detailEntry.updatedAt).toLocaleString()}</span>
                      </div>
                      {detailEntry.entryRequest && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500">Заявка створена</span>
                          <span className="font-bold text-white">{new Date(detailEntry.entryRequest.createdAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
